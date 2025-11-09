'use strict'

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} timezone - The timezone to use on events (IANA)
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendarEvents} events - Array of event objects
 * @param {string} caller - Name of the function calling. Defaults to 'condition'
 *
 * @returns boolean - true if any event is ongoing otherwise false
 */
const isEventOngoing = (app, timezone, events, caller = 'condition') => {
  // TODO: swap moment for value with timezone
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some((event) => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    // TODO: swap moment for date-fns?
    const startDiff = now.diff(event.start, 'seconds')
    const endDiff = now.diff(event.end, 'seconds')
    const result = (startDiff >= 0 && endDiff <= 0)
    if (result) {
      app.log(`isEventOngoing-${caller}: '${event.uid}' -- ${startDiff} seconds since start -- ${endDiff} seconds since end -- Ongoing: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} timezone - The timezone to use on events (IANA)
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendarEvents} events - Array of event objects
 * @param {number} when - Number of minutes to compare against (number given in a flow)
 *
 * @returns boolean - true if any event is "when" minutes until start otherwise false
 */
const isEventIn = (app, timezone, events, when) => {
  // TODO: swap moment for value with timezone
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some((event) => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    // TODO: swap moment for date-fns?
    const startDiff = event.start.diff(now, 'minutes', true)
    const result = (startDiff <= when && startDiff >= 0)
    if (result) {
      app.log(`isEventIn: '${event.uid}' -- ${startDiff} minutes until start -- Expecting ${when} minutes or less -- In: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {string} timezone - The timezone to use on events (IANA)
 * @param {import('../types/VariableMgmt.type').VariableManagementCalendarEvents} events - Array of event objects
 * @param {number} when - Number of minutes to compare against (number given in a flow)
 *
 * @returns boolean - true if any event is "when" minutes or less until end otherwise false
 */
const willEventNotIn = (app, timezone, events, when) => {
  // TODO: swap moment for value with timezone
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some((event) => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    // TODO: swap moment for date-fns?
    const endDiff = event.end.diff(now, 'minutes', true)
    const result = (endDiff < when && endDiff >= 0)
    if (result) {
      app.log(`willEventNotIn: '${event.uid}' -- ${endDiff} minutes until end -- Expecting ${when} minutes or less -- In: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

module.exports = {
  isEventOngoing,
  isEventIn,
  willEventNotIn
}
