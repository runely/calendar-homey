'use strict'

const moment = require('./moment-datetime')
const sortEvents = require('./sort-events')

/**
 * @typedef {Object} TodaysEventsOptions
 * @prop {String} [timezone] The timezone to execute the task in (IANA)
 * @prop {Array} calendars Array of calendars object ({ name, events })
 * @prop {String} [specificCalendarName] Limit next event from this calendar only
 */

/**
 * @param {TodaysEventsOptions} options
 * @returns {Array} Todays events
 */
module.exports = options => {
  const { timezone, calendars, specificCalendarName } = options
  const eventsToday = []
  const now = moment(timezone)

  calendars.forEach(calendar => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    calendar.events.forEach(event => {
      const startDiff = now.diff(event.start)
      const endDiff = now.diff(event.end)
      const startIsSameDay = event.start.isSame(now, 'day')

      const todayNotStartedYet = (startDiff < 0 && startIsSameDay)
      const todayAlreadyStarted = (startDiff > 0 && startIsSameDay && endDiff < 0)
      const startPastButNotEnded = (startDiff > 0 && !startIsSameDay && endDiff < 0)
      if (todayNotStartedYet || todayAlreadyStarted || startPastButNotEnded) {
        eventsToday.push({ ...event, calendarname: calendar.name })
      }
    })
  })

  sortEvents(eventsToday)
  return eventsToday
}
