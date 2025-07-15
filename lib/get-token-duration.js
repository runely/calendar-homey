'use strict'

const humanize = require('humanize-duration')

/**
 * @typedef {import('../types/EventDuration.type').EventDurationObj} EventDuration
 */

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendarEvent} event - Calendar event
 *
 * @returns EventDuration
 */
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
