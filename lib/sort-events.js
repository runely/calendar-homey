'use strict'

const sortEvent = require('./sort-event')

/**
 * @param {Array} events - Array of calendar events
 * @returns {Array} Calendar events sorted by start
 */
module.exports = (events) => {
  return events.sort((a, b) => sortEvent(a, b))
}
