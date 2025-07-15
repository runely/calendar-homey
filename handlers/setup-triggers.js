'use strict'

const convertToMinutes = require('../lib/convert-to-minutes')
const { filterByCalendar } = require('../lib/filter-by')
const { updateHitCount, setupHitCount } = require('../lib/hit-count')

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 */
module.exports = (app) => {
  // add minutes in trigger listeners
  for (const triggerId of ['event_starts_in', 'event_stops_in']) {
    app.homey.flow.getTriggerCard(triggerId).registerRunListener((args, state) => {
      const minutes = convertToMinutes(args.when, args.type)
      const willTrigger = minutes === state.when
      if (willTrigger) {
        app.log('Triggered', triggerId, '. With minutes:', minutes, '. With state:', state, '. With args:', args)
        updateHitCount(app, triggerId, args)
      }
      return willTrigger
    })
  }

  // add calendar trigger listeners
  for (const triggerId of ['event_starts_calendar', 'event_stops_calendar', 'event_added_calendar', 'event_changed_calendar']) {
    const eventCalendar = app.homey.flow.getTriggerCard(triggerId)
    eventCalendar.registerRunListener((args, state) => {
      const willTrigger = args.calendar.name === state.calendarName
      if (willTrigger) {
        app.log('Triggered', triggerId, '. With state:', state, '. With args:', args)
        updateHitCount(app, triggerId, { calendar: args.calendar.name })
      }
      return willTrigger
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
