'use strict'

const { moment } = require('./moment-datetime')

const isEventNew = (timezone, created) => {
  if (!created) return false

  const oneDay = 86400000
  const now = moment({ timezone })
  return (now - created) < oneDay
}

/**
 * @typedef {Object} GetNewEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Array} oldCalendarsUids UID's of currently loaded calendars
 * @prop {Array} newCalendarsUids UID's of calendars to be loaded
 * @prop {Array} calendarsEvents Calendars to be loaded in
 * @prop {Homey.App} app App class inited by Homey
 */

/**
 * @param {GetNewEventsOptions} options
 */
module.exports = (options) => {
  const { timezone, oldCalendarsUids, newCalendarsUids, calendarsEvents, app } = options
  if (oldCalendarsUids.length === 0) return []

  const newlyAddedEvents = newCalendarsUids.filter((newEvent) => !oldCalendarsUids.find((oldEvent) => newEvent.uid === oldEvent.uid))
  if (newlyAddedEvents.length === 0) return []

  const newEvents = []
  newlyAddedEvents.forEach((newEvent) => {
    const calendar = calendarsEvents.find((calendar) => calendar.name === newEvent.calendar)
    if (!calendar) {
      app.warn(`getNewEvents: Calendar '${newEvent.calendar}' not found 😬`)
      return
    }
    const event = calendar.events.find((event) => event.uid === newEvent.uid)
    if (!event) {
      app.warn(`getNewEvents: Event '${newEvent.uid}' in calendar '${newEvent.calendar}' not found 😬`)
      return
    }
    if (!isEventNew(timezone, event.created)) return
    app.log(`getNewEvents: Will trigger new event for event with uid '${event.uid}' from '${calendar.name}' with name '${event.summary}' created @ '${event.created}'`)
    newEvents.push({ ...event, calendarName: calendar.name })
  })

  return newEvents
}
