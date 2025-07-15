'use strict'

const getNextEvent = require('../lib/get-next-event')
const getTodaysEvents = require('../lib/get-todays-events')
const getTomorrowsEvents = require('../lib/get-tomorrows-events')
const getTokenDuration = require('../lib/get-token-duration')
const getTokenEvents = require('../lib/get-token-events')
const { moment } = require('../lib/moment-datetime')
const { triggerSynchronizationError } = require('./trigger-cards')

/**
 * @param {string} tokenId
 * @param {string|number|boolean|import('@types/homey').Image} value
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 */
const updateToken = async (tokenId, value, app) => {
  try {
    const token = app.homey.flow.getToken(tokenId)
    if (token) {
      await token.setValue(value)
      return
    }

    app.warn(`updateToken: Token with id '${tokenId}' not found`)
  } catch (error) {
    app.logError(`updateToken: Failed to update token '${tokenId}': ${error.message || error}`)
  }
}

/**
 * @typedef {import('../types/NextEvent.type').NextEventObj} NextEvent
 */

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} calendarName
 * @param {NextEvent|null} nextEvent
 * @param {string} timezone
 *
 * @returns {NextEvent|null}
 */
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

  app.warn('getNextEventByCalendar: What what what????')
  return null
}

/**
 * @typedef {object} UpdateTokensOptions
 * @property {string} timezone - The timezone to use on events (IANA)
 * @property {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 */

/**
 * @param {UpdateTokensOptions} options
 */
const updateTokens = async (options) => {
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
  let nextEventStart = ''

  if (nextEvent.event) {
    eventDuration = getTokenDuration(app, nextEvent.event)
    nextEventStart = `Next event happening @ '${nextEvent.event.start}'. `
  }

  app.log(`updateTokens: ${nextEventStart}Updating today tag with ${eventsToday.length} events. Updating tomorrow tag with ${eventsTomorrow.length} events.`)

  // loop through flow tokens
  for await (const tokenId of app.variableMgmt.flowTokens) {
    try {
      if (tokenId === 'event_next_title') {
        await updateToken(tokenId, nextEvent.event ? (nextEvent.event.summary || '') : '', app)
      } else if (tokenId === 'event_next_startdate') {
        await updateToken(tokenId, nextEvent.event ? nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.long) : '', app)
      } else if (tokenId === 'event_next_startstamp') {
        if (nextEvent.event) {
          if (nextEvent.event.datetype === 'date-time') {
            await updateToken(tokenId, nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time), app)
          } else if (nextEvent.event.datetype === 'date') {
            await updateToken(tokenId, '00:00', app)
          }
        } else {
          await updateToken(tokenId, '', app)
        }
      } else if (tokenId === 'event_next_stopdate') {
        await updateToken(tokenId, nextEvent.event ? nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.long) : '', app)
      } else if (tokenId === 'event_next_stopstamp') {
        if (nextEvent.event) {
          if (nextEvent.event.datetype === 'date-time') {
            await updateToken(tokenId, nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time), app)
          } else if (nextEvent.event.datetype === 'date') {
            await updateToken(tokenId, '00:00', app)
          }
        } else {
          await updateToken(tokenId, '', app)
        }
      } else if (tokenId === 'event_next_duration') {
        await updateToken(tokenId, nextEvent.event ? eventDuration.duration : '', app)
      } else if (tokenId === 'event_next_duration_minutes') {
        await updateToken(tokenId, nextEvent.event ? eventDuration.durationMinutes : -1, app)
      } else if (tokenId === 'event_next_starts_in_minutes') {
        await updateToken(tokenId, nextEvent.event ? nextEvent.startsIn : -1, app)
      } else if (tokenId === 'event_next_stops_in_minutes') {
        await updateToken(tokenId, nextEvent.event ? nextEvent.endsIn : -1, app)
      } else if (tokenId === 'event_next_description') {
        await updateToken(tokenId, nextEvent.event ? (nextEvent.event.description || '') : '', app)
      } else if (tokenId === 'event_next_calendar_name') {
        await updateToken(tokenId, nextEvent.event ? nextEvent.calendarName : '', app)
      } else if (tokenId === 'events_today_title_stamps') {
        const value = getTokenEvents({ ...tokenEventsOptions, events: eventsToday }) || ''
        await updateToken(tokenId, value, app)
      } else if (tokenId === 'events_today_count') {
        await updateToken(tokenId, eventsToday.length, app)
      } else if (tokenId === 'events_tomorrow_title_stamps') {
        const value = getTokenEvents({ ...tokenEventsOptions, events: eventsTomorrow }) || ''
        await updateToken(tokenId, value, app)
      } else if (tokenId === 'events_tomorrow_count') {
        await updateToken(tokenId, eventsTomorrow.length, app)
      } else if (tokenId === 'icalcalendar_week_number') {
        await updateToken(tokenId, moment({ timezone }).isoWeek(), app)
      }
    } catch (error) {
      app.logError('updateTokens: Failed to update flow token', tokenId, ':', error)

      triggerSynchronizationError({ app, calendar: '', error })
        .catch(err => app.logError('updateTokens: Failed to complete triggerSynchronizationError(...):', err))
    }
  }

  // loop through calendar tokens
  let calendarNextEvent = null
  for await (const tokenId of app.variableMgmt.calendarTokens) {
    try {
      const calendarId = tokenId.replace(app.variableMgmt.calendarTokensPreId, '')
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
        .replace(app.variableMgmt.calendarTokensPostNextDescriptionId, '')
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
      }

      if (['next_title', 'next_startdate', 'next_starttime', 'next_enddate', 'next_endtime', 'next_description'].includes(calendarType)) {
        calendarNextEvent = getNextEventByCalendar(app, calendarName, calendarNextEvent, timezone)

        if (calendarType === 'next_title') {
          value = calendarNextEvent.event ? (calendarNextEvent.event.summary || '') : ''
        } else if (calendarType === 'next_startdate') {
          value = calendarNextEvent.event ? calendarNextEvent.event.start.format(app.variableMgmt.dateTimeFormat.long) : ''
        } else if (calendarType === 'next_starttime') {
          if (calendarNextEvent.event) {
            if (calendarNextEvent.event.datetype === 'date-time') {
              value = calendarNextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time)
            } else if (calendarNextEvent.event.datetype === 'date') {
              value = '00:00'
            }
          } else {
            value = ''
          }
        } else if (calendarType === 'next_enddate') {
          value = calendarNextEvent.event ? calendarNextEvent.event.end.format(app.variableMgmt.dateTimeFormat.long) : ''
        } else if (calendarType === 'next_endtime') {
          if (calendarNextEvent.event) {
            if (calendarNextEvent.event.datetype === 'date-time') {
              value = calendarNextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time)
            } else if (calendarNextEvent.event.datetype === 'date') {
              value = '00:00'
            }
          } else {
            value = ''
          }
        } else if (calendarType === 'next_description') {
          value = calendarNextEvent.event ? (calendarNextEvent.event.description || '') : ''
        }
      }

      await updateToken(tokenId, value, app)
    } catch (error) {
      app.logError('updateTokens: Failed to update calendar token', tokenId, ':', error)

      triggerSynchronizationError({ app, calendar: '', error })
        .catch(err => app.logError('updateTokens: Failed to complete triggerSynchronizationError(...):', err))
    }
  }
}

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendarEvent} event - Update tokens from this event
 */
const updateNextEventWithTokens = async (app, event) => {
  const { summary, start, end, description, calendarName } = event
  try {
    app.log(`updateNextEventWithTokens: Using event: '${summary}' - '${start}' in '${calendarName}'`)

    for await (const tokenId of app.variableMgmt.nextEventWithTokens) {
      try {
        if (tokenId.endsWith('_title')) {
          await updateToken(tokenId, summary || '', app)
        } else if (tokenId.endsWith('_startdate')) {
          await updateToken(tokenId, start.format(app.variableMgmt.dateTimeFormat.long), app)
        } else if (tokenId.endsWith('_starttime')) {
          await updateToken(tokenId, start.format(app.variableMgmt.dateTimeFormat.time), app)
        } else if (tokenId.endsWith('_enddate')) {
          await updateToken(tokenId, end.format(app.variableMgmt.dateTimeFormat.long), app)
        } else if (tokenId.endsWith('_endtime')) {
          await updateToken(tokenId, end.format(app.variableMgmt.dateTimeFormat.time), app)
        } else if (tokenId.endsWith('_description')) {
          await updateToken(tokenId, description || '', app)
        }
      } catch (error) {
        app.logError('updateNextEventWithTokens: Failed to update next event with token', tokenId, ':', error)

        triggerSynchronizationError({ app, calendar: calendarName, error, event: { summary } })
          .catch(err => app.logError('updateTokens/updateNextEventWithTokens: Failed to complete triggerSynchronizationError(...):', err))
      }
    }
  } catch (error) {
    app.logError('updateNextEventWithTokens: Failed to update next event with tokens:', error)
  }
}

module.exports = {
  updateTokens,
  updateNextEventWithTokens
}
