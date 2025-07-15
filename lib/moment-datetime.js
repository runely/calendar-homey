'use strict'

const mt = require('moment-timezone')

/**
 * @typedef {import('moment').Moment} Moment
 */

/**
 * @typedef {object} MomentDateTimeOptions
 * @property {string} [timezone] - The timezone to use on events (IANA)
 * @property {Date|string|number|Moment} [date] - The date to use in moment
 * @property {string} [format] - The format to convert into
 */

/**
 * @param {MomentDateTimeOptions} options
 *
 * @returns {Moment}
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
 *
 * @returns {{momentNowRegular: Moment, momentNowUtcOffset: Moment}}
 */
const momentNow = (timezone) => {
  const momentNowRegular = moment({ timezone })
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
