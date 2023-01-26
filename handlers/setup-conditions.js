'use strict'

const { momentNow } = require('../lib/moment-datetime')
const { filterByCalendar, filterBySummary, filterByUID } = require('../lib/filter-by')
const sortEvent = require('../lib/sort-event')
const convertToMinutes = require('../lib/convert-to-minutes')
const getNextEventValue = require('../lib/get-next-event-value')
const { updateNextEventWithTokens } = require('./update-tokens')
const { triggerSynchronizationError } = require('./trigger-cards')

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
  }
]

/**
 * @param {Homey.App} app App class inited by Homey
 * @param {String} timezone The timezone to use on events (IANA)
 * @param {Array} events Array of event objects
 * @param {String} caller Name of the function calling. Defaults to 'condition'
 */
const isEventOngoing = (app, timezone, events, caller = 'condition') => {
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some(event => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    const startDiff = now.diff(event.start, 'seconds')
    const endDiff = now.diff(event.end, 'seconds')
    const result = (startDiff >= 0 && endDiff <= 0)
    if (result) {
      app.log(`isEventOngoing-${caller}: '${event.uid}' -- ${startDiff} seconds since start -- ${endDiff} seconds since end -- Ongoing: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

const isEventIn = (app, timezone, events, when) => {
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some(event => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    const startDiff = event.start.diff(now, 'minutes', true)
    const result = (startDiff <= when && startDiff >= 0)
    if (result) {
      app.log(`isEventIn: '${event.uid}' -- ${startDiff} minutes until start -- Expecting ${when} minutes or less -- In: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

const willEventNotIn = (app, timezone, events, when) => {
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some(event => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    const endDiff = event.end.diff(now, 'minutes', true)
    const result = (endDiff < when && endDiff >= 0)
    if (result) {
      app.log(`willEventNotIn: '${event.uid}' -- ${endDiff} minutes until end -- Expecting ${when} minutes or less -- In: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

const getEventList = (timezone, app, calendars) => {
  const eventList = []

  if (calendars.length === 0) {
    app.log('getEventList: No calendars. Returning empty array')
    return eventList
  }

  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)

  calendars.forEach(calendar => {
    calendar.events.forEach(event => {
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
        app.log(`getEventList: Failed to parse 'start' (${startMoment}) or 'end' (${endMoment}):`, error, event)
        startStamp = ''
        endStamp = ''

        triggerSynchronizationError({ app, calendar: calendar.name, error, event })
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

const onEventAutocomplete = async (timezone, app, query, args, type) => {
  if (!app.variableMgmt.calendars || app.variableMgmt.calendars.length <= 0) {
    app.log('onEventAutocomplete: Calendars not set yet. Nothing to show...')
    return false
  }

  if (type === 'event') {
    if (query) {
      const filtered = filterBySummary(app.variableMgmt.calendars, query)
      return getEventList(timezone, app, filtered)
    }

    return getEventList(timezone, app, app.variableMgmt.calendars)
  }

  if (type === 'calendar') {
    if (query) {
      const filteredCalendar = filterByCalendar(app.variableMgmt.calendars, query) || []
      return filteredCalendar.map(calendar => {
        return { id: calendar.name, name: calendar.name }
      })
    }

    return app.variableMgmt.calendars.map(calendar => {
      return { id: calendar.name, name: calendar.name }
    })
  }

  return false
}

const checkEvent = async (timezone, app, args, state, type) => {
  let filteredEvents
  if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
    filteredEvents = filterByUID(app.variableMgmt.calendars || [], args.event.id)
  } else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
    filteredEvents = app.variableMgmt.calendars || []
  } else if (['any_in_calendar', 'any_ongoing_calendar', 'event_containing_calendar', 'event_containing_calendar_stops'].includes(type)) {
    filteredEvents = filterByCalendar(app.variableMgmt.calendars, args.calendar.name) || []
  } else if (type === 'event_containing_calendar_ongoing') {
    filteredEvents = filterByCalendar(app.variableMgmt.calendars, args.calendar.name) || []
    filteredEvents = filterBySummary(filteredEvents, args.value) || []
  }

  if (!filteredEvents || filteredEvents.length === 0) {
    app.log('checkEvent: filteredEvents empty... Resolving with false')
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
  } else if (type === 'event_containing_calendar_stops') {
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

  return filteredEvents.some(calendar => {
    if (calendar.events.length <= 0) {
      return false
    }

    app.log(`checkEvent: Checking ${calendar.events.length} events from '${calendar.name}'`)
    let eventCondition = false

    if (type === 'ongoing') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      eventCondition = isEventOngoing(app, timezone, calendar.events)
      // app.log(`checkEvent: Ongoing? ${eventCondition}`);
    } else if (type === 'in') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      eventCondition = isEventIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Starting within ${args.when} minutes or less? ${eventCondition}`);
    } else if (type === 'stops_in') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      eventCondition = willEventNotIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Ending within less than ${args.when} minutes? ${eventCondition}`);
    } else if (['any_ongoing', 'any_ongoing_calendar', 'event_containing_calendar_ongoing'].includes(type)) {
      eventCondition = isEventOngoing(app, timezone, calendar.events)
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ongoing? ${eventCondition}`);
    } else if (['any_in_calendar', 'any_in'].includes(type)) {
      eventCondition = isEventIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events starting within ${args.when} minutes or less? ${eventCondition}`);
    } else if (type === 'any_stops_in') {
      eventCondition = willEventNotIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ending within ${args.when} minutes or less? ${eventCondition}`);
    }

    return eventCondition
  })
}

/**
 * @typedef {Object} SetupConditionsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Homey.App} app App class inited by Homey
 */

/**
 * @param {SetupConditionsOptions} options
 */
const setupConditions = options => {
  // register condition flow cards
  const { timezone, app } = options
  cards.forEach(({ id, runListenerId, autocompleteListener }) => {
    const conditionCard = app.homey.flow.getConditionCard(id)
    conditionCard.registerRunListener((args, state) => checkEvent(timezone, app, args, state, runListenerId))
    if (autocompleteListener.argumentId && autocompleteListener.id) {
      conditionCard.registerArgumentAutocompleteListener(autocompleteListener.argumentId, (query, args) => onEventAutocomplete(timezone, app, query, args, autocompleteListener.id))
    }
  })
}

module.exports = {
  isEventOngoing,
  setupConditions
}
