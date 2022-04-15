'use strict'

const moment = require('../lib/moment-datetime')
const { filterByCalendar, filterBySummary, filterByUID } = require('../lib/filter-by')
const sortEvent = require('../lib/sort-event')
const convertToMinutes = require('../lib/convert-to-minutes')

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
  }
]

const isEventOngoing = (timezone, events) => {
  const now = moment(timezone)
  return events.some(event => {
    const startDiff = now.diff(event.start, 'seconds')
    const endDiff = now.diff(event.end, 'seconds')
    const result = (startDiff >= 0 && endDiff <= 0)
    // app.log(`isEventOngoing: '${event.summary}' (${event.uid}) -- ${startDiff} seconds since start -- ${endDiff} seconds since end -- Ongoing: ${result}`);
    return result
  })
}

const isEventIn = (timezone, events, when) => {
  const now = moment(timezone)
  return events.some(event => {
    const startDiff = event.start.diff(now, 'minutes', true)
    const result = (startDiff <= when && startDiff >= 0)
    // app.log(`isEventIn: ${startDiff} mintes until start -- Expecting ${when} minutes or less -- In: ${result}`);
    return result
  })
}

const willEventNotIn = (timezone, events, when) => {
  const now = moment(timezone)
  return events.some(event => {
    const endDiff = event.end.diff(now, 'minutes', true)
    const result = (endDiff < when && endDiff >= 0)
    // app.log(`willEventNotIn: ${endDiff} mintes until end -- Expecting ${when} minutes or less -- In: ${result}`);
    return result
  })
}

const getEventList = (timezone, app, calendars) => {
  const eventList = []

  if (calendars.length === 0) {
    app.log('getEventList: No calendars. Returning empty array')
    return eventList
  }

  const now = moment(timezone)

  calendars.forEach(calendar => {
    calendar.events.forEach(event => {
      let startStamp = ''
      let endStamp = ''
      const startMoment = event.start
      const endMoment = event.end

      try {
        if (event.datetype === 'date-time') {
          startStamp = startMoment.isSame(now, 'year') ? startMoment.format(`${app.variableMgmt.dateTimeFormat.date.short} ${app.variableMgmt.dateTimeFormat.time.time}`) : startMoment.locale(app.homey.__('locale.moment')).format(`${app.variableMgmt.dateTimeFormat.date.long} ${app.variableMgmt.dateTimeFormat.time.time}`)

          if (endMoment.isSame(startMoment, 'year')) {
            if (endMoment.isSame(startMoment, 'date')) {
              endStamp = endMoment.format(app.variableMgmt.dateTimeFormat.time.time)

              startStamp = startStamp.replace(' ', ' - ')
            } else {
              endStamp = endMoment.format(`${app.variableMgmt.dateTimeFormat.date.short} ${app.variableMgmt.dateTimeFormat.time.time}`)
            }
          } else {
            endStamp = endMoment.locale(app.homey.__('locale.moment')).format(`${app.variableMgmt.dateTimeFormat.date.long} ${app.variableMgmt.dateTimeFormat.time.time}`)
          }
        } else if (event.datetype === 'date') {
          startStamp = startMoment.isSame(now, 'year') ? startMoment.format(app.variableMgmt.dateTimeFormat.date.short) : startMoment.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long)

          if (endMoment.isSame(now, 'year')) {
            endStamp = endMoment.isSame(startMoment, 'date') ? '' : endMoment.format(app.variableMgmt.dateTimeFormat.date.short)
          } else {
            endStamp = endMoment.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long)
          }
        }
      } catch (error) {
        app.log(`getEventList: Failed to parse 'start' (${startMoment}) or 'end' (${endMoment}):`, error, event)
        startStamp = ''
        endStamp = ''

        // send exception to sentry
        app.sentry.captureException(error)
      }

      const name = event.summary
      let description = calendar.name

      if (startStamp !== '' && endStamp !== '') {
        description += ` -- (${startStamp} -> ${endStamp})`
      } else if (endStamp === '') {
        description += ` -- (${startStamp})`
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
    return Promise.resolve(false)
  }

  if (type === 'event') {
    if (query) { // TODO: Changed from query && query !== ''
      const filtered = filterBySummary(app.variableMgmt.calendars, query)
      return Promise.resolve(getEventList(timezone, app, filtered))
    }

    return Promise.resolve(getEventList(timezone, app, app.variableMgmt.calendars))
  }

  if (type === 'calendar') {
    if (query) { // TODO: Changed from query && query !== ''
      const filteredCalendar = filterByCalendar(app.variableMgmt.calendars, query) || []
      return Promise.resolve(
        filteredCalendar.map(calendar => {
          return { id: calendar.name, name: calendar.name }
        })
      )
    }

    return Promise.resolve(
      app.variableMgmt.calendars.map(calendar => {
        return { id: calendar.name, name: calendar.name }
      })
    )
  }

  return Promise.resolve(false)
}

const checkEvent = async (timezone, app, args, state, type) => {
  let filteredEvents
  if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
    filteredEvents = filterByUID(app.variableMgmt.calendars || [], args.event.id)
  } else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
    filteredEvents = app.variableMgmt.calendars || []
  } else if (type === 'any_ongoing_calendar') {
    filteredEvents = filterByCalendar(app.variableMgmt.calendars, args.calendar.name) || []
  }

  if (!filteredEvents || filteredEvents.length === 0) {
    app.log('checkEvent: filteredEvents empty... Resolving with false')
    return Promise.resolve(false)
  }

  return Promise.resolve(filteredEvents.some(calendar => {
    if (calendar.events.length <= 0) {
      return false
    }

    app.log(`checkEvent: Checking ${calendar.events.length} events from '${calendar.name}'`)
    let eventCondition = false

    if (type === 'ongoing') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      eventCondition = isEventOngoing(timezone, calendar.events)
      // app.log(`checkEvent: Ongoing? ${eventCondition}`);
    } else if (type === 'in') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      eventCondition = isEventIn(timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Starting within ${args.when} minutes or less? ${eventCondition}`);
    } else if (type === 'stops_in') {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      eventCondition = willEventNotIn(timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Ending within less than ${args.when} minutes? ${eventCondition}`);
    } else if (type === 'any_ongoing' || type === 'any_ongoing_calendar') {
      eventCondition = isEventOngoing(timezone, calendar.events)
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ongoing? ${eventCondition}`);
    } else if (type === 'any_in') {
      eventCondition = isEventIn(timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events starting within ${args.when} minutes or less? ${eventCondition}`);
    } else if (type === 'any_stops_in') {
      eventCondition = willEventNotIn(timezone, calendar.events, convertToMinutes(args.when, args.type))
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ending within ${args.when} minutes or less? ${eventCondition}`);
    }

    return eventCondition
  }))
}

/**
 * @typedef {Object} SetupConditionsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Homey.App} app App class inited by Homey
 */

/**
 * @param {SetupConditionsOptions} options
 */
module.exports = options => { // registerAutocompleteListener is async in the docs...
  // register condition flow cards
  const { timezone, app } = options
  cards.forEach(({ id, runListenerId, autocompleteListener }) => {
    const conditionCard = app.homey.flow.getConditionCard(id)
    conditionCard.registerRunListener((args, state) => checkEvent(timezone, app, args, state, runListenerId))
    if (autocompleteListener.argumentId && autocompleteListener.id) conditionCard.registerArgumentAutocompleteListener(autocompleteListener.argumentId, (query, args) => onEventAutocomplete(timezone, app, query, args, autocompleteListener.id)) // registerAutocompleteListener is async in the docs...
  })
}
