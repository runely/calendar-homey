'use strict'

const { filterByCalendar } = require('./filter-by')

/**
 * @param {import('homey').App|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {String} query - The query to filter calendar list by
 */
module.exports.calendarAutocomplete = (app, query) => {
  if (!app.variableMgmt.calendars || app.variableMgmt.calendars.length <= 0) {
    app.warn('calendarAutocomplete: Calendars not set yet. Nothing to show...')
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
}
