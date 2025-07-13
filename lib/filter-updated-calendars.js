'use strict'

const hasData = require('./has-data')

const isChanged = (app, previous, current) => {
  if (hasData(previous) && hasData(current)) {
    return previous.toString().toLowerCase() !== current.toString().toLowerCase()
  }
  if (hasData(previous) && !hasData(current)) {
    app.warn(`filterUpdatedCalendars: Previous value had data but current value does not. This is probably a sync hiccup -- Previous: '${previous}' , Current: '${current}'`)
    return false
  }
  if (!hasData(previous) && hasData(current)) {
    app.warn(`filterUpdatedCalendars: Previous value did not have data but current value does. This is probably a sync hiccup -- Previous: '${previous}' , Current: '${current}'`)
    return false
  }

  return false
}

/**
 * @typedef {Object} FilterUpdatedCalendarsOptions
 * @prop {import('homey').App|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @prop {Array} oldCalendars - Currently loaded calendars
 * @prop {Array} newCalendars - Calendars to be loaded
 */

/**
 * @param {FilterUpdatedCalendarsOptions} options
 */
module.exports = (options) => {
  const { app, oldCalendars, newCalendars } = options
  const updatedCalendars = []
  newCalendars.forEach((newCalendar) => {
    const newCalendarName = newCalendar.name
    const oldCalendar = oldCalendars.find((calendar) => calendar.name === newCalendarName)
    const oldCalendarEvents = oldCalendar ? oldCalendar.events : []
    newCalendar.events.forEach((newEvent) => {
      const oldEvent = oldCalendarEvents.find((event) => event.uid === newEvent.uid)
      if (!oldEvent) {
        return
      }

      const changed = []
      const summaryChanged = isChanged(app, oldEvent.summary, newEvent.summary)
      const startChanged = isChanged(app, oldEvent.start, newEvent.start)
      const endChanged = isChanged(app, oldEvent.end, newEvent.end)
      const descriptionChanged = isChanged(app, oldEvent.description, newEvent.description)
      const locationChanged = isChanged(app, oldEvent.location, newEvent.location)

      if (summaryChanged) {
        changed.push({
          type: app.homey.__('triggers.event_changed.summary'),
          previousValue: oldEvent.summary,
          newValue: newEvent.summary
        })
      }
      if (startChanged) {
        changed.push({
          type: app.homey.__('triggers.event_changed.start'),
          previousValue: `${oldEvent.start.format(app.variableMgmt.dateTimeFormat.long)} ${oldEvent.start.format(app.variableMgmt.dateTimeFormat.time)}`,
          newValue: `${newEvent.start.format(app.variableMgmt.dateTimeFormat.long)} ${newEvent.start.format(app.variableMgmt.dateTimeFormat.time)}`
        })
      }
      if (endChanged) {
        changed.push({
          type: app.homey.__('triggers.event_changed.end'),
          previousValue: `${oldEvent.end.format(app.variableMgmt.dateTimeFormat.long)} ${oldEvent.end.format(app.variableMgmt.dateTimeFormat.time)}`,
          newValue: `${newEvent.end.format(app.variableMgmt.dateTimeFormat.long)} ${newEvent.end.format(app.variableMgmt.dateTimeFormat.time)}`
        })
      }
      if (descriptionChanged) {
        changed.push({
          type: app.homey.__('triggers.event_changed.description'),
          previousValue: oldEvent.description,
          newValue: newEvent.description
        })
      }
      if (locationChanged) {
        changed.push({
          type: app.homey.__('triggers.event_changed.location'),
          previousValue: oldEvent.location,
          newValue: newEvent.location
        })
      }

      if (changed.length > 0) {
        const updatedCalendar = updatedCalendars.find((calendar) => calendar.name === newCalendarName)
        const updatedEvent = { ...newEvent, changed, oldEvent }
        if (updatedCalendar) {
          updatedCalendar.events.push(updatedEvent)
        } else {
          updatedCalendars.push({ name: newCalendarName, events: [updatedEvent] })
        }

        app.log(`Updated event - Summary: '${oldEvent.summary}' -> '${newEvent.summary}' (${summaryChanged}) , Start: '${oldEvent.start}' -> '${newEvent.start}' (${startChanged}) , End: '${oldEvent.end}' -> '${newEvent.end}' (${endChanged}) , Description: '${oldEvent.description}' -> '${newEvent.description}' (${descriptionChanged}) , Location: '${oldEvent.location}' -> '${newEvent.location}' (${locationChanged})`)
      }
    })
  })

  return updatedCalendars
}
