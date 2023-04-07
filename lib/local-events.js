'use strict'

const { moment, momentNow } = require('./moment-datetime')
const getRegularEventEnd = require('./find-regular-event-end')

/**
 * @typedef {Object} GetLocalActiveEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Object} events Local events
 * @prop {Object} eventLimit Calendar event limit from Settings page
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Boolean} logAllEvents Debug: Should log all events?
 */

/**
 * @param {GetLocalActiveEventsOptions} options
 */
module.exports.getLocalActiveEvents = options => {
  const { timezone, events, eventLimit, app, logAllEvents } = options
  const { momentNowRegular, momentNowUtcOffset } = momentNow(timezone)
  const eventLimitStart = moment({ timezone }).startOf('day')
  const eventLimitEnd = moment({ timezone }).endOf('day').add(Number.parseInt(eventLimit.value, 10), eventLimit.type)
  const activeEvents = []

  for (const event of events) {
    const now = event.skipTZ ? momentNowUtcOffset : momentNowRegular

    event.start = new Date(event.start)
    event.end = new Date(event.end)
    const start = event.skipTZ ? moment({ date: event.start }) : moment({ timezone, date: event.start })
    const end = event.skipTZ ? getRegularEventEnd({ event }) : getRegularEventEnd({ timezone, event })
    event.created = moment({ timezone, date: new Date(event.created) })

    // only add event if
    //    end hasn't happend yet AND start is between eventLimitStart and eventLimitEnd
    // ||
    //    start has happend AND end hasn't happend yet (ongoing)
    if ((now.diff(end, 'seconds') < 0 && start.isBetween(eventLimitStart, eventLimitEnd) === true) || (now.diff(start, 'seconds') > 0 && now.diff(end, 'seconds') < 0)) {
      if (logAllEvents) {
        if (event.datetype === 'date') {
          // Regular full day event: Summary -- Start -- End -- Original Start UTC string -- UID
          app.log('Local regular full day event:', event.summary, '--', start, '--', end, '--', event.start.toUTCString(), '--', event.uid)
        } else {
          // Regular event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
          app.log('Local regular event:', event.summary, '--', start, '--', end, '--', event.start.toUTCString(), `-- TZ:${event.skipTZ ? 'missing/invalid' : timezone}`, '--', event.uid)
        }
      }

      // set start and end with correct locale (supports only the languages in the locales folder!)
      start.locale(app.homey.__('locale.moment'))
      end.locale(app.homey.__('locale.moment'))

      activeEvents.push({ ...event, start, end })
    }
  }

  return activeEvents
}

/**
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Object} events Local events
 */
module.exports.saveLocalEvents = (app, events) => {
  if (!Array.isArray(events)) {
    app.log('saveLocalEvents: No events to save')
    return
  }

  const json = JSON.stringify(events)
  app.homey.settings.set(app.variableMgmt.storage.localEvents, json)
  app.log('saveLocalEvents: Saved', events.length, 'local events')
}
