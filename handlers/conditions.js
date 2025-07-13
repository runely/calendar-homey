'use strict'

const { momentNow } = require('../lib/moment-datetime')

/**
 * @param {import('homey').App} app App class init by Homey
 * @param {String} timezone The timezone to use on events (IANA)
 * @param {Array} events Array of event objects
 * @param {String} caller Name of the function calling. Defaults to 'condition'
 */
module.exports.isEventOngoing = (app, timezone, events, caller = 'condition') => {
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some((event) => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
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
 * @param {import('homey').App} app App class init by Homey
 * @param {String} timezone The timezone to use on events (IANA)
 * @param {Array} events Array of event objects
 * @param {Number} when Number of minutes to compare against (number given in a flow)
 */
module.exports.isEventIn = (app, timezone, events, when) => {
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some((event) => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    const startDiff = event.start.diff(now, 'minutes', true)
    const result = (startDiff <= when && startDiff >= 0)
    if (result) {
      app.log(`isEventIn: '${event.uid}' -- ${startDiff} minutes until start -- Expecting ${when} minutes or less -- In: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}

/**
 * @param {import('homey').App} app App class init by Homey
 * @param {String} timezone The timezone to use on events (IANA)
 * @param {Array} events Array of event objects
 * @param {Number} when Number of minutes to compare against (number given in a flow)
 */
module.exports.willEventNotIn = (app, timezone, events, when) => {
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  return events.some((event) => {
    const useOffset = event.fullDayEvent || event.skipTZ
    const now = useOffset ? momentNowUtcOffset : momentNowRegular
    const endDiff = event.end.diff(now, 'minutes', true)
    const result = (endDiff < when && endDiff >= 0)
    if (result) {
      app.log(`willEventNotIn: '${event.uid}' -- ${endDiff} minutes until end -- Expecting ${when} minutes or less -- In: ${result} -- Now:`, now, `-- Offset used: ${useOffset}`)
    }
    return result
  })
}
