'use strict'

const sortEvent = require('./sort-event')

module.exports = events => {
  return events.sort((a, b) => sortEvent(a, b))
}
