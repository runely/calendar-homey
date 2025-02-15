'use strict'

const convertToMinutes = require('../lib/convert-to-minutes')
const { filterByCalendar } = require('../lib/filter-by')
const { setupHitCount } = require('../lib/hit-count')

module.exports = (app) => {
  // add minutes in trigger listeners
  for (const triggerId of ['event_starts_in', 'event_stops_in']) {
    app.homey.flow.getTriggerCard(triggerId).registerRunListener((args, state) => {
      const minutes = convertToMinutes(args.when, args.type)
      return minutes === state.when
    })
  }

  // add calendar trigger listeners
  for (const triggerId of ['event_starts_calendar', 'event_stops_calendar', 'event_added_calendar', 'event_changed_calendar']) {
    const eventCalendar = app.homey.flow.getTriggerCard(triggerId)
    eventCalendar.registerRunListener((args, state) => {
      return args.calendar.name === state.calendarName
    })

    eventCalendar.registerArgumentAutocompleteListener('calendar', (query, _) => {
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
