'use strict'

const { moment } = require('./moment-datetime')
const extractMeetingUrl = require('./extract-meeting-url')

const newEventObject = (start, datetype, end, uid, description, location, summary, created, fullDayEvent, skipTZ, freebusy, meetingUrl) => {
  return {
    start,
    datetype,
    end,
    uid,
    description,
    location,
    summary,
    created,
    fullDayEvent,
    skipTZ,
    freebusy,
    meetingUrl
  }
}

/**
 * @prop {Homey.App} app App class inited by Homey
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Object} event One single event
 */
module.exports.fromEvent = (app, timezone, event) => {
  const created = event.created ? moment({ timezone, date: event.created }) : undefined
  const freebusy = event['MICROSOFT-CDO-BUSYSTATUS'] || event['X-MICROSOFT-CDO-BUSYSTATUS'] || ''

  // set start and end with correct locale (supports only the languages in the locales folder!)
  event.start.locale(app.homey.__('locale.moment'))
  event.end.locale(app.homey.__('locale.moment'))

  // dig out a meeting url (if any)
  const meetingUrl = extractMeetingUrl(event) || ''

  const obj = newEventObject(event.start, event.datetype, event.end, event.uid, event.description, event.location, event.summary, created, event.datetype === 'date', event.skipTZ === true, freebusy, meetingUrl)
  return { ...obj, local: false }
}

/**
 * @prop {Homey.App} app App class inited by Homey
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {String} title Title of the event (will also be the description)
 * @prop {String} start ISOString representing the start datetime
 * @prop {String} end ISOString representing the end datetime
 * @prop {Boolean} applyTimezone Apply your timezone to start and end datetime
 * @prop {String} calendarName Calendar this event will be added to
 */
module.exports.newEvent = (app, timezone, title, start, end, applyTimezone, calendarName) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const fullDayEvent = startDate.toUTCString().includes('00:00:00') && endDate.toUTCString().includes('00:00:00')
  const skipTZ = !applyTimezone || fullDayEvent
  const startMoment = skipTZ ? moment({ date: startDate }) : moment({ timezone, date: startDate })
  const endMoment = skipTZ ? moment({ date: endDate }) : moment({ timezone, date: endDate })
  if (!applyTimezone) app.log('newEvent: Be aware: Since "applyTimezone" is set to false, startDate and endDate will not have your timezone applied:', startDate, startMoment, endDate, endMoment)
  const datetype = fullDayEvent ? 'date' : 'date-time'

  // set start and end with correct locale (supports only the languages in the locales folder!)
  startMoment.locale(app.homey.__('locale.moment'))
  endMoment.locale(app.homey.__('locale.moment'))

  const obj = newEventObject(startMoment, datetype, endMoment, `local_${start}`, title, '', title, moment({ timezone }), fullDayEvent, skipTZ, '', '')
  return { ...obj, local: true, calendar: calendarName }
}
