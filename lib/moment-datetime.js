'use strict'

const mt = require('moment-timezone')

/**
 * @typedef {Object} MomentDateTimeOptions
 * @prop {String} [timezone] The timezone to use on events (IANA)
 * @prop {Date} [date] The date to momentify
 * @prop {String} [format] The format to convert into
 */

/**
 * @param {MomentDateTimeOptions} options
 */
module.exports.moment = (options = {}) => {
  const { timezone, date, format } = options
  if (timezone) {
    if (format) return mt.tz(date || new Date(), format, timezone)
    return mt.tz(date || new Date(), timezone)
  }

  if (format) return mt(date || new Date(), format)
  return mt(date || new Date())
}

module.exports.momentNow = timezone => {
  const momentNowRegular = this.moment({ timezone })
  const momentNowWholeDay = this.moment().add(momentNowRegular.utcOffset(), 'minutes')

  return {
    momentNowRegular,
    momentNowWholeDay
  }
}
