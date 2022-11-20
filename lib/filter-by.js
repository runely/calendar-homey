'use strict'

module.exports.filterByCalendar = (calendars = [], name = '') => {
  return calendars.filter(calendar => (calendar.name.toLowerCase().includes(name.toLowerCase())))
}

module.exports.filterBySummary = (oldCalendars = [], query = '') => {
  const calendars = []

  oldCalendars.forEach(calendar => {
    calendars.push({ ...calendar, events: calendar.events.filter(event => event.summary.toLowerCase().includes(query.toLowerCase())) })
  })

  return calendars
}

module.exports.filterByUID = (oldCalendars = [], uid) => {
  const calendars = []

  oldCalendars.forEach(calendar => {
    calendars.push({ ...calendar, events: calendar.events.filter(event => event.uid === uid) })
  })

  return calendars
}
