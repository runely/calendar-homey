'use strict'

const { momentNow } = require('../lib/moment-datetime')
const { filterByCalendar, filterBySummary, filterByUID, filterByProperty } = require('../lib/filter-by')
const sortEvent = require('../lib/sort-event')
const convertToMinutes = require('../lib/convert-to-minutes')
const getNextEventValue = require('../lib/get-next-event-value')
const { updateNextEventWithTokens } = require('./update-tokens')
const { triggerSynchronizationError } = require('./trigger-cards')
const { isEventOngoing, isEventIn, willEventNotIn } = require('./conditions')
const { calendarAutocomplete } = require('../lib/autocomplete')

const cards = [
  {
    id: 'event_ongoing',
    runListenerId: 'ongoing',
    autocompleteListener: {
      argumentId: 'event',
      id: 'event'
    }
  },
  {
    id: 'event_in',
    runListenerId: 'in',
    autocompleteListener: {
      argumentId: 'event',
      id: 'event'
    }
  },
  {
    id: 'any_event_ongoing',
    runListenerId: 'any_ongoing',
    autocompleteListener: {
      argumentId: '',
      id: ''
    }
  },
  {
    id: 'any_event_ongoing_calendar',
    runListenerId: 'any_ongoing_calendar',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  },
  {
    id: 'any_event_in',
    runListenerId: 'any_in',
    autocompleteListener: {
      argumentId: '',
      id: ''
    }
  },
  {
    id: 'event_stops_in',
    runListenerId: 'stops_in',
    autocompleteListener: {
      argumentId: 'event',
      id: 'event'
    }
  },
  {
    id: 'any_event_stops_in',
    runListenerId: 'any_stops_in',
    autocompleteListener: {
      argumentId: '',
      id: ''
    }
  },
  {
    id: 'event_containing_in_calendar',
    runListenerId: 'event_containing_calendar',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  },
  {
    id: 'event_containing_in_calendar_stops_in',
    runListenerId: 'event_containing_calendar_stops',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  },
  {
    id: 'event_containing_in_calendar_ongoing',
    runListenerId: 'event_containing_calendar_ongoing',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  },
  {
    id: 'any_event_in_calendar',
    runListenerId: 'any_in_calendar',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  },
  {
    id: 'calendar_event_equal_in',
    runListenerId: 'equal_in',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  },
  {
    id: 'calendar_event_match_in',
    runListenerId: 'match_in',
    autocompleteListener: {
      argumentId: 'calendar',
      id: 'calendar'
    }
  }
]

/**
 * @typedef {import('@types/homey').FlowCard.ArgumentAutocompleteResults} ArgumentAutocompleteResults
 */

/**
 * @param {string} timezone - The timezone to use on events (IANA)
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Imported calendars
 *
 * @returns ArgumentAutocompleteResults
 */
const getEventList = (timezone, app, calendars) => {
  const eventList = []

  if (calendars.length === 0) {
    app.warn('getEventList: No calendars. Returning empty array')
    return eventList
  }

  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)

  calendars.forEach((calendar) => {
    calendar.events.forEach((event) => {
      const now = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular
      let startStamp = ''
      let endStamp = ''
      const startMoment = event.start
      const endMoment = event.end

      try {
        if (event.datetype === 'date-time') {
          startStamp = startMoment.format(`${app.variableMgmt.dateTimeFormat.long} ${app.variableMgmt.dateTimeFormat.time}`)

          if (endMoment.isSame(startMoment, 'date')) {
            endStamp = endMoment.format(app.variableMgmt.dateTimeFormat.time)
          } else {
            endStamp = endMoment.format(`${app.variableMgmt.dateTimeFormat.long} ${app.variableMgmt.dateTimeFormat.time}`)
          }
        } else if (event.datetype === 'date') {
          startStamp = startMoment.format(app.variableMgmt.dateTimeFormat.long)

          if (endMoment.isSame(now, 'year')) {
            endStamp = endMoment.isSame(startMoment, 'date') ? '' : endMoment.format(app.variableMgmt.dateTimeFormat.long)
          } else {
            endStamp = endMoment.format(app.variableMgmt.dateTimeFormat.long)
          }
        }
      } catch (error) {
        app.logError(`getEventList: Failed to parse 'start' (${startMoment}) or 'end' (${endMoment}):`, error, event)
        startStamp = ''
        endStamp = ''

        triggerSynchronizationError({ app, calendar: calendar.name, error, event })
          .catch((err) => app.logError(`getEventList: Failed to trigger synchronization error: ${err}`))
      }

      const name = event.summary
      let description = calendar.name

      if (startStamp !== '' && endStamp !== '') {
        description += ` -- (${startStamp} -> ${endStamp})`
      } else if (endStamp === '') {
        description += ` -- (${startStamp})`
      }

      if (event.freebusy) {
        description += ` -- ${event.freebusy}`
      }

      eventList.push({ id: event.uid, name, description, start: event.start })
    })
  })

  eventList.sort((a, b) => sortEvent(a, b))

  return eventList
}

/**
 * @param {string} timezone - The timezone to use on events (IANA)
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} query - The value to filter calendar events by summary
 * @param {''|'calendar'|'event'} type - Autocomplete listener id
 *
 * @returns ArgumentAutocompleteResults
 */
const onEventAutocomplete = async (timezone, app, query, type) => {
  if (!app.variableMgmt.calendars || app.variableMgmt.calendars.length <= 0) {
    app.warn('onEventAutocomplete: Calendars not set yet. Nothing to show...')
    return []
  }

  if (type === 'event') {
    if (query) {
      const filtered = filterBySummary(app.variableMgmt.calendars, query)
      return getEventList(timezone, app, filtered)
    }

    return getEventList(timezone, app, app.variableMgmt.calendars)
  }

  return []
}

/**
 * @param {string} timezone - The timezone to use on events (IANA)
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {any} args - Arguments passed in from condition runListener
 * @param {any} state - State passed in from condition runListener
 * @param {'ongoing'|'in'|'any_ongoing'|'any_ongoing_calendar'|'any_in'|'stops_in'|'any_stops_in'|'event_containing_calendar'|'event_containing_calendar_stops'|'event_containing_calendar_ongoing'|'any_in_calendar'|'equal_in'|'match_in'} type - RunListener id
 *
 * @returns {boolean}
 */
const checkEvent = async (timezone, app, args, state, type) => {
  let filteredEvents
  if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
    filteredEvents = filterByUID(app.variableMgmt.calendars || [], args.event.id)
  } else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
    filteredEvents = app.variableMgmt.calendars || []
  } else if (['any_in_calendar', 'any_ongoing_calendar', 'event_containing_calendar', 'event_containing_calendar_stops', 'equal_in', 'match_in'].includes(type)) {
    filteredEvents = filterByCalendar(app.variableMgmt.calendars, args.calendar.name) || []
  } else if (type === 'event_containing_calendar_ongoing') {
    filteredEvents = filterByCalendar(app.variableMgmt.calendars, args.calendar.name) || []
    filteredEvents = filterBySummary(filteredEvents, args.value) || []
  }

  if (!filteredEvents || filteredEvents.length === 0) {
    app.warn('checkEvent: filteredEvents empty... Resolving with false')
    return false
  }

  if (type === 'event_containing_calendar') {
    const inMinutes = convertToMinutes(args.when, args.type)
    const nextEvent = getNextEventValue({ calendars: filteredEvents, specificCalendarName: args.calendar.name, value: args.value, eventType: 'starts', timezone })
    if (Object.keys(nextEvent).length > 0) {
      const startsWithin = isEventIn(app, timezone, [nextEvent], inMinutes)
      app.log(`checkEvent: Next event containing found: '${nextEvent.summary}' ${(nextEvent.start)}. Starts within ${inMinutes} minutes? ${startsWithin}`)
      if (startsWithin) await updateNextEventWithTokens(app, nextEvent)
      return startsWithin
    }

    return false
  }

  if (type === 'event_containing_calendar_stops') {
    const inMinutes = convertToMinutes(args.when, args.type)
    const nextEvent = getNextEventValue({ calendars: filteredEvents, specificCalendarName: args.calendar.name, value: args.value, eventType: 'ends', timezone })
    if (Object.keys(nextEvent).length > 0) {
      const endsWithin = willEventNotIn(app, timezone, [nextEvent], inMinutes)
      app.log(`checkEvent: Next event containing found: '${nextEvent.summary}' ${(nextEvent.end)}. Ends within ${inMinutes} minutes? ${endsWithin}`)
      if (endsWithin) await updateNextEventWithTokens(app, nextEvent)
      return endsWithin
    }

    return false
  }

  if (type === 'equal_in') {
    if ((args.property === undefined || args.property === '') || (args.value === undefined || args.value === '')) {
      app.warn('checkEvent: Equal_in : property or value is missing! Returning false')
      return false
    }

    filteredEvents = filterByProperty(filteredEvents, args.value, args.property, 'equal')
    if (!filteredEvents || filteredEvents.length !== 1 || !filteredEvents[0].events || filteredEvents[0].events.length === 0) {
      return false
    }

    if (args.when === undefined || args.type === undefined || args.when === null || args.type === null) {
      app.log(`checkEvent: Equal_in found ${filteredEvents[0].events.length} events in calendar ${filteredEvents[0].name} matching '${args.property}' with '${args.value}'. No timeframe given (when:'${args.when}', type:'${args.type}')! Returning true`)
      return true
    }
  }

  if (type === 'match_in') {
    if ((args.property === undefined || args.property === '') || (args.matcher === undefined || args.matcher === '') || (args.value === undefined || args.value === '')) {
      app.warn('checkEvent: Match_in : property, matcher or value is missing! Returning false')
      return false
    }

    filteredEvents = filterByProperty(filteredEvents, args.value, args.property, args.matcher)
    if (!filteredEvents || filteredEvents.length !== 1 || !filteredEvents[0].events || filteredEvents[0].events.length === 0) {
      return false
    }

    if (args.when === undefined || args.type === undefined || args.when === null || args.type === null) {
      app.log(`checkEvent: Match_in found ${filteredEvents[0].events.length} events in calendar ${filteredEvents[0].name} where '${args.property}' '${args.matcher}' '${args.value}'. No timeframe given (when:'${args.when}', type:'${args.type}')! Returning true`)
      return true
    }
  }

  return filteredEvents.some((calendar) => {
    if (calendar.events.length <= 0) {
      return false
    }

    app.log(`checkEvent: Checking ${calendar.events.length} events from '${calendar.name}'`)

    if (type === 'ongoing') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      return isEventOngoing(app, timezone, calendar.events)
      // app.log(`checkEvent: Ongoing? ${eventCondition}`);
    }

    if (['in', 'equal_in', 'match_in'].includes(type)) {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      return isEventIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Starting within ${args.when} minutes or less? ${eventCondition}`);
    }

    if (type === 'stops_in') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      return willEventNotIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Ending within less than ${args.when} minutes? ${eventCondition}`);
    }

    if (['any_ongoing', 'any_ongoing_calendar', 'event_containing_calendar_ongoing'].includes(type)) {
      return isEventOngoing(app, timezone, calendar.events)
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ongoing? ${eventCondition}`);
    }

    if (['any_in_calendar', 'any_in'].includes(type)) {
      return isEventIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events starting within ${args.when} minutes or less? ${eventCondition}`);
    }

    if (type === 'any_stops_in') {
      return willEventNotIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ending within ${args.when} minutes or less? ${eventCondition}`);
    }

    return false
  })
}

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} timezone - The timezone to use on events (IANA)
 */
const setupConditions = (app, timezone) => {
  // register condition flow cards
  cards.forEach(({ id, runListenerId, autocompleteListener }) => {
    const conditionCard = app.homey.flow.getConditionCard(id)
    conditionCard.registerRunListener((args, state) => checkEvent(timezone, app, args, state, runListenerId))
    if (autocompleteListener.argumentId && autocompleteListener.id) {
      if (autocompleteListener.id === 'calendar') {
        conditionCard.registerArgumentAutocompleteListener(autocompleteListener.argumentId, (query, _) => calendarAutocomplete(app, query))
        return
      }

      conditionCard.registerArgumentAutocompleteListener(autocompleteListener.argumentId, (query, _) => onEventAutocomplete(timezone, app, query, autocompleteListener.id))
    }
  })
}

module.exports = {
  setupConditions
}
