'use strict'

const { momentNow } = require('./moment-datetime')

/**
 * @typedef {Object} GetEventsToTriggerOptions
 * @prop {String} [timezone] The timezone to execute the task in (IANA)
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Array} calendars Array of calendars object ({ name, events })
 */

/**
 * @param {GetEventsToTriggerOptions} options
 * @returns {Array} Array of events to trigger
 */
module.exports = options => {
  const { timezone, app, calendars } = options
  const { momentNowRegular, momentNowWholeDay, momentNowUTC } = momentNow(timezone)

  const events = []
  calendars.forEach(calendar => {
    const calendarName = calendar.name
    app.log(`getEventsToTrigger: Checking calendar '${calendarName}' for events to trigger`)
    calendar.events.forEach(event => {
      const now = event.fullDayEvent ? momentNowWholeDay : event.skipTZ ? momentNowUTC : momentNowRegular
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
