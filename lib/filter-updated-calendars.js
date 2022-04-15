'use strict'

const Homey = require('homey')
const hasData = require('./has-data')

const isChanged = (previous, current) => {
  if (hasData(previous) && hasData(current)) return previous.toString().toLowerCase() !== current.toString().toLowerCase()
  return (hasData(previous) && !hasData(current)) || (!hasData(previous) && hasData(current))
}

/**
 * @typedef {Object} FilterUpdatedCalendarsOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Array} oldCalendars Currently loaded calendars
 * @prop {Array} newCalendars Calendars to be loaded
 */

/**
 * @param {FilterUpdatedCalendarsOptions} options
 */
module.exports = options => {
  const { app, oldCalendars, newCalendars } = options
  const updatedCalendars = []
  newCalendars.forEach(newCalendar => {
    const newCalendarName = newCalendar.name
    const oldCalendar = oldCalendars.find(calendar => calendar.name === newCalendarName)
    const oldCalendarEvents = oldCalendar ? oldCalendar.events : []
    newCalendar.events.forEach(newEvent => {
      const oldEvent = oldCalendarEvents.find(event => event.uid === newEvent.uid)
      if (!oldEvent) return

      const changed = []
      if (isChanged(oldEvent.summary, newEvent.summary)) changed.push({ type: Homey.__('triggers.event_changed.summary'), previousValue: oldEvent.summary, newValue: newEvent.summary })
      if (isChanged(oldEvent.start, newEvent.start)) changed.push({ type: Homey.__('triggers.event_changed.start'), previousValue: `${oldEvent.start.format(app.variableMgmt.dateTimeFormat.date.long)} ${oldEvent.start.format(app.variableMgmt.dateTimeFormat.time.time)}`, newValue: `${newEvent.start.format(app.variableMgmt.dateTimeFormat.date.long)} ${newEvent.start.format(app.variableMgmt.dateTimeFormat.time.time)}` })
      if (isChanged(oldEvent.end, newEvent.end)) changed.push({ type: Homey.__('triggers.event_changed.end'), previousValue: `${oldEvent.end.format(app.variableMgmt.dateTimeFormat.date.long)} ${oldEvent.end.format(app.variableMgmt.dateTimeFormat.time.time)}`, newValue: `${newEvent.end.format(app.variableMgmt.dateTimeFormat.date.long)} ${newEvent.end.format(app.variableMgmt.dateTimeFormat.time.time)}` })
      if (isChanged(oldEvent.description, newEvent.description)) changed.push({ type: Homey.__('triggers.event_changed.description'), previousValue: oldEvent.description, newValue: newEvent.description })
      if (isChanged(oldEvent.location, newEvent.location)) changed.push({ type: Homey.__('triggers.event_changed.location'), previousValue: oldEvent.location, newValue: newEvent.location })

      if (changed.length > 0) {
        const updatedCalendar = updatedCalendars.find(calendar => calendar.name === newCalendarName)
        const updatedEvent = { ...newEvent, changed }
        if (updatedCalendar) updatedCalendar.events.push(updatedEvent)
        else updatedCalendars.push({ name: newCalendarName, events: [updatedEvent] })
      }
    })
  })

  return updatedCalendars
}
