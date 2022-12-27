'use strict'

const { momentNow } = require('./moment-datetime')
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
  const { momentNowRegular, momentNowWholeDay, momentNowUTC } = momentNow(timezone)
  const tomorrowStartRegular = momentNowRegular.add(1, 'day').startOf('day')
  const tomorrowStartWholeDay = momentNowWholeDay.add(1, 'day').startOf('day')
  const tomorrowStartUTC = momentNowUTC.add(1, 'day').startOf('day')

  calendars.forEach(calendar => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    calendar.events.forEach(event => {
      const tomorrowStart = event.fullDayEvent ? tomorrowStartWholeDay : event.skipTZ ? tomorrowStartUTC : tomorrowStartRegular
      const startDiff = tomorrowStart.diff(event.start)
      const endDiff = tomorrowStart.diff(event.end)
      const startIsSameDay = event.start.isSame(tomorrowStart, 'day')

      const tomorrowNotStartedYet = (startDiff <= 0 && startIsSameDay)
      const startPastButNotEnded = (startDiff > 0 && !startIsSameDay && endDiff < 0)
      if (tomorrowNotStartedYet || startPastButNotEnded) {
        eventsTomorrow.push({ ...event, calendarName: calendar.name })
      }
    })
  })

  sortEvents(eventsTomorrow)
  return eventsTomorrow
}
