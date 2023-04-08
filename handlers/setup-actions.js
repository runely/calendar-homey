'use strict'

const { calendarAutocomplete } = require('../lib/autocomplete')
const sortCalendarsEvents = require('../lib/sort-calendars')
const { newEvent } = require('../lib/generate-event-object')
const { saveLocalEvents } = require('../lib/local-events')
const { triggerEvents } = require('./trigger-cards')

const getDateTime = value => {
  const match = /[1-2][0-9][0-9][0-9]-(([0][1-9])||([1][0-2]))-(([0][1-9])||([1][0-9])||([2][0-9])||([3][0-1]))T([0-1][0-9]||[2][0-3]):[0-5][0-9]:[0-5][0-9]Z?/g.exec(value)
  return Array.isArray(match) && match.length > 0 ? match[0].toUpperCase() : null
}

/**
 * @prop {Homey.App} app App class inited by Homey
 */
module.exports = app => {
  // register run listener on action flow cards
  app.homey.flow.getActionCard('sync-calendar').registerRunListener(async (args, state) => {
    app.log(`sync-calendar: Action card triggered. ${app.isGettingEvents ? 'getEvents already running' : 'Triggering getEvents without reregistering tokens'}`)
    const getEventsFinished = app.isGettingEvents ? true : await app.getEvents()
    if (Array.isArray(getEventsFinished) && getEventsFinished.length > 0) throw new Error(getEventsFinished.join('\n\n'))
    return getEventsFinished
  })

  const newEventAction = app.homey.flow.getActionCard('new_event')
  newEventAction.registerRunListener(async (args, state) => {
    if (typeof args.event_name !== 'string' || args.event_name === '') {
      app.warn('new_event: Title is invalid:', args)
      return false
    }
    const startDate = getDateTime(args.event_start)
    const endDate = getDateTime(args.event_end)
    if (startDate === null || endDate === null) {
      app.warn('new_event: startDate and/or endDate is invalid:', args)
      return false
    }

    const event = newEvent(app, app.getTimezone(), args)
    app.log('new_event: Adding event', event)
    const calendar = app.variableMgmt.calendars.find(c => c.name === event.calendar)
    if (!calendar) {
      app.warn('new_event: Event', event.summary, 'not added because calendar', event.calendar, 'was not found')
      return false
    }

    app.log('new_event: Added', event.summary, 'to calendar', event.calendar)
    calendar.events.push(event)
    sortCalendarsEvents(app.variableMgmt.calendars)
    app.variableMgmt.localEvents.push(event)
    saveLocalEvents(app, app.variableMgmt.localEvents)
    await triggerEvents({ timezone: app.getTimezone(), app, event: { calendarName: event.calendar, event, triggerId: 'event_added' } })
  })
  newEventAction.registerArgumentAutocompleteListener('calendar', (query, args) => calendarAutocomplete(app, query))

  app.homey.flow.getActionCard('delete_event_name').registerRunListener(async (args, state) => {
    const event = Array.isArray(app.variableMgmt.localEvents) ? app.variableMgmt.localEvents.find(e => e.summary === args.event_name) : null
    if (!event) {
      app.warn('delete_event_name: Local event with title', args.event_name, 'not found')
      return false
    }

    const calendar = app.variableMgmt.calendars.find(c => c.name === event.calendar)
    if (!calendar) {
      app.warn('delete_event_name: Calendar', event.calendar, 'was not found')
      return false
    }

    const newCalendarEvents = calendar.events.filter(e => e.summary !== args.event_name)
    const removedEvents = calendar.events.length - newCalendarEvents.length
    calendar.events = newCalendarEvents
    app.variableMgmt.localEvents = app.variableMgmt.localEvents.filter(e => e.summary !== args.event_name)
    app.log('delete_event_name: Deleted', removedEvents, 'local events by title', args.event_name)
    saveLocalEvents(app, app.variableMgmt.localEvents)
  })
}
