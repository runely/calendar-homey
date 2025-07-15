'use strict'

/**
 * @typedef {import('../types/ExtendedCalendarEvents.type').ExtCalendarEvent} ExtendedCalendarEvent
 */

/**
 * @param {ExtendedCalendarEvent|import('../types/HomeyArgumentAutocompleteResult.type').ArgumentAutocompleteResult} a - Event
 * @param {ExtendedCalendarEvent|import('../types/HomeyArgumentAutocompleteResult.type').ArgumentAutocompleteResult} b - Event
 *
 * @returns {number}
 */
module.exports = (a, b) => {
  return a.start - b.start
}
