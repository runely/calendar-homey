'use strict'

/**
 * @typedef {'equal'|'contains'|'starts with'|'ends with'} Matcher - Which matcher method to use
 */

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementCalendars} VariableMgmtCalendars
 */

/**
 * Returns an array of calendars where all calendar events have been filtered by a specified property
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} oldCalendars - Imported calendars
 * @param {string} query - The value to filter calendar events by prop
 * @param {string} prop - The property to filter calendar events by query
 * @param {Matcher} matcher - Which matcher method to use
 *
 * @returns VariableMgmtCalendars - Imported calendars where all calendar events have been filtered by a specified property
 */
const filterByProperty = (oldCalendars = [], query = '', prop = '', matcher = 'contains') => {
  const calendars = []

  oldCalendars.forEach((calendar) => {
    calendars.push({
      ...calendar,
      events: calendar.events.filter((event) => {
        if (event[prop] === undefined || event[prop] === null) {
          return false
        }

        if (matcher === 'equal') {
          return event[prop] === query
        } else if (matcher === 'contains') {
          return event[prop].toLowerCase().includes(query.toLowerCase())
        } else if (matcher === 'starts with') {
          return event[prop].toLowerCase().startsWith(query.toLowerCase())
        } else if (matcher === 'ends with') {
          return event[prop].toLowerCase().endsWith(query.toLowerCase())
        } else {
          return false
        }
      })
    })
  })

  return calendars
}

/**
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Imported calendars
 * @param {string} name - Name of the calendar to filter by
 *
 * @returns VariableMgmtCalendars - Array with the found calendar or an empty array
 */
const filterByCalendar = (calendars = [], name = '') => {
  return calendars.filter((calendar) => (calendar.name.toLowerCase().includes(name.toLowerCase())))
}

/**
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} oldCalendars - Imported calendars
 * @param {string} query - The value to filter calendar events by summary
 * @param {Matcher} matcher - Which matcher method to use
 *
 * @returns VariableMgmtCalendars - oldCalendars where all calendar events have been filtered by summary
 */
const filterBySummary = (oldCalendars = [], query = '', matcher = 'contains') => {
  return filterByProperty(oldCalendars, query, 'summary', matcher)
}

/**
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} oldCalendars - Imported calendars
 * @param {string} query - The value to filter calendar events by description
 * @param {Matcher} matcher - Which matcher method to use
 *
 * @returns VariableMgmtCalendars - oldCalendars where all calendar events have been filtered by description
 */
const filterByDescription = (oldCalendars = [], query = '', matcher = 'contains') => {
  return filterByProperty(oldCalendars, query, 'description', matcher)
}

/**
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} oldCalendars - Imported calendars
 * @param {string} query - The value to filter calendar events by location
 * @param {Matcher} matcher - Which matcher method to use
 *
 * @returns VariableMgmtCalendars - oldCalendars where all calendar events have been filtered by location
 */
const filterByLocation = (oldCalendars = [], query = '', matcher = 'contains') => {
  return filterByProperty(oldCalendars, query, 'location', matcher)
}

/**
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} oldCalendars - Imported calendars
 * @param {string} uid - The uid to filter calendar events by on prop uid
 *
 * @returns VariableMgmtCalendars - oldCalendars where all calendar events have been filtered by uid
 */
const filterByUID = (oldCalendars = [], uid) => {
  return filterByProperty(oldCalendars, uid, 'uid', 'equal')
}

module.exports = {
  filterByCalendar,
  filterByDescription,
  filterByLocation,
  filterByProperty,
  filterBySummary,
  filterByUID
}
