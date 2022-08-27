'use strict'

const getNextEvent = require('../lib/get-next-event')
const getTodaysEvents = require('../lib/get-todays-events')
const getTomorrowsEvents = require('../lib/get-tomorrows-events')
const getTokenDuration = require('../lib/get-token-duration')
const getTokenEvents = require('../lib/get-token-events')
const { moment } = require('../lib/moment-datetime')
const { triggerSynchronizationError } = require('./trigger-cards')

const updateToken = async (token, value, id, app) => {
  try {
    await token.setValue(value)
  } catch (error) {
    app.log(`updateToken: Failed to update token '${id}': ${error.message || error}`)
  }
}

const getNextEventByCalendar = (app, calendarName, nextEvent, timezone) => {
  if (!nextEvent) {
    // app.log(`getNextEventByCalendar: nextEvent not set. Getting next event for calendar '${calendarName}'`);
    return getNextEvent({ timezone, calendars: app.variableMgmt.calendars, specificCalendarName: calendarName })
  }

  if (nextEvent && nextEvent.calendarName !== calendarName) {
    // app.log(`getNextEventByCalendar: nextEvent already set but for calendar '${nextEvent.calendarName}'. Getting next event for calendar '${calendarName}'`);
    return getNextEvent({ timezone, calendars: app.variableMgmt.calendars, specificCalendarName: calendarName })
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
const updateTokens = async options => {
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
  const eventsTomorrow = getTomorrowsEvents(eventOptions)

  let eventDuration

  if (nextEvent.event) {
    eventDuration = getTokenDuration(app, nextEvent.event)
  }

  // loop through flow tokens
  for await (const token of app.variableMgmt.flowTokens) {
    try {
      if (token.id === 'event_next_title') {
        await updateToken(token, nextEvent.event ? (nextEvent.event.summary || '') : '', token.id, app)
      } else if (token.id === 'event_next_startdate') {
        await updateToken(token, nextEvent.event ? nextEvent.event.start.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '', token.id, app)
      } else if (token.id === 'event_next_startstamp') {
        if (nextEvent.event) {
          if (nextEvent.event.datetype === 'date-time') {
            await updateToken(token, nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
          } else if (nextEvent.event.datetype === 'date') {
            await updateToken(token, `00${app.variableMgmt.dateTimeFormat.time.splitter}00`, token.id, app)
          }
        } else {
          await updateToken(token, '', token.id, app)
        }
      } else if (token.id === 'event_next_stopdate') {
        await updateToken(token, nextEvent.event ? nextEvent.event.end.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '', token.id, app)
      } else if (token.id === 'event_next_stopstamp') {
        if (nextEvent.event) {
          if (nextEvent.event.datetype === 'date-time') {
            await updateToken(token, nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
          } else if (nextEvent.event.datetype === 'date') {
            await updateToken(token, `00${app.variableMgmt.dateTimeFormat.time.splitter}00`, token.id, app)
          }
        } else {
          await updateToken(token, '', token.id, app)
        }
      } else if (token.id === 'event_next_duration') {
        await updateToken(token, nextEvent.event ? eventDuration.duration : '', token.id, app)
      } else if (token.id === 'event_next_duration_minutes') {
        await updateToken(token, nextEvent.event ? eventDuration.durationMinutes : -1, token.id, app)
      } else if (token.id === 'event_next_starts_in_minutes') {
        await updateToken(token, nextEvent.event ? nextEvent.startsIn : -1, token.id, app)
      } else if (token.id === 'event_next_stops_in_minutes') {
        await updateToken(token, nextEvent.event ? nextEvent.endsIn : -1, token.id, app)
      } else if (token.id === 'event_next_calendar_name') {
        await updateToken(token, nextEvent.event ? nextEvent.calendarName : '', token.id, app)
      } else if (token.id === 'events_today_title_stamps') {
        const value = getTokenEvents({ ...tokenEventsOptions, events: eventsToday }) || ''
        await updateToken(token, value, token.id, app)
      } else if (token.id === 'events_today_count') {
        await updateToken(token, eventsToday.length, token.id, app)
      } else if (token.id === 'events_tomorrow_title_stamps') {
        const value = getTokenEvents({ ...tokenEventsOptions, events: eventsTomorrow }) || ''
        await updateToken(token, value, token.id, app)
      } else if (token.id === 'events_tomorrow_count') {
        await updateToken(token, eventsTomorrow.length, token.id, app)
      } else if (token.id === 'icalcalendar_week_number') {
        await updateToken(token, moment({ timezone }).isoWeek(), token.id, app)
      }
    } catch (error) {
      app.log('updateTokens: Failed to update flow token', token.id, ':', error)

      triggerSynchronizationError({ app, calendar: '', error })
    }
  }

  // loop through calendar tokens
  let calendarNextEvent
  for await (const token of app.variableMgmt.calendarTokens) {
    try {
      const calendarId = token.id.replace(app.variableMgmt.calendarTokensPreId, '')
      const calendarName = calendarId
        .replace(app.variableMgmt.calendarTokensPostTodayCountId, '') // this must be replaced before calendarTokensPostTodayId to preserve the whole tag name
        .replace(app.variableMgmt.calendarTokensPostTodayId, '')
        .replace(app.variableMgmt.calendarTokensPostTomorrowCountId, '') // this must be replaced before calendarTokensPostTomorrowId to preserve the whole tag name
        .replace(app.variableMgmt.calendarTokensPostTomorrowId, '')
        .replace(app.variableMgmt.calendarTokensPostNextTitleId, '')
        .replace(app.variableMgmt.calendarTokensPostNextStartDateId, '')
        .replace(app.variableMgmt.calendarTokensPostNextStartTimeId, '')
        .replace(app.variableMgmt.calendarTokensPostNextEndDateId, '')
        .replace(app.variableMgmt.calendarTokensPostNextEndTimeId, '')
      const calendarType = calendarId.replace(`${calendarName}_`, '')
      // app.log(`calendarTokens: Setting token '${calendarType}' for calendar '${calendarName}'`);
      let value = ''

      if (calendarType.includes('today')) {
        const todaysEventsCalendar = getTodaysEvents({ timezone, calendars: app.variableMgmt.calendars, specificCalendarName: calendarName })
        // app.log(`updateTokens: Found '${todaysEventsCalendar.length}' events for today from calendar '${calendarName}'`);
        if (calendarType === 'today') {
          value = getTokenEvents({ ...tokenEventsOptions, events: todaysEventsCalendar }) || ''
        } else if (calendarType === 'today_count') {
          value = todaysEventsCalendar.length
        }
      } else if (calendarType.includes('tomorrow')) {
        const tomorrowsEventsCalendar = getTomorrowsEvents({ timezone, calendars: app.variableMgmt.calendars, specificCalendarName: calendarName })
        // app.log(`updateTokens: Found '${tomorrowsEventsCalendar.length}' events for tomorrow from calendar '${calendarName}'`);
        if (calendarType === 'tomorrow') {
          value = getTokenEvents({ ...tokenEventsOptions, events: tomorrowsEventsCalendar }) || ''
        } else if (calendarType === 'tomorrow_count') {
          value = tomorrowsEventsCalendar.length
        }
      } else if (calendarType === 'next_title') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent, timezone)
        value = calendarNextEvent.event ? (calendarNextEvent.event.summary || '') : ''
      } else if (calendarType === 'next_startdate') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent, timezone)
        value = calendarNextEvent.event ? calendarNextEvent.event.start.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : ''
      } else if (calendarType === 'next_starttime') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent, timezone)
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
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent, timezone)
        value = calendarNextEvent.event ? calendarNextEvent.event.end.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : ''
      } else if (calendarType === 'next_endtime') {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent, timezone)
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

      await updateToken(token, value, token.id, app)
    } catch (error) {
      app.log('updateTokens: Failed to update calendar token', token.id, ':', error)

      triggerSynchronizationError({ app, calendar: '', error })
    }
  }
}

/**
 * @prop {Homey.App} app App class inited by Homey
 * @param {Object} event Update tokens from this event
 */
const updateNextEventWithTokens = async (app, event) => {
  const { summary, start, end, calendarName } = event
  try {
    app.log(`updateNextEventWithTokens: Using event: '${summary}' - '${start}' in '${calendarName}'`)

    for await (const token of app.variableMgmt.nextEventWithTokens) {
      try {
        if (token.id.endsWith('_title')) {
          await updateToken(token, summary || '', token.id, app)
        } else if (token.id.endsWith('_startdate')) {
          await updateToken(token, start.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long), token.id, app)
        } else if (token.id.endsWith('_starttime')) {
          await updateToken(token, start.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
        } else if (token.id.endsWith('_enddate')) {
          await updateToken(token, end.locale(app.homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long), token.id, app)
        } else if (token.id.endsWith('_endtime')) {
          await updateToken(token, end.format(app.variableMgmt.dateTimeFormat.time.time), token.id, app)
        }
      } catch (error) {
        app.log('updateNextEventWithTokens: Failed to update next event with token', token.id, ':', error)

        triggerSynchronizationError({ app, calendar: calendarName, error, event: { summary } })
      }
    }
  } catch (error) {
    app.log('updateNextEventWithTokens: Failed to update next event with tokens:', error)
  }
}

module.exports = {
  updateTokens,
  updateNextEventWithTokens
}
