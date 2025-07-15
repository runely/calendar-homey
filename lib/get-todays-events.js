'use strict'

const { momentNow } = require('./moment-datetime')
const sortEvents = require('./sort-events')

/**
 * @typedef {import('../types/ExtendedCalendarEvents.type').ExtCalendarEvents} ExtendedCalendarEventList
 */

/**
 * @typedef {object} TodaysEventsOptions
 * @property {string} [timezone] - The timezone to execute the task in (IANA)
 * @property {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Array of calendars object ({ name, events })
 * @property {string} [specificCalendarName] - Limit next event from this calendar only
 */

/**
 * @param {TodaysEventsOptions} options
 *
 * @returns ExtendedCalendarEventList - Today's events
 */
module.exports = (options) => {
  const { timezone, calendars, specificCalendarName } = options
  const eventsToday = []
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)

  calendars.forEach((calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    calendar.events.forEach((event) => {
      const now = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular
      const startDiff = now.diff(event.start)
      const endDiff = now.diff(event.end)
      const startIsSameDay = event.start.isSame(now, 'day')

      const todayNotStartedYet = (startDiff < 0 && startIsSameDay)
      const todayAlreadyStarted = (startDiff > 0 && startIsSameDay && endDiff < 0)
      const startPastButNotEnded = (startDiff > 0 && !startIsSameDay && endDiff < 0)
      if (todayNotStartedYet || todayAlreadyStarted || startPastButNotEnded) {
        eventsToday.push({ ...event, calendarName: calendar.name })
      }
    })
  })

  sortEvents(eventsToday)
  return eventsToday
}
