'use strict'

const durationUnits = [
  {
    name: 'weeks',
    abbr: 'W'
  },
  {
    name: 'days',
    abbr: 'D'
  },
  {
    name: 'hours',
    abbr: 'H'
  },
  {
    name: 'minutes',
    abbr: 'M'
  },
  {
    name: 'seconds',
    abbr: 'S'
  }
]

const getDurationUnit = (str, unit) => {
  const regex = new RegExp(`\\d+${unit}`, 'g')
  return str.search(regex) >= 0 ? Number.parseInt(str.substring(str.search(regex), str.indexOf(unit)), 10) : 0
}

/**
 * @typedef {import('moment').Moment} Moment
 */

/**
 * @param {Moment|import('node-ical').DateWithTimeZone} date
 * @param {string} [timezone]
 *
 * @returns {Moment}
 */
// TODO: swap moment for value with timezone
const getMoment = (date, timezone) => {
  if (timezone) {
    return moment({ timezone, date })
  }
  return moment({ date })
}

/**
 * @typedef {object} FindRegularEventEndOptions
 * @property {string} [timezone] - The timezone to use on events (IANA)
 * @property {import('node-ical').VEvent|import('../types/VariableMgmt.type').VariableManagementLocalJsonEvent} event - The calendar event to work on
 */

/**
 * @param {FindRegularEventEndOptions} options
 *
 * @returns Moment
 */
// TODO: swap moment for value with timezone
module.exports = (options) => {
  const { timezone, event } = options
  if (event.end) {
    return event.skipTZ ? getMoment(event.end) : getMoment(event.end, timezone)
  }
  if (event.datetype && event.datetype === 'date' && (!event.duration || typeof event.duration !== 'string')) {
    return event.skipTZ ? getMoment(event.start).add(1, 'day') : getMoment(event.start, timezone).add(1, 'day')
  }
  if (event.datetype && event.datetype === 'date-time') {
    return event.skipTZ ? getMoment(event.start) : getMoment(event.start, timezone)
  }

  let end = event.skipTZ ? getMoment(event.start) : getMoment(event.start, timezone)
  durationUnits.forEach((unit) => {
    const durationUnit = getDurationUnit(event.duration, unit.abbr)
    end = event.duration.startsWith('-') ? end.subtract(durationUnit, unit.name) : end.add(durationUnit, unit.name)
  })
  return end
}
