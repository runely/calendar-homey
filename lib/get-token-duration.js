'use strict'

const humanize = require('humanize-duration')

module.exports = (app, event) => {
  const durationMS = event.end.diff(event.start, 'milliseconds')
  const durationMinutes = event.end.diff(event.start, 'minutes')

  return {
    duration: humanize(durationMS, {
      language: app.homey.__('locale.humanize'),
      largest: 3,
      units: ['y', 'mo', 'w', 'd', 'h', 'm'],
      round: true,
      conjunction: app.homey.__('humanize.conjunction'),
      serialComma: false
    }),
    durationMinutes
  }
}
