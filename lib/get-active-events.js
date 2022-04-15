'use strict'

const moment = require('./moment-datetime')
const getRegularEventEnd = require('./find-regular-event-end')
const hasData = require('./has-data')

const getDuration = (timezone, start, end) => Number.parseInt(moment(timezone, end).format('x'), 10) - Number.parseInt(moment(timezone, start).format('x'), 10)
const getEnd = (timezone, start, duration) => moment(timezone, Number.parseInt(start.format('x'), 10) + duration, 'x')

/**
 * @typedef {Object} GetActiveEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Object} data Calendar data parsed in from "get-ical-content.js"
 * @prop {Object} eventLimit Calendar event limit from Settings page
 * @prop {Homey.App} app App class inited by Homey
 */

/**
 * @param {UpdateTokensOptions} options
 */
module.exports = options => {
  const { timezone, data, eventLimit, app } = options
  const now = moment(timezone)
  const eventLimitStart = moment(timezone).startOf('day')
  const eventLimitEnd = moment(timezone).endOf('day').add(Number.parseInt(eventLimit.value, 10), eventLimit.type)
  const events = []

  for (const event of Object.values(data)) {
    if (event.type !== 'VEVENT') {
      continue
    }

    // set summary to be text value IF it's an object: https://github.com/jens-maus/node-ical/blob/cbb76af87ff6405f394acf993889742885cce0a0/ical.js#L78
    event.summary = typeof event.summary === 'object' ? event.summary.val : event.summary

    // stop if required properties are missing
    if (!hasData(event.start) || !hasData(event.end)) {
      throw new Error(`"DTSTART" and/or "DTEND" is missing in event with UID: ${event.uid}`)
    }

    // recurring event
    if (typeof event.rrule !== 'undefined') {
      // getting the set of start dates between eventLimitStart and eventLimitEnd
      //      Include dates which falls on until date: true||false
      const dates = event.rrule.between(eventLimitStart.toDate(), eventLimitEnd.toDate(), true)

      // getting the set of dates between rrule start and rrule until (if until is null, use eventLimitEnd.toDate())
      //      Include dates which falls on until date: true||false
      const rruleStart = (event.rrule.options && event.rrule.options.dtstart) || eventLimitStart.toDate()
      const rruleEnd = (event.rrule.options && event.rrule.options.until) || eventLimitEnd.toDate()
      const ongoingDates = event.rrule.between(rruleStart, rruleEnd, true).filter(date => !dates.map(d => d.getTime() === date.getTime()).includes(true))
      ongoingDates.forEach(date => dates.push(date))

      // the "dates" array contains the set of dates within our desired date range range that are valid
      // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
      // had its date changed from outside the range to inside the range.  One way to handle this is
      // to add *all* recurrence override entries into the set of dates that we check, and then later
      // filter out any recurrences that don't actually belong within our range.
      if (event.recurrences !== undefined) {
        for (const recurrenceDate of Object.keys(event.recurrences)) { // TODO: Must be fairly tested!!!!!!!!!!!!!!
          // only add dates that weren't already in the range we added from the rrule so that
          // we don't double-add those events.
          const rDate = new Date(recurrenceDate)
          if (moment(timezone, rDate).isBetween(eventLimitStart, eventLimitEnd) === true) {
            const existAlready = dates.filter(date => date === rDate)
            if (!existAlready) {
              dates.push(rDate)
            }
          }
        }
      }

      dates.forEach(date => {
        let newEvent = { ...event }
        let duration = getDuration(timezone, event.start, event.end)
        let addEvent = true
        const offsetThis = date.getTimezoneOffset()
        // hacky wacky shitty thing that works and takes dst into account. Thanks to Mats!
        let start = moment(timezone, new Date(date.setHours(date.getHours() - ((event.start.getTimezoneOffset() - offsetThis) / 60))))
        let end = getEnd(timezone, start, duration)
        // handle start date set to 00:00:00 - For some reason they are stored as UTC 00:00:00, so to get them correctly we need to add the offset from the event.start one more time..... :O
        if (event.start.toUTCString().includes('00:00:00')) {
          start = moment(timezone, start).add(event.start.getTimezoneOffset(), 'minutes')
        }

        // use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
        const dateLookupKey = date.toISOString().slice(0, 10)
        // exdates are stored in UTC with GMT timezone. dates found with rrule.between are also stored in UTC BUT has no timezone information.
        // These dates can then be different even though they actually are the same.
        const previousDay = moment(timezone, new Date(date.setHours(date.getHours() - ((event.start.getTimezoneOffset() - offsetThis) / 60)))).subtract(1, 'day')
        const previousDayLookupKey = previousDay.toISOString().slice(0, 10)

        // for each date that we're checking, it's possible that there is a recurrence override for that one day.
        if (newEvent.recurrences !== undefined && newEvent.recurrences[dateLookupKey] !== undefined) {
          // we found an override, so for this recurrence, use a potentially different title, start date, and duration.
          const recdate = moment(timezone, newEvent.recurrences[dateLookupKey].start)
          if (recdate.isSame(start, 'day')) {
            newEvent = newEvent.recurrences[dateLookupKey]
            start = moment(timezone, newEvent.start)
            duration = getDuration(timezone, start, newEvent.end)
            end = getEnd(timezone, start, duration)
          }
        }
        // for each date that we're checking, it's possible that there is a recurrence override for that one day, and the UTC start time might even move back one day if different timezones
        if (newEvent.recurrences !== undefined && newEvent.recurrences[previousDayLookupKey] !== undefined) {
          // we found an override; because of timezones it appears as previousDay even though it is equal to date; so for this recurrence, use a potentially different title, start date, and duration.
          const recdate = moment(timezone, newEvent.recurrences[previousDayLookupKey].start)
          if (recdate.isSame(start, 'day')) {
            newEvent = newEvent.recurrences[previousDayLookupKey]
            start = moment(timezone, newEvent.start)
            duration = getDuration(timezone, start, newEvent.end)
            end = getEnd(timezone, start, duration)
          }
        }
        // make sure the end time hasn't already past and that start time isn't too long into the future
        if (end.isBefore(now) || start.isAfter(eventLimitEnd)) {
          addEvent = false
        } else if (newEvent.exdate !== undefined) {
          // if there's no recurrence override, check for an exception date. Exception dates represent exceptions to the rule.
          if (newEvent.exdate[dateLookupKey] !== undefined) {
            // this date is an exception date, which means we should skip it in the recurrence pattern.
            const exdate = moment(timezone, newEvent.exdate[dateLookupKey])
            if (exdate.isSame(start, 'day')) {
              app.log(`Skipping '${newEvent.uid}' @ `, date, '(', newEvent.exdate[dateLookupKey], ')', 'because it exists in exdate by date lookup key')
              addEvent = false
            }
          }
          if (newEvent.exdate[previousDayLookupKey] !== undefined && newEvent.datetype === 'date') {
            // this date is an exception date; because of timezones it appears as previousDay even though it is equal to date; which means we should skip it in the recurrence pattern.
            const exdate = moment(timezone, newEvent.exdate[previousDayLookupKey])
            if (exdate.isSame(start, 'day')) {
              app.log(`Skipping '${newEvent.uid}' @ `, date, '(', newEvent.exdate[previousDayLookupKey], ')', 'because it exists in exdate by previousDay lookup key')
              addEvent = false
            }
          }
        }

        if (addEvent) {
          newEvent.start = start
          newEvent.end = end
          newEvent.uid = `${newEvent.uid}_${start.toDate().toISOString().slice(0, 10)}`

          events.push(newEvent)
        }
      })
    } else {
      // regular event
      const start = moment(timezone, event.start)
      const end = getRegularEventEnd({ timezone, event })

      // only add event if
      //    end hasn't happend yet AND start is between eventLimitStart and eventLimitEnd
      // ||
      //    start has happend AND end hasn't happend yet (ongoing)
      if ((now.diff(end, 'seconds') < 0 && start.isBetween(eventLimitStart, eventLimitEnd) === true) || (now.diff(start, 'seconds') > 0 && now.diff(end, 'seconds') < 0)) {
        events.push({ ...event, start, end })
      }
    }
  }

  // keep only properties used
  return events.map(event => {
    const created = event.created ? moment(timezone, event.created) : undefined
    return {
      start: event.start,
      datetype: event.datetype,
      end: event.end,
      uid: event.uid,
      description: event.description,
      location: event.location,
      summary: event.summary,
      created
    }
  })
}
