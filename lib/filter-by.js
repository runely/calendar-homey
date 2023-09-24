'use strict'

const filterByProperty = (oldCalendars = [], query = '', prop = '', fullMatch = false) => {
  const calendars = []

  oldCalendars.forEach((calendar) => {
    calendars.push({
      ...calendar,
      events: calendar.events.filter((event) => {
        if (!fullMatch) {
          return event[prop].toLowerCase().includes(query.toLowerCase())
        } else {
          return event[prop] === query
        }
      })
    })
  })

  return calendars
}

module.exports.filterByCalendar = (calendars = [], name = '') => {
  return calendars.filter((calendar) => (calendar.name.toLowerCase().includes(name.toLowerCase())))
}

module.exports.filterBySummary = (oldCalendars = [], query = '', fullMatch = false) => {
  return filterByProperty(oldCalendars, query, 'summary', fullMatch)
}

module.exports.filterByDescription = (oldCalendars = [], query = '', fullMatch = false) => {
  return filterByProperty(oldCalendars, query, 'description', fullMatch)
}

module.exports.filterByLocation = (oldCalendars = [], query = '', fullMatch = false) => {
  return filterByProperty(oldCalendars, query, 'location', fullMatch)
}

module.exports.filterByUID = (oldCalendars = [], uid) => {
  return filterByProperty(oldCalendars, uid, 'uid', true)
}

module.exports.filterByProperty = filterByProperty
