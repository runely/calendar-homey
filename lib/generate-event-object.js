'use strict'

const { moment } = require('./moment-datetime')
const extractMeetingUrl = require('./extract-meeting-url')

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementCalendarEvent} CalendarEvent
 */

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementLocalEvent} LocalEvent
 */

/**
 * @typedef {import('../types/ExtendedVEvent.type').ExtNodeIcalVEvent} ExtendedNodeIcalVEvent
 */

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
 * @param {import('homey').App|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {String} timezone - The timezone to use on events (IANA)
 * @param {ExtendedNodeIcalVEvent} event - One single event
 * @returns {CalendarEvent}
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
 * @typedef {Object} NewEventOptions
 * @prop {String} event_name - Title of the event
 * @prop {String} event_description - Description for the event
 * @prop {String} event_start - ISOString representing the start datetime
 * @prop {String} event_end - ISOString representing the end datetime
 * @prop {Boolean} apply_timezone - Apply your timezone to start and end datetime
 * @prop {String} calendar - Calendar this event will be added to
 */

/**
 * @param {import('homey').App|import('../types/AppTests.type').AppTests} app - App class init by Homey
 * @param {String} timezone - The timezone to use on events (IANA)
 * @param {NewEventOptions} args
 * @returns {LocalEvent}
 */
module.exports.newEvent = (app, timezone, args) => {
  const { event_name: title, event_description: description, event_start: start, event_end: end, apply_timezone: applyTimezone, calendar: calendarName } = args
  const startDate = new Date(start)
  const endDate = new Date(end)

  const fullDayEvent = startDate.toUTCString().includes('00:00:00') && endDate.toUTCString().includes('00:00:00')
  const skipTZ = !applyTimezone || fullDayEvent
  const startMoment = skipTZ ? moment({ date: startDate }) : moment({ timezone, date: startDate })
  const endMoment = skipTZ ? moment({ date: endDate }) : moment({ timezone, date: endDate })
  if (!applyTimezone) {
    app.log('newEvent: Be aware: Since "applyTimezone" is set to false, startDate and endDate will not have your timezone applied:', startDate, startMoment, endDate, endMoment)
  }
  const datetype = fullDayEvent ? 'date' : 'date-time'

  // set start and end with correct locale (supports only the languages in the locales folder!)
  startMoment.locale(app.homey.__('locale.moment'))
  endMoment.locale(app.homey.__('locale.moment'))

  const obj = newEventObject(startMoment, datetype, endMoment, `local_${start}`, description || '', '', title, moment({ timezone }), fullDayEvent, skipTZ, '', '')
  return { ...obj, local: true, calendar: calendarName.name }
}
