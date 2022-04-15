'use strict'

const moment = require('moment-timezone')

module.exports = (timezone, date) => {
  if (timezone) return moment.tz(date || new Date(), timezone)
  return moment(date || new Date())
}
