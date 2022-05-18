'use strict'

const deepClone = require('lodash.clonedeep')
const { moment } = require('./moment-datetime')
const getRegularEventEnd = require('./find-regular-event-end')
const hasData = require('./has-data')
const { triggerSynchronizationError } = require('../handlers/trigger-cards')

const getDuration = (start, end) => Number.parseInt(moment({ date: end }).format('x'), 10) - Number.parseInt(moment({ date: start }).format('x'), 10)
const getEnd = (start, duration, timezone) => {
  if (timezone) return moment({ timezone, date: Number.parseInt(moment({ date: start }).format('x'), 10) + duration, format: 'x' })
  return moment({ date: Number.parseInt(moment({ date: start }).format('x'), 10) + duration, format: 'x' })
}
const convertToText = (app, prop, value) => {
  if (typeof value === 'object') {
    app.log(`getActiveEvents/convertToText - '${prop}' was object. Using 'val' of object`)
    return value.val
  }
  return value
}
const isIvalidTZ = tz => {
  const invalid = ['Customized Time Zone', 'undefined']
  return tz && invalid.map(i => tz.includes(i)).includes(true)
}
const removeInvalidTZ = (app, event) => {
  // remove 'Customized Time Zone*'
  try {
    if (isIvalidTZ(event.start.tz)) {
      app.log(`getActiveEvents: Invalid timezone (${event.start.tz}) found on`, event.summary)
      delete event.start.tz
      delete event.end.tz
      event.skipTZ = true
    }
    if (event.exdate) {
      for (const exdate in event.exdate) {
        if (isIvalidTZ(event.exdate[exdate].tz)) {
          delete event.exdate[exdate].tz
          delete event.exdate[exdate].tz
        }
      }
    }
    if (event.rrule) {
      if (event.rrule.origOptions && isIvalidTZ(event.rrule.origOptions.tzid)) {
        delete event.rrule.origOptions.tzid
        delete event.rrule.origOptions.tzid
      }
      if (event.rrule.options && isIvalidTZ(event.rrule.options.tzid)) {
        delete event.rrule.options.tzid
        delete event.rrule.options.tzid
      }
    }
  } catch (error) {
    app.log('getActiveEvents: Failed to remove invalid time zone:', error)

    // send exception to sentry
    app.sentry.captureException(error)
  }
}

/**
 * @typedef {Object} GetActiveEventsOptions
 * @prop {String} timezone The timezone to use on events (IANA)
 * @prop {Object} data Calendar data parsed in from "get-ical-content.js"
 * @prop {Object} eventLimit Calendar event limit from Settings page
 * @prop {String} calendarName Calendar name
 * @prop {Homey.App} app App class inited by Homey
 */

/**
 * @param {GetActiveEventsOptions} options
 */
module.exports = options => {
  const { timezone, data, eventLimit, calendarName, app } = options
  const now = moment({ timezone })
  const eventLimitStart = moment({ timezone }).startOf('day')
  const eventLimitEnd = moment({ timezone }).endOf('day').add(Number.parseInt(eventLimit.value, 10), eventLimit.type)
  const events = []

  for (const event of Object.values(data)) {
    if (event.type !== 'VEVENT') {
      continue
    }

    // set properties to be text value IF it's an object: https://github.com/jens-maus/node-ical/blob/cbb76af87ff6405f394acf993889742885cce0a0/ical.js#L78
    event.summary = convertToText(app, 'summary', event.summary)
    event.location = convertToText(app, 'location', event.location)
    event.description = convertToText(app, 'description', event.description)
    event.uid = convertToText(app, 'uid', event.uid)

    // stop if required properties are missing
    if (!hasData(event.start) || !hasData(event.end)) {
      triggerSynchronizationError({ app, calendar: calendarName, error: '"DTSTART" and/or "DTEND" is missing', event })
      throw new Error(`"DTSTART" and/or "DTEND" is missing in event with UID: ${event.uid}`)
    }

    // remove invalid timezones from event
    removeInvalidTZ(app, event)

    // recurring event
    if (typeof event.rrule !== 'undefined') {
      try {
        // getting the set of start dates between eventLimitStart and eventLimitEnd
        //      Include dates which falls on until date: true||false
        const dates = event.rrule.between(eventLimitStart.toDate(), eventLimitEnd.toDate(), true)

        // getting the set of dates between rrule start and rrule until (if until is null, use eventLimitEnd.toDate())
        //      Include dates which falls on until date: true||false
        const rruleStart = (event.rrule.options && event.rrule.options.dtstart) || eventLimitStart.toDate()
        const rruleEnd = (event.rrule.options && event.rrule.options.until) || eventLimitEnd.toDate()
        // first get all dates between start and end. then filter only those where date isn't after eventLimitEnd and isn't already present in dates
        const ongoingDates = event.rrule.between(rruleStart, rruleEnd, true).filter(date => !moment(date).isAfter(eventLimitEnd.toDate()) && !dates.map(d => d.getTime() === date.getTime()).includes(true))
        ongoingDates.forEach(date => dates.push(date))

        // the "dates" array contains the set of dates within our desired date range range that are valid
        // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
        // had its date changed from outside the range to inside the range.  One way to handle this is
        // to add *all* recurrence override entries into the set of dates that we check, and then later
        // filter out any recurrences that don't actually belong within our range.
        if (event.recurrences !== undefined) {
          for (const recurrenceDate of Object.keys(event.recurrences)) {
            // only add dates that weren't already in the range we added from the rrule so that
            // we don't double-add those events.
            const rDate = new Date(recurrenceDate)
            if (moment({ timezone, date: rDate }).isBetween(eventLimitStart, eventLimitEnd) === true) {
              const existAlready = dates.filter(date => date === rDate)
              if (!existAlready) {
                dates.push(rDate)
              }
            }
          }
        }

        // convert all recurring dates from UTC to local moment instances
        const localDates = dates.map(date => event.skipTZ ? moment({ date: date.toISOString() }) : moment({ timezone, date: date.toISOString() }))

        // used to print out recurring whole day events (only the first occurence)
        let logged = false
        localDates.forEach(date => {
          let newEvent = deepClone(event)
          if (event.exdate) {
            // "exdate" is an invalid array. And since "deepClone" only clones valid values, "exdate" becomes an empty array.
            // To make up for this we have to add the original "exdate" property to the cloned event object
            newEvent.exdate = event.exdate
          }
          let duration = getDuration(event.start, event.end)
          let addEvent = true
          const offsetThis = moment({ timezone, date: event.start }).utcOffset()
          let start = event.skipTZ ? moment({ date }) : moment({ timezone, date }).add(offsetThis, 'minutes')
          let end = event.skipTZ ? getEnd(start, duration) : getEnd(start, duration, timezone)

          if (event.start.toUTCString().includes('00:00:00')) {
            start = moment({ date: date.toDate() })
            end = getEnd(date.toDate(), duration)
          }

          // use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
          const dateLookupKey = date.toISOString().slice(0, 10)
          // exdates are stored in UTC with GMT timezone. dates found with rrule.between are also stored in UTC BUT has no timezone information.
          // These dates can then be different even though they actually are the same.
          const previousDay = (event.skipTZ ? moment({ date }) : moment({ timezone, date })).subtract(1, 'day')
          const previousDayLookupKey = previousDay.toISOString().slice(0, 10)

          // for each date that we're checking, it's possible that there is a recurrence override for that one day.
          if (newEvent.recurrences !== undefined && newEvent.recurrences[dateLookupKey] !== undefined) {
            // we found an override, so for this recurrence, use a potentially different title, start date, and duration.
            const recdate = event.skipTZ ? moment({ date: newEvent.recurrences[dateLookupKey].start }) : moment({ timezone, date: newEvent.recurrences[dateLookupKey].start })
            if (recdate.isSame(start, 'day')) {
              newEvent = deepClone(newEvent.recurrences[dateLookupKey])
              start = event.skipTZ ? moment({ date: newEvent.start }) : moment({ timezone, date: newEvent.start })
              duration = getDuration(newEvent.start, newEvent.end)
              end = event.skipTZ ? getEnd(start, duration) : getEnd(start, duration, timezone)
            }
          }
          // for each date that we're checking, it's possible that there is a recurrence override for that one day, and the UTC start time might even move back one day if different timezones
          if (newEvent.recurrences !== undefined && newEvent.recurrences[previousDayLookupKey] !== undefined) {
            // we found an override; because of timezones it appears as previousDay even though it is equal to date; so for this recurrence, use a potentially different title, start date, and duration.
            const recdate = event.skipTZ ? moment({ date: newEvent.recurrences[previousDayLookupKey].start }) : moment({ timezone, date: newEvent.recurrences[previousDayLookupKey].start })
            if (recdate.isSame(start, 'day')) {
              newEvent = deepClone(newEvent.recurrences[previousDayLookupKey])
              start = event.skipTZ ? moment({ date: newEvent.start }) : moment({ timezone, date: newEvent.start })
              duration = getDuration(newEvent.start, newEvent.end)
              end = event.skipTZ ? getEnd(start, duration) : getEnd(start, duration, timezone)
            }
          }
          // make sure the end time hasn't already past and that start time isn't too long into the future
          if (end.isBefore(now) || start.isAfter(eventLimitEnd)) {
            addEvent = false
          } else if (newEvent.exdate !== undefined) {
            // if there's no recurrence override, check for an exception date. Exception dates represent exceptions to the rule.
            if (newEvent.exdate[dateLookupKey] !== undefined) {
              // this date is an exception date, which means we should skip it in the recurrence pattern.
              const exdate = event.skipTZ ? moment({ date: newEvent.exdate[dateLookupKey] }) : moment({ timezone, date: newEvent.exdate[dateLookupKey] })
              if (exdate.isSame(start, 'day')) {
                app.log(`Skipping '${newEvent.uid}' @ `, date, '(', newEvent.exdate[dateLookupKey], ')', 'because it exists in exdate by date lookup key')
                addEvent = false
              }
            }
            if (newEvent.exdate[previousDayLookupKey] !== undefined && newEvent.datetype === 'date') {
              // this date is an exception date; because of timezones it appears as previousDay even though it is equal to date; which means we should skip it in the recurrence pattern.
              const exdate = event.skipTZ ? moment({ date: newEvent.exdate[previousDayLookupKey] }) : moment({ timezone, date: newEvent.exdate[previousDayLookupKey] })
              if (exdate.isSame(start, 'day')) {
                app.log(`Skipping '${newEvent.uid}' @ `, date, '(', newEvent.exdate[previousDayLookupKey], ')', 'because it exists in exdate by previousDay lookup key')
                addEvent = false
              }
            }
          }

          if (addEvent) {
            if (!logged && event.datetype === 'date') {
              app.log('Recurring:', event.summary, '--', start, '--', end, '--', event.start.toUTCString())
              logged = true
            }
            newEvent.start = start
            newEvent.end = end
            newEvent.uid = `${newEvent.uid}_${start.toDate().toISOString().slice(0, 10)}`

            events.push(newEvent)
          }
        })
      } catch (error) {
        app.log(`Recurring event '${event.uid}' is invalid : `, error)

        triggerSynchronizationError({ app, calendar: calendarName, error, event })

        // send exception to sentry
        app.sentry.captureException(error)
      }
    } else {
      try {
        // regular event
        const start = event.skipTZ || event.start.toUTCString().includes('00:00:00') ? moment({ date: event.start }) : moment({ timezone, date: event.start })
        const end = event.skipTZ || event.start.toUTCString().includes('00:00:00') ? getRegularEventEnd({ event }) : getRegularEventEnd({ timezone, event })

        // only add event if
        //    end hasn't happend yet AND start is between eventLimitStart and eventLimitEnd
        // ||
        //    start has happend AND end hasn't happend yet (ongoing)
        if ((now.diff(end, 'seconds') < 0 && start.isBetween(eventLimitStart, eventLimitEnd) === true) || (now.diff(start, 'seconds') > 0 && now.diff(end, 'seconds') < 0)) {
          if (event.datetype === 'date') {
            app.log('Regular:', event.summary, '--', start, '--', end, '--', event.start.toUTCString())
          }

          events.push({ ...event, start, end })
        }
      } catch (error) {
        app.log(`Regular event '${event.uid}' is invalid : `, error)

        triggerSynchronizationError({ app, calendar: calendarName, error, event })

        // send exception to sentry
        app.sentry.captureException(error)
      }
    }
  }

  // keep only properties used
  return events.map(event => {
    const created = event.created ? moment({ timezone, date: event.created }) : undefined
    return {
      start: event.start,
      datetype: event.datetype,
      end: event.end,
      uid: event.uid,
      description: event.description,
      location: event.location,
      summary: event.summary,
      created,
      fullDayEvent: event.datetype === 'date',
      skipTZ: event.skipTZ === true
    }
  })
}
