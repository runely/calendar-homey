'use strict'

const convertToMinutes = require('../lib/convert-to-minutes')
const { filterByCalendar } = require('../lib/filter-by')
const { setupHitCount, updateHitCount } = require('../lib/hit-count')

module.exports = (app) => {
  // add minutes in trigger listeners
  for (const triggerId of ['event_starts_in', 'event_stops_in']) {
    app.homey.flow.getTriggerCard(triggerId).registerRunListener((args, state) => {
      const minutes = convertToMinutes(args.when, args.type)
      const result = minutes === state.when
      if (result) {
        app.log(`Triggered '${triggerId}' with state:`, state)
        updateHitCount(app, triggerId, args)
      }

      return result
    })
  }

  // add calendar trigger listeners
  for (const triggerId of ['event_starts_calendar', 'event_stops_calendar', 'event_added_calendar', 'event_changed_calendar']) {
    const eventCalendar = app.homey.flow.getTriggerCard(triggerId)
    eventCalendar.registerRunListener((args, state) => {
      const result = args.calendar.name === state.calendarName
      if (result) {
        app.log(`Triggered '${triggerId}' with state:`, state)
        updateHitCount(app, triggerId, { calendar: args.calendar.name })
      }

      return result
    })

    eventCalendar.registerArgumentAutocompleteListener('calendar', (query, args) => {
      if (!app.variableMgmt.calendars) {
        app.warn(`${triggerId}.onAutocompleteListener: Calendars not set yet. Nothing to show...`)
        return false
      }

      if (query) {
        const filteredCalendar = filterByCalendar(app.variableMgmt.calendars, query) || []
        return filteredCalendar.map((calendar) => {
          return { id: calendar.name, name: calendar.name }
        })
      }

      return app.variableMgmt.calendars.map((calendar) => {
        return { id: calendar.name, name: calendar.name }
      })
    })
  }

  setupHitCount(app)
}
