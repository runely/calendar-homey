'use strict'

const { filterByCalendar } = require('./filter-by')

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} query - The query to filter calendar list by
 *
 * @returns {import('homey').FlowCard.ArgumentAutocompleteResults}
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
