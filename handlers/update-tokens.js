'use strict'

const Homey = require('homey')
const getNextEvent = require('../lib/get-next-event')
const getTodaysEvents = require('../lib/get-todays-events')
const getTomorrowsEvents = require('../lib/get-tomorrows-events')
const getTokenDuration = require('../lib/get-token-duration')
const getTokenEvents = require('../lib/get-token-events')
const moment = require('../lib/moment-datetime')

const updateToken = (token, value, id, app) => {
  try {
    token.setValue(value)
  } catch (error) {
    app.log(`updateToken: Failed to update token '${id}': ${error.message || error}`)
  }
}

const getNextEventByCalendar = (app, calendarName, nextEvent) => {
  if (!nextEvent) {
    // app.log(`getNextEventByCalendar: nextEvent not set. Getting next event for calendar '${calendarName}'`);
    return getNextEvent(app.variableMgmt.calendars, calendarName)
  }

  if (nextEvent && nextEvent.calendarName !== calendarName) {
    // app.log(`getNextEventByCalendar: nextEvent already set but for calendar '${nextEvent.calendarName}'. Getting next event for calendar '${calendarName}'`);
    return getNextEvent(app.variableMgmt.calendars, calendarName)
  }

  if (nextEvent && nextEvent.calendarName === calendarName) {
    // app.log(`getNextEventByCalendar: nextEvent already set for calendar '${nextEvent.calendarName}' (${calendarName}). Using this one`);
    return nextEvent
  }

  app.log('getNextEventByCalendar: What what what????')
  return null
}

/**
 * @typedef {Object} UpdateTokensOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Homey.App} app App class inited by Homey
 */

/**
 * @param {UpdateTokensOptions} options
 */
module.exports = options => {
  const { timezone, app } = options
  const eventOptions = {
    timezone,
    calendars: app.variableMgmt.calendars
  }
  const tokenEventsOptions = {
    timezone,
    app
  }
  const nextEvent = getNextEvent(eventOptions)
  const eventsToday = getTodaysEvents(eventOptions)
  const eventsTomorrow = getTomorrowsEvents(app.variableMgmt.calendars)

  let eventDuration

  if (nextEvent.event) {
    eventDuration = getTokenDuration(nextEvent.event)
  }

  // loop through flow tokens
  app.variableMgmt.flowTokens.forEach(token => {
    try {
      if (token.id === 'event_next_title') {
        updateToken(token, nextEvent.event ? (nextEvent.event.summary || '') : '', token.id, app)
      } else if (token.id === 'event_next_startdate') {
        updateToken(token, nextEvent.event ? nextEvent.event.start.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '', token.id, app)
      } else if (token.id === 'event_next_startstamp') {
        if (nextEvent.event) {
          if (nextEvent.event.datetype === 'date-time') {
            updateToken(token, nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
          } else if (nextEvent.event.datetype === 'date') {
            updateToken(token, `00${app.variableMgmt.dateTimeFormat.time.splitter}00`, token.id, app)
          }
        } else {
          updateToken(token, '', token.id, app)
        }
      } else if (token.id === 'event_next_stopdate') {
        updateToken(token, nextEvent.event ? nextEvent.event.end.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '', token.id, app)
      } else if (token.id === 'event_next_stopstamp') {
        if (nextEvent.event) {
          if (nextEvent.event.datetype === 'date-time') {
            updateToken(token, nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
          } else if (nextEvent.event.datetype === 'date') {
            updateToken(token, `00${app.variableMgmt.dateTimeFormat.time.splitter}00`, token.id, app)
          }
        } else {
          updateToken(token, '', token.id, app)
        }
      } else if (token.id === 'event_next_duration') {
        updateToken(token, nextEvent.event ? eventDuration.duration : '', token.id, app)
      } else if (token.id === 'event_next_duration_minutes') {
        updateToken(token, nextEvent.event ? eventDuration.durationMinutes : -1, token.id, app)
      } else if (token.id === 'event_next_starts_in_minutes') {
        updateToken(token, nextEvent.event ? nextEvent.startsIn : -1, token.id, app)
      } else if (token.id === 'event_next_stops_in_minutes') {
        updateToken(token, nextEvent.event ? nextEvent.endsIn : -1, token.id, app)
      } else if (token.id === 'event_next_calendar_name') {
        updateToken(token, nextEvent.event ? nextEvent.calendarName : '', token.id, app)
      } else if (token.id === 'events_today_title_stamps') {
        const value = getTokenEvents({ ...tokenEventsOptions, events: eventsToday }) || ''
        updateToken(token, value, token.id, app)
      } else if (token.id === 'events_today_count') {
        updateToken(token, eventsToday.length, token.id, app)
      } else if (token.id === 'events_tomorrow_title_stamps') {
        const value = getTokenEvents({ ...tokenEventsOptions, events: eventsTomorrow }) || ''
        updateToken(token, value, token.id, app)
      } else if (token.id === 'events_tomorrow_count') {
        updateToken(token, eventsTomorrow.length, token.id, app)
      } else if (token.id === 'icalcalendar_week_number') {
        updateToken(token, moment(timezone).week(), token.id, app)
      }
    } catch (error) {
      app.log('updateTokens: Failed to update flow token', token.id, ':', error)

      app.sentry.captureException(error)
    }
  })

  // loop through calendar tokens
  let calendarNextEvent
  app.variableMgmt.calendarTokens.forEach(token => {
    try {
      const calendarId = token.id.replace(app.variableMgmt.calendarTokensPreId, '')
      const calendarName = calendarId
        .replace(app.variableMgmt.calendarTokensPostTodayId, '')
        .replace(app.variableMgmt.calendarTokensPostTomorrowId, '')
        .replace(app.variableMgmt.calendarTokensPostNextTitleId, '')
        .replace(app.variableMgmt.calendarTokensPostNextStartDateId, '')
        .replace(app.variableMgmt.calendarTokensPostNextStartTimeId, '')
        .replace(app.variableMgmt.calendarTokensPostNextEndDateId, '')
        .replace(app.variableMgmt.calendarTokensPostNextEndTimeId, '')
      const calendarType = calendarId.replace(`${calendarName}_`, '')
      // app.log(`calendarTokens: Setting token '${calendarType}' for calendar '${calendarName}'`);
      let value = ''

      if (calendarType === 'today') {
        const todaysEventsCalendar = getTodaysEvents(app.variableMgmt.calendars, calendarName)
        // app.log(`updateTokens: Found '${todaysEventsCalendar.length}' events for today from calendar '${calendarName}'`);
        value = getTokenEvents({ ...tokenEventsOptions, events: todaysEventsCalendar }) || ''
      } else if (calendarType === 'tomorrow') {
        const tomorrowsEventsCalendar = getTomorrowsEvents(app.variableMgmt.calendars, calendarName)
        // app.log(`updateTokens: Found '${tomorrowsEventsCalendar.length}' events for tomorrow from calendar '${calendarName}'`);
        value = getTokenEvents({ ...tokenEventsOptions, events: tomorrowsEventsCalendar }) || ''
      } else if (calendarType === 'next_title') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent)
        value = calendarNextEvent.event ? (calendarNextEvent.event.summary || '') : ''
      } else if (calendarType === 'next_startdate') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent)
        value = calendarNextEvent.event ? calendarNextEvent.event.start.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : ''
      } else if (calendarType === 'next_starttime') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent)
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
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent)
        value = calendarNextEvent.event ? calendarNextEvent.event.end.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : ''
      } else if (calendarType === 'next_endtime') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent)
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

      updateToken(token, value, token.id, app)
    } catch (error) {
      app.log('updateTokens: Failed to update calendar token', token.id, ':', error)

      app.sentry.captureException(error)
    }
  })
}
