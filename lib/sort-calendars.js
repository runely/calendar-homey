'use strict'

const sortEvents = require('./sort-events')

/**
 * @param {Array} calendars - Imported calendars
 * @returns {Array} Imported calendars with events sorted
 */
module.exports = (calendars) => {
  return calendars.map((calendar) => {
    return { ...calendar, events: sortEvents(calendar.events) }
  })
}
