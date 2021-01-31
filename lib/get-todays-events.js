'use strict'

const moment = require('moment')
const sortEvents = require('./sort-events')

module.exports = (calendars, specificCalendarName) => {
  const eventsToday = []
  const now = moment()

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
