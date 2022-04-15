'use strict'

const moment = require('./moment-datetime')

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
 * @typedef {Object} FindRegularEventEndOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Object} event The calendar event to work on
 * @prop {Homey.App} [app] App class inited by Homey
 */

/**
 * @param {FindRegularEventEndOptions} options
 */
module.exports = options => {
  const { timezone, event } = options
  if (event.end) return moment(timezone, event.end)
  if (event.datetype && event.datetype === 'date' && (!event.duration || typeof event.duration !== 'string')) return moment(timezone, event.start).add(1, 'day')
  if (event.datetype && event.datetype === 'date-time') return moment(timezone, event.start)

  let end = moment(timezone, event.start)
  durationUnits.forEach(unit => {
    const durationUnit = getDurationUnit(event.duration, unit.abbr)
    end = event.duration.startsWith('-') ? end.subtract(durationUnit, unit.name) : end.add(durationUnit, unit.name)
  })
  return end
}
