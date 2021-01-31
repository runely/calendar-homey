'use strict'

module.exports = (oldCalendars, uid) => {
  const calendars = []

  oldCalendars.forEach(calendar => {
    calendars.push({ ...calendar, events: calendar.events.filter(event => event.uid === uid) })
  })

  return calendars
}
