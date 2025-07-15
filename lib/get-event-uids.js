'use strict'

/**
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendars} calendars - Imported calendars
 *
 * @return import('../types/CalendarEventUids.type').CalendarEventUids
 */
module.exports = (calendars) => {
  return calendars.reduce((acc, curr) => {
    curr.events.forEach((event) => {
      if (!acc.find((accItem) => accItem.uid === event.uid)) {
        acc.push({ calendar: curr.name, uid: event.uid })
      }
    })
    return acc
  }, [])
}
