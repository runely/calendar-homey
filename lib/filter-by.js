'use strict'

const filterByProperty = (oldCalendars = [], query = '', prop = '', matcher = 'contains') => {
  const calendars = []

  oldCalendars.forEach((calendar) => {
    calendars.push({
      ...calendar,
      events: calendar.events.filter((event) => {
        if (event[prop] === undefined || event[prop] === null) {
          return false
        }

        if (matcher === 'equal') {
          return event[prop] === query
        } else if (matcher === 'contains') {
          return event[prop].toLowerCase().includes(query.toLowerCase())
        } else if (matcher === 'starts with') {
          return event[prop].toLowerCase().startsWith(query.toLowerCase())
        } else if (matcher === 'ends with') {
          return event[prop].toLowerCase().endsWith(query.toLowerCase())
        } else {
          return false
        }
      })
    })
  })

  return calendars
}

module.exports.filterByCalendar = (calendars = [], name = '') => {
  return calendars.filter((calendar) => (calendar.name.toLowerCase().includes(name.toLowerCase())))
}

module.exports.filterBySummary = (oldCalendars = [], query = '', matcher = 'contains') => {
  return filterByProperty(oldCalendars, query, 'summary', matcher)
}

module.exports.filterByDescription = (oldCalendars = [], query = '', matcher = 'contains') => {
  return filterByProperty(oldCalendars, query, 'description', matcher)
}

module.exports.filterByLocation = (oldCalendars = [], query = '', matcher = 'contains') => {
  return filterByProperty(oldCalendars, query, 'location', matcher)
}

module.exports.filterByUID = (oldCalendars = [], uid) => {
  return filterByProperty(oldCalendars, uid, 'uid', 'equal')
}

module.exports.filterByProperty = filterByProperty
