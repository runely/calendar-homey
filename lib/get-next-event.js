'use strict'

const { momentNow } = require('./moment-datetime')

/**
 * @typedef {Object} NextEventOptions
 * @prop {String} [timezone] - The timezone to execute the task in (IANA)
 * @prop {Array} calendars - Array of calendars object ({ name, events })
 * @prop {String} [specificCalendarName] - Limit next event from this calendar only
 */

/**
 * @param {NextEventOptions} options
 * @returns {Object} Next upcoming event
 */
module.exports = (options) => {
  const { timezone, calendars, specificCalendarName } = options
  let minutesUntilStart = 1000000000000000000000000000
  const nextEvent = {}
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)

  calendars.forEach((calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    calendar.events.forEach((event) => {
      const now = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular
      const startDiff = Math.round(event.start.diff(now, 'minutes', true))
      const endDiff = Math.round(event.end.diff(now, 'minutes', true))

      if (startDiff >= 0 && startDiff < minutesUntilStart) {
        minutesUntilStart = startDiff
        nextEvent.startsIn = startDiff
        nextEvent.endsIn = endDiff
        nextEvent.event = event
        nextEvent.calendarName = calendar.name
      }
    })
  })

  return nextEvent
}
