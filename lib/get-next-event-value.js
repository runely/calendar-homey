'use strict'

const { momentNow } = require('./moment-datetime')

/**
 * @typedef {Object} NextEventValueOptions
 * @prop {String} [timezone] The timezone to execute the task in (IANA)
 * @prop {Array} calendars Array of calendars object ({ name, events })
 * @prop {String} specificCalendarName Limit next event from this calendar only
 * @prop {String} value Find next event which includes "value"
 * @prop {Object} type Find next event based on this property
 */

/**
 * @param {NextEventValueOptions} options
 * @returns {Object} Next upcomming event with
 */
module.exports = options => {
  const { timezone, calendars, specificCalendarName, value, type } = options
  let minutesUntilStart = 1000000000000000000000000000
  let nextEvent = {}
  const { momentNowRegular, momentNowWholeDay } = momentNow(timezone)

  calendars.forEach(calendar => {
    if (specificCalendarName && specificCalendarName !== calendar.name) return

    calendar.events.filter(event => event[type] && event[type].toLowerCase().includes(value.toLowerCase())).forEach(event => {
      const now = event.fullDayEvent ? momentNowWholeDay : momentNowRegular
      const startDiff = Math.round(event.start.diff(now, 'minutes', true))

      if (startDiff >= 0 && startDiff < minutesUntilStart) {
        minutesUntilStart = startDiff
        nextEvent = event
      }
    })
  })

  return nextEvent
}
