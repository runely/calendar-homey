'use strict'

const moment = require('moment-timezone')

/**
 * @typedef {Object} MomentDateTimeOptions
 * @prop {String} [timezone] The timezone to use on events (IANA)
 * @prop {Date} [date] The date to momentify
 * @prop {String} [format] The format to convert into
 */

/**
 * @param {MomentDateTimeOptions} options
 */
module.exports = options => {
  const { timezone, date, format } = options
  if (timezone) {
    if (format) return moment.tz(date || new Date(), format, timezone)
    return moment.tz(date || new Date(), timezone)
  }

  if (format) return moment(date || new Date(), format)
  return moment(date || new Date())
}
