'use strict'

module.exports = (oldCalendars, query) => {
  const calendars = []

  oldCalendars.forEach(calendar => {
    calendars.push({ ...calendar, events: calendar.events.filter(event => event.summary.toLowerCase().includes(query.toLowerCase())) })
  })

  return calendars
}
