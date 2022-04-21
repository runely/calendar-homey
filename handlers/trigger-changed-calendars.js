'use strict'

const getTokenValue = require('../lib/get-token-value')

/**
 * @typedef {Object} TriggerChangedCalendarsOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Array} calendars Currently loaded calendars
 */

/**
 * @param {TriggerChangedCalendarsOptions} options
 */
module.exports = async options => {
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

          // send exception to sentry
          app.sentry.captureException(error)
        }
      }
    }
  } catch (err) {
    app.log('triggerChangedCalendars: Failed to trigger changed calendar events :', err)

    // send exception to sentry
    app.sentry.captureException(err)
  }
}
