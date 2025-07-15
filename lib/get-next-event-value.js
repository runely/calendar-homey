'use strict'

const { momentNow } = require('./moment-datetime')

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementCalendarEvent} VariableMgmtCalendarEvent
 */

/**
 * @param {string} type
 * @param {VariableMgmtCalendarEvent} event
 * @param {string} value
 *
 * @returns boolean
 */
const typeContaining = (type, event, value) => event[type] && event[type].toLowerCase().includes(value.toLowerCase())

/**
 * @typedef {object} NextEventValueOptions
 * @property {string} [timezone] - The timezone to execute the task in (IANA)
 * @property {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Array of calendars object ({ name, events })
 * @property {string} specificCalendarName - Limit next event from this calendar only
 * @property {string} value - Find next event which includes "value"
 * @property {'starts'|'ends'} eventType - Specifies if events returned is based on when they start or when they end
 * @property {string} [type] - Find next event based on this property
 */

/**
 * @param {NextEventValueOptions} options
 *
 * @returns VariableMgmtCalendarEvent
 */
module.exports = (options) => {
  const { timezone, calendars, specificCalendarName, value, eventType, type } = options
  const types = ['summary']
  let minutesUntil = 1000000000000000000000000000
  let nextEvent = {}
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)

  if (eventType !== 'starts' && eventType !== 'ends') {
    throw new Error('"eventType" only supports "starts" and "ends"')
  }

  calendars.forEach((calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return
    }

    const calendarEvents = calendar.events.filter((event) => {
      if (type) {
        return typeContaining(type, event, value)
      }
      return types.map((typesType) => typeContaining(typesType, event, value)).includes(true)
    })
    calendarEvents.forEach((event) => {
      const now = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular
      const diff = Math.round((eventType === 'starts' ? event.start : event.end).diff(now, 'minutes', true))

      if (diff >= 0 && diff < minutesUntil) {
        minutesUntil = diff
        nextEvent = {
          ...event,
          calendarName: calendar.name
        }
      }
    })
  })

  return nextEvent
}
