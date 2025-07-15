'use strict'

const { momentNow } = require('./moment-datetime')

/**
 * @typedef {import('../types/TriggerEvents.type').TriggerEvents} TriggerEventList
 */

/**
 * @typedef {object} GetEventsToTriggerOptions
 * @property {string} [timezone] - The timezone to execute the task in (IANA)
 * @property {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @property {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Array of calendars object ({ name, events })
 */

/**
 * @param {GetEventsToTriggerOptions} options
 *
 * @returns TriggerEventList
 */
module.exports = (options) => {
  const { timezone, app, calendars } = options
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)

  const events = []
  calendars.forEach((calendar) => {
    const calendarName = calendar.name
    app.log(`getEventsToTrigger: Checking calendar '${calendarName}' for events to trigger`)
    calendar.events.forEach((event) => {
      const now = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular
      const startDiff = now.diff(event.start, 'seconds')
      const endDiff = now.diff(event.end, 'seconds')

      const resultStart = startDiff >= 0 && startDiff <= 55 && endDiff <= 0
      const resultEnd = endDiff >= 0 && endDiff <= 55
      const resultStartInCheck = !resultStart && startDiff < 0
      const resultEndInCheck = !resultEnd && endDiff < 0

      if (resultStart) {
        events.push({
          calendarName,
          event,
          triggerId: 'event_starts'
        })
        events.push({
          calendarName,
          event,
          triggerId: 'event_starts_calendar',
          state: { calendarName }
        })
      }

      if (resultEnd) {
        events.push({
          calendarName,
          event,
          triggerId: 'event_stops'
        })
        events.push({
          calendarName,
          event,
          triggerId: 'event_stops_calendar',
          state: { calendarName }
        })
      }

      if (resultStartInCheck) {
        const startsIn = Math.round(event.start.diff(now, 'minutes', true))
        events.push({
          calendarName,
          event,
          triggerId: 'event_starts_in',
          state: { when: startsIn }
        })
      }

      if (resultEndInCheck) {
        const endsIn = Math.round(event.end.diff(now, 'minutes', true))
        events.push({
          calendarName,
          event,
          triggerId: 'event_stops_in',
          state: { when: endsIn }
        })
      }
    })
  })

  return events
}
