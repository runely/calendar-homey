'use strict'

const Homey = require('homey')
const moment = require('moment')
const humanize = require('humanize-duration')
const filterByCalendar = require('../lib/filter-by-calendar')
const getNextEvent = require('../lib/get-next-event')
const getTodaysEvents = require('../lib/get-todays-events')
const getTomorrowsEvents = require('../lib/get-tomorrows-events')
const convertToMinutes = require('../lib/convert-to-minutes')
const getEventsForToken = require('../lib/get-events-for-token')

const updateFlowToken = (token, value, id, app) => {
  try {
    token.setValue(value)
  } catch (error) {
    app.log(`updateFlowToken: Failed to update token '${id}': ${error.message || error}`)
  }
}

const triggerAllEvents = (calendars, app) => {
  const now = moment()

  calendars.forEach(calendar => {
    app.log(`triggerAllEvents: Checking calendar '${calendar.name}' for events to trigger`)
    calendar.events.forEach(event => {
      const startDiff = now.diff(event.start, 'seconds')
      const endDiff = now.diff(event.end, 'seconds')

      const resultStart = (startDiff >= 0 && startDiff <= 55 && endDiff <= 0)
      const resultEnd = (endDiff >= 0 && endDiff <= 55)
      const resultStartInCheck = (!resultStart && startDiff < 0)
      const resultEndInCheck = (!resultEnd && endDiff < 0)

      if (resultStart) {
        startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_starts' }, app)
        startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_starts_calendar' }, app, { calendarName: calendar.name })
      }

      if (resultEnd) {
        startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_stops' }, app)
      }

      if (resultStartInCheck) {
        const startsIn = Math.round(event.start.diff(now, 'minutes', true))
        startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_starts_in' }, app, { when: startsIn })
      }

      if (resultEndInCheck) {
        const endsIn = Math.round(event.end.diff(now, 'minutes', true))
        startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_stops_in' }, app, { when: endsIn })
      }
    })
  })
}

const getTriggerTokenValue = key => {
  if (!key) {
    return ''
  }

  if (key === '' || key === ' ' || key === '\n' || key === '\\n' || key === '\n ' || key === '\\n ' || key === '\r' || key === '\\r' || key === '\r ' || key === '\\r ' || key === '\r\n' || key === '\\r\\n' || key === '\r\n ' || key === '\\r\\n ' || key === '\n\r' || key === '\\n\\r' || key === '\n\r ' || key === '\\n\\r ') {
    return ''
  }

  return key
}

const getTriggerTokenDuration = event => {
  const durationMS = event.end.diff(event.start, 'milliseconds')

  return {
    duration: humanize(durationMS, {
      language: Homey.__('locale.humanize'),
      largest: 3,
      units: ['y', 'mo', 'w', 'd', 'h', 'm'],
      round: true,
      conjunction: Homey.__('humanize.conjunction'),
      serialComma: false
    }),
    durationMinutes: event.end.diff(event.start, 'minutes')
  }
}

const startTrigger = (calendarName, event, app, state) => {
  // trigger flow card
  const eventDuration = getTriggerTokenDuration(event)
  const tokens = {
    event_name: getTriggerTokenValue(event.summary),
    event_description: getTriggerTokenValue(event.description),
    event_location: getTriggerTokenValue(event.location),
    event_duration_readable: eventDuration.duration,
    event_duration: eventDuration.durationMinutes,
    event_calendar_name: calendarName
  }

  if (state === undefined) {
    app.log(`Triggered '${event.TRIGGER_ID}'`)
    Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens)
  } else {
    Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens, state)
  }
}

const getNextEventCalendar = (app, calendarName, nextEvent) => {
  if (!nextEvent) {
    // app.log(`getNextEventCalendar: nextEvent not set. Getting next event for calendar '${calendarName}'`);
    return getNextEvent(app.variableMgmt.calendars, calendarName)
  }

  if (nextEvent && nextEvent.calendarName !== calendarName) {
    // app.log(`getNextEventCalendar: nextEvent already set but for calendar '${nextEvent.calendarName}'. Getting next event for calendar '${calendarName}'`);
    return getNextEvent(app.variableMgmt.calendars, calendarName)
  }

  if (nextEvent && nextEvent.calendarName === calendarName) {
    // app.log(`getNextEventCalendar: nextEvent already set for calendar '${nextEvent.calendarName}' (${calendarName}). Using this one`);
    return nextEvent
  }

  app.log('getNextEventCalendar: What what what????')
  return null
}

const updateFlowTokens = app => {
  const nextEvent = getNextEvent(app.variableMgmt.calendars)
  const eventsToday = getTodaysEvents(app.variableMgmt.calendars)
  const eventsTomorrow = getTomorrowsEvents(app.variableMgmt.calendars)
  let eventDuration

  if (nextEvent.event) {
    eventDuration = getTriggerTokenDuration(nextEvent.event)
  }

  // loop through flow tokens
  app.variableMgmt.flowTokens.forEach(token => {
    if (token.id === 'event_next_title') {
      updateFlowToken(token, nextEvent.event ? (nextEvent.event.summary || '') : '', token.id, app)
    } else if (token.id === 'event_next_startdate') {
      updateFlowToken(token, nextEvent.event ? nextEvent.event.start.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '', token.id, app)
    } else if (token.id === 'event_next_startstamp') {
      if (nextEvent.event) {
        if (nextEvent.event.datetype === 'date-time') {
          updateFlowToken(token, nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
        } else if (nextEvent.event.datetype === 'date') {
          updateFlowToken(token, `00${app.variableMgmt.dateTimeFormat.time.splitter}00`, token.id, app)
        }
      } else {
        updateFlowToken(token, '', token.id, app)
      }
    } else if (token.id === 'event_next_stopdate') {
      updateFlowToken(token, nextEvent.event ? nextEvent.event.end.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '', token.id, app)
    } else if (token.id === 'event_next_stopstamp') {
      if (nextEvent.event) {
        if (nextEvent.event.datetype === 'date-time') {
          updateFlowToken(token, nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
        } else if (nextEvent.event.datetype === 'date') {
          updateFlowToken(token, `00${app.variableMgmt.dateTimeFormat.time.splitter}00`, token.id, app)
        }
      } else {
        updateFlowToken(token, '', token.id, app)
      }
    } else if (token.id === 'event_next_duration') {
      updateFlowToken(token, nextEvent.event ? eventDuration.duration : '', token.id, app)
    } else if (token.id === 'event_next_duration_minutes') {
      updateFlowToken(token, nextEvent.event ? eventDuration.durationMinutes : -1, token.id, app)
    } else if (token.id === 'event_next_starts_in_minutes') {
      updateFlowToken(token, nextEvent.event ? nextEvent.startsIn : -1, token.id, app)
    } else if (token.id === 'event_next_stops_in_minutes') {
      updateFlowToken(token, nextEvent.event ? nextEvent.endsIn : -1, token.id, app)
    } else if (token.id === 'event_next_calendar_name') {
      updateFlowToken(token, nextEvent.event ? nextEvent.calendarName : '', token.id, app)
    } else if (token.id === 'events_today_title_stamps') {
      const value = getEventsForToken(app, eventsToday) || ''
      updateFlowToken(token, value, token.id, app)
    } else if (token.id === 'events_today_count') {
      updateFlowToken(token, eventsToday.length, token.id, app)
    } else if (token.id === 'events_tomorrow_title_stamps') {
      const value = getEventsForToken(app, eventsTomorrow) || ''
      updateFlowToken(token, value, token.id, app)
    } else if (token.id === 'events_tomorrow_count') {
      updateFlowToken(token, eventsTomorrow.length, token.id, app)
    } else if (token.id === 'icalcalendar_week_number') {
      updateFlowToken(token, moment().week(), token.id, app)
    }
  })

  // loop through calendar tokens
  let calendarNextEvent
  app.variableMgmt.calendarTokens.forEach(token => {
    const calendarId = token.id.replace(app.variableMgmt.calendarTokensPreId, '')
    const calendarName = calendarId.replace(app.variableMgmt.calendarTokensPostTodayId, '').replace(app.variableMgmt.calendarTokensPostTomorrowId, '').replace(app.variableMgmt.calendarTokensPostNextTitleId, '').replace(app.variableMgmt.calendarTokensPostNextStartDateId, '').replace(app.variableMgmt.calendarTokensPostNextStartTimeId, '').replace(app.variableMgmt.calendarTokensPostNextEndDateId, '').replace(app.variableMgmt.calendarTokensPostNextEndTimeId, '')
    const calendarType = calendarId.replace(`${calendarName}_`, '')
    // app.log(`calendarTokens: Setting token '${calendarType}' for calendar '${calendarName}'`);
    let value = ''

    if (calendarType === 'today') {
      const todaysEventsCalendar = getTodaysEvents(app.variableMgmt.calendars, calendarName)
      // app.log(`updateFlowTokens: Found '${todaysEventsCalendar.length}' events for today from calendar '${calendarName}'`);
      value = getEventsForToken(app, todaysEventsCalendar) || ''
    } else if (calendarType === 'tomorrow') {
      const tomorrowsEventsCalendar = getTomorrowsEvents(app.variableMgmt.calendars, calendarName)
      // app.log(`updateFlowTokens: Found '${tomorrowsEventsCalendar.length}' events for tomorrow from calendar '${calendarName}'`);
      value = getEventsForToken(app, tomorrowsEventsCalendar) || ''
    } else if (calendarType === 'next_title') {
      calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent)
      value = calendarNextEvent.event ? (calendarNextEvent.event.summary || '') : ''
    } else if (calendarType === 'next_startdate') {
      calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent)
      value = calendarNextEvent.event ? calendarNextEvent.event.start.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : ''
    } else if (calendarType === 'next_starttime') {
      calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent)
      if (calendarNextEvent.event) {
        if (calendarNextEvent.event.datetype === 'date-time') {
          value = calendarNextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time.time)
        } else if (calendarNextEvent.event.datetype === 'date') {
          value = `00${app.variableMgmt.dateTimeFormat.time.splitter}00`
        }
      } else {
        value = ''
      }
    } else if (calendarType === 'next_enddate') {
      calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent)
      value = calendarNextEvent.event ? calendarNextEvent.event.end.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : ''
    } else if (calendarType === 'next_endtime') {
      calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent)
      if (calendarNextEvent.event) {
        if (calendarNextEvent.event.datetype === 'date-time') {
          value = calendarNextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time.time)
        } else if (calendarNextEvent.event.datetype === 'date') {
          value = `00${app.variableMgmt.dateTimeFormat.time.splitter}00`
        }
      } else {
        value = ''
      }
    }

    updateFlowToken(token, value, token.id, app)
  })
}

module.exports = async app => {
  // register trigger flow cards
  const registerTriggerFlowCards = async () => {
    new Homey.FlowCardTrigger('event_starts').register()

    new Homey.FlowCardTrigger('event_stops').register()

    new Homey.FlowCardTrigger('event_added').register()

    new Homey.FlowCardTrigger('event_changed').register()

    new Homey.FlowCardTrigger('event_starts_in')
      .registerRunListener((args, state) => {
        const minutes = convertToMinutes(args.when, args.type)
        const result = (minutes === state.when)
        if (result) {
          app.log('Triggered \'event_starts_in\' with state:', state)
        }

        return Promise.resolve(result)
      })
      .register()

    new Homey.FlowCardTrigger('event_stops_in')
      .registerRunListener((args, state) => {
        const minutes = convertToMinutes(args.when, args.type)
        const result = (minutes === state.when)
        if (result) {
          app.log('Triggered \'event_stops_in\' with state:', state)
        }

        return Promise.resolve(result)
      })
      .register()

    new Homey.FlowCardTrigger('event_starts_calendar')
      .register()
      .registerRunListener((args, state) => {
        const result = (args.calendar.name === state.calendarName)
        if (result) {
          app.log('Triggered \'event_starts_calendar\' with state:', state)
        }

        return Promise.resolve(result)
      })
      .getArgument('calendar')
      .registerAutocompleteListener((query, args) => {
        if (!app.variableMgmt.calendars) {
          app.log('event_starts_calendar.onAutocompleteListener: Calendars not set yet. Nothing to show...')
          return Promise.resolve(false)
        }

        if (query && query !== '') {
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
      })
  }

  // register flow tokens
  const registerFlowTokens = async () => {
    app.variableMgmt.tokens.forEach(definition => {
      new Homey.FlowToken(definition.id, { type: definition.type, title: Homey.__(`flowTokens.${definition.id}`) })
        .register()
        .then(token => app.variableMgmt.flowTokens.push(token))
    })
  }

  await registerTriggerFlowCards()
  await registerFlowTokens()
}

module.exports.triggerEvents = async app => {
  return new Promise(resolve => {
    if (app.variableMgmt.calendars) {
      triggerAllEvents(app.variableMgmt.calendars, app)
    } else {
      app.log('triggerEvents: Calendars has not been set in Settings yet')
    }

    resolve(true)
  })
}

module.exports.updateTokens = async app => {
  return new Promise(resolve => {
    app.log('updateTokens: Updating flow tokens')

    updateFlowTokens(app)

    resolve(true)
  })
}

module.exports.triggerChangedCalendars = (app, calendars) => {
  return new Promise(resolve => {
    calendars.forEach(calendar => {
      calendar.events.forEach(event => {
        const tokens = {
          event_name: getTriggerTokenValue(event.summary),
          event_calendar_name: calendar.name,
          event_type: event.changed[0].type,
          event_prev_value: getTriggerTokenValue(event.changed[0].previousValue),
          event_new_value: getTriggerTokenValue(event.changed[0].newValue)
        }
        app.log('Triggered event_changed')
        Homey.ManagerFlow.getCard('trigger', 'event_changed').trigger(tokens)
      })
    })

    resolve(true)
  })
}

module.exports.triggerAddedEvent = (app, event, calendarName) => {
  return new Promise(resolve => {
    startTrigger(calendarName, { ...event, TRIGGER_ID: 'event_added' }, app)

    resolve(true)
  })
}
