'use strict'

const getEventsToTrigger = require('../lib/get-events-to-trigger')
const getTokenDuration = require('../lib/get-token-duration')
const getTokenValue = require('../lib/get-token-value')
const capitalize = require('../lib/capitalize')

const getErrorMessage = (app, error) => {
  if (error instanceof Error) return { message: error.message, stack: error.stack }
  if (typeof error === 'string') return { message: error }
  if (error.data && typeof error.data === 'string') {
    if (error.stack) return { message: error.data, stack: error.stack }
    return { message: error.data }
  }
  if (error.data && error.data.message && typeof error.data.message === 'string') {
    if (error.data.stack) return { message: error.data.message, stack: error.data.stack }
    return { message: error.data.message }
  }
  if (error.message && typeof error.message === 'string') {
    if (error.stack) return { message: error.message, stack: error.stack }
    return { message: error.message }
  }

  app.log('getErrorMessage: Error is of type', typeof error)
  return { message: error }
}

/**
 * @typedef {Object} TriggerSynchroniztionErrorOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {String} calendar Calendar name with synchronization error
 * @prop {any} error Synchronization error
 * @prop {Object} [event] Event error originated from (if any)
 */

/**
 * @param {TriggerSynchroniztionErrorOptions} options
 */
module.exports.triggerSynchronizationError = async options => {
  const { app, calendar, error, event } = options
  try {
    const { message, stack } = getErrorMessage(app, error)
    app.log(`triggerSynchronizationError: Triggering on '${calendar}'${event ? ` for event '${event.summary || ''}' (${event.uid})` : ' on loading'}`, '-', message, '-', stack || '')
    const tokens = {
      calendar_name: calendar,
      calendar_error: message,
      on_calendar_load: event === undefined || event === null,
      on_event_load: event !== undefined && event !== null && typeof event === 'object' && Object.keys(event).length > 0,
      event_name: event ? event.summary || '' : '',
      event_uid: event ? event.uid || '' : ''
    }
    app.log('triggerSynchronizationError: Triggering "synchronization_error" with tokens :', tokens)
    const triggerCard = app.homey.flow.getTriggerCard('synchronization_error')
    await triggerCard.trigger(tokens)
    app.log('triggerSynchronizationError: Triggered "synchronization_error"')
  } catch (err) {
    app.log('triggerSynchronizationError: Failed to trigger "synchronization_error" :', err)
  }
}

/**
 * @typedef {Object} TriggerChangedCalendarsOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Array} calendars Currently loaded calendars
 */

/**
 * @param {TriggerChangedCalendarsOptions} options
 */
module.exports.triggerChangedCalendars = async options => {
  const { app, calendars } = options
  try {
    for await (const calendar of calendars) {
      for await (const event of calendar.events) {
        const tokens = {
          event_name: getTokenValue(event.summary),
          event_calendar_name: calendar.name,
          event_type: event.changed[0].type,
          event_prev_value: getTokenValue(event.changed[0].previousValue),
          event_new_value: getTokenValue(event.changed[0].newValue)
        }
        try {
          await app.homey.flow.getTriggerCard('event_changed').trigger(tokens)
          app.log(`Triggered event_changed on '${event.uid}'`)
        } catch (error) {
          app.log(`triggerChangedCalendars: 'event_changed' failed to trigger on '${event.uid}' :`, error)

          this.triggerSynchronizationError({ app, calendar: calendar.name, error, event })
        }
      }
    }
  } catch (err) {
    app.log('triggerChangedCalendars: Failed to trigger changed calendar events :', err)
  }
}

/**
 * @typedef {Object} TriggerEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Object} [event] One single event to trigger
 */

/**
 * @param {TriggerEventsOptions} options
 */
module.exports.triggerEvents = async options => {
  const { timezone, app, event } = options
  const events = event ? [event] : getEventsToTrigger({ timezone, app, calendars: app.variableMgmt.calendars })

  for await (const eventTrigger of events) {
    const { calendarName, event, triggerId, state } = eventTrigger
    try {
      // add tokens for event
      const eventDuration = getTokenDuration(app, event)
      const tokens = {
        event_name: getTokenValue(event.summary),
        event_description: getTokenValue(event.description),
        event_location: getTokenValue(event.location),
        event_duration_readable: eventDuration.duration,
        event_duration: eventDuration.durationMinutes,
        event_calendar_name: calendarName,
        event_status: event.freebusy
      }

      if (triggerId === 'event_added') {
        tokens.event_start_date = event.start.format(app.variableMgmt.dateTimeFormat.long)
        tokens.event_start_time = event.start.format(app.variableMgmt.dateTimeFormat.time)
        tokens.event_end_date = event.end.format(app.variableMgmt.dateTimeFormat.long)
        tokens.event_end_time = event.end.format(app.variableMgmt.dateTimeFormat.time)
        tokens.event_weekday_readable = capitalize(event.start.format('dddd'))
        tokens.event_month_readable = capitalize(event.start.format('MMMM'))
        tokens.event_date_of_month = event.start.get('date')
      }

      // trigger flow card
      if (state === undefined) {
        try {
          await app.homey.flow.getTriggerCard(triggerId).trigger(tokens)
          app.log(`triggerEvents: Triggered '${triggerId}' without state for '${event.uid}'`)
        } catch (error) {
          app.log(`triggerEvents: '${triggerId}' without state failed to trigger on '${event.uid}':`, error)

          this.triggerSynchronizationError({ app, calendar: calendarName, error, event })
        }
      } else {
        try {
          await app.homey.flow.getTriggerCard(triggerId).trigger(tokens, state)
        } catch (error) {
          app.log(`triggerEvents: '${triggerId}' with state '${state}' failed to trigger:`, error)

          this.triggerSynchronizationError({ app, calendar: calendarName, error, event })
        }
      }
    } catch (err) {
      app.log('triggerEvents: Failed to trigger event', event.uid, 'from', calendarName, ':', err)
    }
  }
}
