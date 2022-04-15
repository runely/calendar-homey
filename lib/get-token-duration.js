'use strict'

const Homey = require('homey')
const humanize = require('humanize-duration')

module.exports = event => {
  const durationMS = event.end.diff(event.start, 'milliseconds')
  const durationMinutes = event.end.diff(event.start, 'minutes')

  return {
    duration: humanize(durationMS, {
      language: Homey.__('locale.humanize'),
      largest: 3,
      units: ['y', 'mo', 'w', 'd', 'h', 'm'],
      round: true,
      conjunction: Homey.__('humanize.conjunction'),
      serialComma: false
    }),
    durationMinutes
  }
}
