'use strict'

const sortEvent = require('./sort-event')

/**
 * @typedef {import('../types/ExtendedCalendarEvents.type').ExtCalendarEvents} ExtendedCalendarEventList
 */

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementCalendarEvents} VariableMgmtCalendarEvents
 */

/**
 * @param {ExtendedCalendarEventList|VariableMgmtCalendarEvents} events - Array of calendar events
 *
 * @returns {ExtendedCalendarEventList|VariableMgmtCalendarEvents} Calendar events sorted by start
 */
module.exports = (events) => {
  return events.sort((a, b) => sortEvent(a, b))
}
