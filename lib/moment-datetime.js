'use strict'

const mt = require('moment-timezone')

/**
 * @typedef {import('moment-timezone')} MomentTimezone
 */

/**
 * @typedef {Object} MomentDateTimeOptions
 * @prop {String} [timezone] - The timezone to use on events (IANA)
 * @prop {Date|string} [date] - The date to use in moment
 * @prop {String} [format] - The format to convert into
 */

/**
 * @param {MomentDateTimeOptions} options
 * @returns {MomentTimezone}
 */
const moment = (options = {}) => {
  const { timezone, date, format } = options
  if (timezone) {
    if (format) {
      return mt.tz(date || new Date(), format, timezone)
    }

    return mt.tz(date || new Date(), timezone)
  }

  if (format) {
    return mt(date || new Date(), format)
  }
  return mt(date || new Date())
}

/**
 * @param {string} timezone - The timezone to use on events (IANA)
 * @returns {{momentNowRegular: MomentTimezone, momentNowUtcOffset: MomentTimezone}}
 */
const momentNow = (timezone) => {
  const momentNowRegular = moment({timezone})
  const momentNowUtcOffset = moment().add(momentNowRegular.utcOffset(), 'minutes')

  return {
    momentNowRegular,
    momentNowUtcOffset
  }
}

module.exports = {
  momentInstance: mt,
  moment,
  momentNow
}
