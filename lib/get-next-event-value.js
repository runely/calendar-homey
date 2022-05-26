'use strict'

const { momentNow } = require('./moment-datetime')

const typeContaining = (type, event, value) => event[type] && event[type].toLowerCase().includes(value.toLowerCase())

/**
 * @typedef {Object} NextEventValueOptions
 * @prop {String} [timezone] The timezone to execute the task in (IANA)
 * @prop {Array} calendars Array of calendars object ({ name, events })
 * @prop {String} specificCalendarName Limit next event from this calendar only
 * @prop {String} value Find next event which includes "value"
 * @prop {Object} [type] Find next event based on this property
 */

/**
 * @param {NextEventValueOptions} options
 * @returns {Object} Next upcomming event with
 */
module.exports = options => {
  // TODO: Remove type before release
  const { timezone, calendars, specificCalendarName, value, type } = options
  const types = ['summary', 'location', 'description']
  let minutesUntilStart = 1000000000000000000000000000
  let nextEvent = {}
  const { momentNowRegular, momentNowWholeDay } = momentNow(timezone)

  calendars.forEach(calendar => {
    if (specificCalendarName && specificCalendarName !== calendar.name) return

    const calendarEvents = calendar.events.filter(event => type ? typeContaining(type, event, value) : types.map(typesType => typeContaining(typesType, event, value)).includes(true))
    calendarEvents.forEach(event => {
      const now = event.fullDayEvent ? momentNowWholeDay : momentNowRegular
      const startDiff = Math.round(event.start.diff(now, 'minutes', true))

      if (startDiff >= 0 && startDiff < minutesUntilStart) {
        minutesUntilStart = startDiff
        nextEvent = {
          ...event,
          calendarName: calendar.name
        }
      }
    })
  })

  return nextEvent
}
