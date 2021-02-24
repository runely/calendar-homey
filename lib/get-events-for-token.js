'use strict'

const Homey = require('homey')
const moment = require('moment')

module.exports = (app, events) => {
  let value = ''
  const now = moment()

  events.forEach(event => {
    let eventValue = ''
    if (event.datetype === 'date-time') {
      if (event.start.isSame(event.end, 'day')) {
        eventValue = `${event.summary}; ${event.start.format(app.variableMgmt.dateTimeFormat.time.time)} ${Homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.time.time)}`
      } else if (event.start.isSame(event.end, 'year')) {
        eventValue = `${event.summary}; ${!event.start.isSame(now, 'day') && !event.end.isSame(now, 'day') ? Homey.__('flowTokens.events_today-tomorrow_startstamp_fullday') : `${event.start.format(app.variableMgmt.dateTimeFormat.date.short)} ${event.start.format(app.variableMgmt.dateTimeFormat.time.time)} ${Homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.date.short)} ${event.end.format(app.variableMgmt.dateTimeFormat.time.time)}`}`
      } else {
        eventValue = `${event.summary}; ${!event.start.isSame(now, 'day') && !event.end.isSame(now, 'day') ? Homey.__('flowTokens.events_today-tomorrow_startstamp_fullday') : `${event.start.format(app.variableMgmt.dateTimeFormat.date.long)} ${event.start.format(app.variableMgmt.dateTimeFormat.time.time)} ${Homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.date.long)} ${event.end.format(app.variableMgmt.dateTimeFormat.time.time)}`}`
      }

      if (value === '') {
        value = `${eventValue}`
      } else {
        value += `; ${eventValue}`
      }
    } else if (event.datetype === 'date') {
      eventValue = `${event.summary}; ${Homey.__('flowTokens.events_today-tomorrow_startstamp_fullday')}`
      if (value === '') {
        value = `${eventValue}`
      } else {
        value += `; ${eventValue}`
      }
    }
  })

  return value
}
