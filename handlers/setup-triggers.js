'use strict'

const convertToMinutes = require('../lib/convert-to-minutes')
const { filterByCalendar } = require('../lib/filter-by')

module.exports = app => {
  // add trigger listeners

  // TODO: Don't think these should be here anymore. SDK3 register all cards internally
  /* new Homey.FlowCardTrigger('event_starts').register()
  new Homey.FlowCardTrigger('event_stops').register() */

  app.homey.flow.getTriggerCard('event_starts_in').registerRunListener((args, state) => {
    const minutes = convertToMinutes(args.when, args.type)
    const result = minutes === state.when
    if (result) {
      app.log('Triggered \'event_starts_in\' with state:', state)
    }

    return Promise.resolve(result)
  })

  app.homey.flow.getTriggerCard('event_stops_in').registerRunListener((args, state) => {
    const minutes = convertToMinutes(args.when, args.type)
    const result = minutes === state.when
    if (result) {
      app.log('Triggered \'event_stops_in\' with state:', state)
    }

    return Promise.resolve(result)
  })

  const eventStartsCalendar = app.homey.flow.getTriggerCard('event_starts_calendar')
  eventStartsCalendar.registerRunListener((args, state) => {
    const result = args.calendar.name === state.calendarName
    if (result) {
      app.log('Triggered \'event_starts_calendar\' with state:', state)
    }

    return Promise.resolve(result)
  })

  eventStartsCalendar.registerArgumentAutocompleteListener('calendar', (query, args) => {
    if (!app.variableMgmt.calendars) {
      app.log('event_starts_calendar.onAutocompleteListener: Calendars not set yet. Nothing to show...')
      return Promise.resolve(false)
    }

    if (query) { // TODO: Changed from : query && query !== ''
      const filteredCalendar = filterByCalendar(app.variableMgmt.calendars, query) || []
      return Promise.resolve(
        filteredCalendar.map(calendar => {
          return { id: calendar.name, name: calendar.name }
        })
      )
    }

    return Promise.resolve(
      app.variableMgmt.calendars.map(calendar => {
        return { id: calendar.name, name: calendar.name }
      })
    )
  })
}
