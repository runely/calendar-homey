'use strict'

const { momentNow } = require('./moment-datetime')
const sortEvents = require('./sort-events')

/**
 * @typedef {import('../types/ExtendedCalendarEvents.type').ExtCalendarEvents} ExtendedCalendarEventList
 */

/**
 * @typedef {object} TomorrowsEventsOptions
 * @property {string} [timezone] - The timezone to execute the task in (IANA)
 * @property {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Array of calendars object ({ name, events })
 * @property {string} [specificCalendarName] - Limit next event from this calendar only
 */

/**
 * @param {TomorrowsEventsOptions} options
 *
 * @returns ExtendedCalendarEventList - Tomorrow's events
 */
module.exports = (options) => {
  const { timezone, calendars, specificCalendarName } = options
  const eventsTomorrow = []
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  const tomorrowStartRegular = momentNowRegular.add(1, 'day').startOf('day')
  const tomorrowStartUtcOffset = momentNowUtcOffset.add(1, 'day').startOf('day')

  calendars.forEach((calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    calendar.events.forEach((event) => {
      const tomorrowStart = event.fullDayEvent || event.skipTZ ? tomorrowStartUtcOffset : tomorrowStartRegular
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
