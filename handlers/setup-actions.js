'use strict'

const { calendarAutocomplete } = require('../lib/autocomplete')
const sortCalendarsEvents = require('../lib/sort-calendars')
const { newEvent } = require('../lib/generate-event-object')
const { saveLocalEvents } = require('../lib/local-events')
const getTokenValue = require('../lib/get-token-value')
const getTokenDuration = require('../lib/get-token-duration')
const { triggerEvents } = require('./trigger-cards')

const getDateTime = (value) => {
  const match = /[1-2][0-9][0-9][0-9]-(([0][1-9])||([1][0-2]))-(([0][1-9])||([1][0-9])||([2][0-9])||([3][0-1]))T([0-1][0-9]||[2][0-3]):[0-5][0-9]:[0-5][0-9]Z?/g.exec(value)
  return Array.isArray(match) && match.length > 0 ? match[0].toUpperCase() : null
}

/**
 * @prop {Homey.App} app App class inited by Homey
 */
module.exports = (app) => {
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
      throw new Error(app.homey.__('actions.new_event.titleInvalid'))
    }
    const startDate = getDateTime(args.event_start)
    const endDate = getDateTime(args.event_end)
    if (startDate === null) {
      app.warn('new_event: startDate is invalid:', args)
      throw new Error(app.homey.__('actions.new_event.startInvalid'))
    } else if (endDate === null) {
      app.warn('new_event: endDate is invalid:', args)
      throw new Error(app.homey.__('actions.new_event.endInvalid'))
    }

    const event = newEvent(app, app.getTimezone(), args)
    app.log('new_event: Adding event', event)
    const calendar = app.variableMgmt.calendars.find((c) => c.name === event.calendar)
    if (!calendar) {
      app.warn('new_event: Event', event.summary, 'not added because calendar', event.calendar, 'was not found')
      throw new Error(`${app.homey.__('actions.calendarNotFoundOne')} ${event.calendar} ${app.homey.__('actions.calendarNotFoundTwo')}`)
    }

    app.log('new_event: Added', event.summary, 'to calendar', event.calendar)
    calendar.events.push(event)
    sortCalendarsEvents(app.variableMgmt.calendars)
    app.variableMgmt.localEvents.push(event)
    saveLocalEvents(app, app.variableMgmt.localEvents)
    await triggerEvents({ timezone: app.getTimezone(), app, event: { calendarName: event.calendar, event, triggerId: 'event_added' } })

    return true
  })
  newEventAction.registerArgumentAutocompleteListener('calendar', (query, args) => calendarAutocomplete(app, query))

  app.homey.flow.getActionCard('delete_event_name').registerRunListener(async (args, state) => {
    const event = Array.isArray(app.variableMgmt.localEvents) ? app.variableMgmt.localEvents.find((e) => e.summary === args.event_name) : null
    if (!event) {
      app.warn('delete_event_name: Local event with title', args.event_name, 'not found')
      throw new Error(`${app.homey.__('actions.delete_event_name.eventNotFoundOne')} ${args.event_name} ${app.homey.__('actions.delete_event_name.eventNotFoundTwo')}`)
    }

    const calendar = app.variableMgmt.calendars.find((c) => c.name === event.calendar)
    if (!calendar) {
      app.warn('delete_event_name: Calendar', event.calendar, 'was not found')
      throw new Error(`${app.homey.__('actions.calendarNotFoundOne')} ${event.calendar} ${app.homey.__('actions.calendarNotFoundTwo')}`)
    }

    const newCalendarEvents = calendar.events.filter((e) => e.summary !== args.event_name)
    const removedEvents = calendar.events.length - newCalendarEvents.length
    calendar.events = newCalendarEvents
    app.variableMgmt.localEvents = app.variableMgmt.localEvents.filter((e) => e.summary !== args.event_name)
    app.log('delete_event_name: Deleted', removedEvents, 'local events by title', args.event_name)
    saveLocalEvents(app, app.variableMgmt.localEvents)
  })

  app.homey.flow.getActionCard('get_calendars_metadata').registerRunListener((args, state) => {
    if (!app.variableMgmt.calendars || app.variableMgmt.calendars.length === 0) {
      throw new Error('Calendars not set yet')
    }

    return {
      json: JSON.stringify(app.variableMgmt.calendars.map((calendar) => {
        return {
          calendarName: calendar.name,
          events: calendar.events.map((event, index) => index)
        }
      }))
    }
  })

  const getCalendarEvent = app.homey.flow.getActionCard('get_calendar_event')
  getCalendarEvent.registerRunListener((args, state) => {
    if (!app.variableMgmt.calendars || app.variableMgmt.calendars.length === 0) {
      throw new Error('Calendars not set yet')
    }

    const calendar = app.variableMgmt.calendars.find((cal) => cal.name === args.calendar.name)
    if (!calendar) {
      throw new Error(`Calendar '${args.calendar.name}' not found`)
    }

    const eventIndex = args.index
    if (eventIndex >= calendar.events.length) {
      throw new Error(`Index out of bounce. Index:${eventIndex}, EventCount:${calendar.events.length}`)
    }

    const event = calendar.events[eventIndex]
    if (!event) {
      throw new Error(`Event with index ${eventIndex} in calendar '${calendar.name}' was not found`)
    }

    const eventDuration = getTokenDuration(app, event)
    return {
      event_start: event.start.format(`${app.variableMgmt.dateTimeFormat.long} ${app.variableMgmt.dateTimeFormat.time}`),
      event_end: event.end.format(`${app.variableMgmt.dateTimeFormat.long} ${app.variableMgmt.dateTimeFormat.time}`),
      event_uid: event.uid,
      event_name: getTokenValue(event.summary),
      event_description: getTokenValue(event.description),
      event_location: getTokenValue(event.location),
      event_created: event.created ? event.created.format(`${app.variableMgmt.dateTimeFormat.long} ${app.variableMgmt.dateTimeFormat.time}`) : '',
      event_fullday_event: event.fullDayEvent,
      event_duration_readable: eventDuration.duration,
      event_duration: eventDuration.durationMinutes,
      event_calendar_name: calendar.name,
      event_status: event.freebusy,
      event_meeting_url: event.meetingUrl
    }
  })
  getCalendarEvent.registerArgumentAutocompleteListener('calendar', (query, args) => calendarAutocomplete(app, query))
}
