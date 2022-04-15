'use strict'

const deepClone = require('lodash.clonedeep')

const getEventsToTrigger = require('../lib/get-events-to-trigger')
const getTokenDuration = require('../lib/get-token-duration')
const getTokenValue = require('../lib/get-token-value')
const capitalize = require('../lib/capitalize')

/**
 * @typedef {Object} TriggerEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Object} [event] One single event to trigger
 */

/**
 * @param {TriggerEventsOptions} options
 */
module.exports = async options => {
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
        event_calendar_name: calendarName
      }

      if (triggerId === 'event_added') {
        const newEvent = deepClone(event) // make a new copy of event to prevent that event.start also has its locale changed (deepClone needed since theres functions here)
        const { start } = newEvent
        start.locale(app.homey.__('locale.moment')) // TODO: Check out if homey.clock.getTimezone() can be used here instead

        tokens.event_start_date = event.start.format(app.variableMgmt.dateTimeFormat.date.long)
        tokens.event_start_time = event.start.format(app.variableMgmt.dateTimeFormat.time.time)
        tokens.event_end_date = event.end.format(app.variableMgmt.dateTimeFormat.date.long)
        tokens.event_end_time = event.end.format(app.variableMgmt.dateTimeFormat.time.time)
        tokens.event_weekday_readable = capitalize(start.format('dddd'))
        tokens.event_month_readable = capitalize(start.format('MMMM'))
        tokens.event_date_of_month = start.get('date')
      }

      // trigger flow card
      if (state === undefined) {
        try {
          await app.homey.flow.getTriggerCard(triggerId).trigger(tokens)
          app.log(`triggerEvents: Triggered '${triggerId}'`)
        } catch (error) {
          app.log(`triggerEvents: '${triggerId}' failed to trigger:`, error)

          // send exception to sentry
          app.sentry.captureException(error)
        }
      } else {
        try {
          await app.homey.flow.getTriggerCard(triggerId).trigger(tokens, state)
        } catch (error) {
          app.log(`triggerEvents: '${triggerId}' failed to trigger, state:`, state, 'Error:', error)

          // send exception to sentry
          app.sentry.captureException(error)
        }
      }
    } catch (err) {
      app.log('triggerEvents: Failed to trigger event', event.uid, 'from', calendarName, ':', err)

      app.sentry.captureException(err)
    }
  }
}
