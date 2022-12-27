'use strict'

const { momentNow } = require('./moment-datetime')

/**
 * @typedef {Object} TokenEventsOptions
 * @prop {String} [timezone] The timezone to execute the task in (IANA)
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Array} events Array of event objects
 */

/**
 * @param {TokenEventsOptions} options
 * @returns {String} Token value containing all events summarized
 */
module.exports = options => {
  const { timezone, app, events } = options
  let value = ''
  const { momentNowRegular, momentNowWholeDay, momentNowUTC } = momentNow(timezone)

  events.forEach(event => {
    const now = event.fullDayEvent ? momentNowWholeDay : event.skipTZ ? momentNowUTC : momentNowRegular
    let eventValue = ''
    if (event.datetype === 'date-time') {
      if (event.start.isSame(event.end, 'day')) {
        eventValue = `${event.summary}; ${event.start.format(app.variableMgmt.dateTimeFormat.time)} ${app.homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.time)}`
      } else if (event.start.isSame(event.end, 'year')) {
        eventValue = `${event.summary}; ${!event.start.isSame(now, 'day') && !event.end.isSame(now, 'day') ? app.homey.__('flowTokens.events_today-tomorrow_startstamp_fullday') : `${event.start.format(app.variableMgmt.dateTimeFormat.short)} ${event.start.format(app.variableMgmt.dateTimeFormat.time)} ${app.homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.short)} ${event.end.format(app.variableMgmt.dateTimeFormat.time)}`}`
      } else {
        eventValue = `${event.summary}; ${!event.start.isSame(now, 'day') && !event.end.isSame(now, 'day') ? app.homey.__('flowTokens.events_today-tomorrow_startstamp_fullday') : `${event.start.format(app.variableMgmt.dateTimeFormat.long)} ${event.start.format(app.variableMgmt.dateTimeFormat.time)} ${app.homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.long)} ${event.end.format(app.variableMgmt.dateTimeFormat.time)}`}`
      }

      if (value === '') {
        value = `${eventValue}`
      } else {
        value += `; ${eventValue}`
      }
    } else if (event.datetype === 'date') {
      eventValue = `${event.summary}; ${app.homey.__('flowTokens.events_today-tomorrow_startstamp_fullday')}`
      if (value === '') {
        value = `${eventValue}`
      } else {
        value += `; ${eventValue}`
      }
    }
  })

  return value
}
