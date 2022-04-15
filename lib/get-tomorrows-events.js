'use strict'

const moment = require('./moment-datetime')
const sortEvents = require('./sort-events')

/**
 * @typedef {Object} TomorrowsEventsOptions
 * @prop {String} [timezone] The timezone to execute the task in (IANA)
 * @prop {Array} calendars Array of calendars object ({ name, events })
 * @prop {String} [specificCalendarName] Limit next event from this calendar only
 */

/**
 * @param {TomorrowsEventsOptions} options
 * @returns {Array} Tomorrows events
 */
module.exports = options => {
  const { timezone, calendars, specificCalendarName } = options
  const eventsTomorrow = []
  const tomorrowStart = moment(timezone).add(1, 'day').startOf('day')

  calendars.forEach(calendar => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    calendar.events.forEach(event => {
      const startDiff = tomorrowStart.diff(event.start)
      const endDiff = tomorrowStart.diff(event.end)
      const startIsSameDay = event.start.isSame(tomorrowStart, 'day')

      const tomorrowNotStartedYet = (startDiff <= 0 && startIsSameDay)
      const startPastButNotEnded = (startDiff > 0 && !startIsSameDay && endDiff < 0)
      if (tomorrowNotStartedYet || startPastButNotEnded) {
        eventsTomorrow.push({ ...event, calendarname: calendar.name })
      }
    })
  })

  sortEvents(eventsTomorrow)
  return eventsTomorrow
}
