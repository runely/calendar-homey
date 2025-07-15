'use strict'

const sortEvents = require('./sort-events')

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementCalendars} CalendarList
 */

/**
 * @param {CalendarList} calendars - Imported calendars
 *
 * @returns {CalendarList} - Imported calendars with events sorted
 */
module.exports = (calendars) => {
  return calendars.map((calendar) => {
    return { ...calendar, events: sortEvents(calendar.events) }
  })
}
