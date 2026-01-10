/*import type { App } from "homey";
import deepClone from "lodash.clonedeep";
import moment, { type Moment } from "moment";
import type { DateWithTimeZone, VEvent } from "node-ical";

import { triggerSynchronizationError } from "../handlers/trigger-cards.js";*/

import type { CalendarEvent } from "../types/IcalCalendar.type";
import type { GetActiveEventsOptions } from "../types/Options.type";

/*import { findRegularEventEnd } from "./find-regular-event-end.js";
import { fromEvent } from "./generate-event-object.js";
import { hasData } from "./has-data.js";
import { getMoment } from "./moment-datetime.js";

type ValueObject = {
  val: string;
};

const invalidTZs: string[] = ["Customized Time Zone", "undefined"];

const getFormattedMoment = (value: Moment): string => value.format("DD.MM.yyyy HH:mm:ss");

const getDuration = (start: DateWithTimeZone, end: DateWithTimeZone): number => end.getTime() - start.getTime();

const getEnd = (start: Moment | Date, duration: number, timezone?: string): Moment => {
  const date: string = new Date(
    Number.parseInt(getMoment({ date: start.toISOString() }).format("x"), 10) + duration
  ).toISOString();

  return getMoment({ timezone, date, format: "x" });
};

const getPaddedDateString = (date: Moment): string => {
  const dateParts: string[] = [
    date.get("years").toString(),
    date.get("months") + 1 > 9 ? (date.get("months") + 1).toString() : `0${date.get("months") + 1}`,
    date.get("dates") > 9 ? date.get("dates").toString() : `0${date.get("dates")}`
  ];

  const timeParts: string[] = [
    date.get("hours") > 9 ? date.get("hours").toString() : `0${date.get("hours")}`,
    date.get("minutes") > 9 ? date.get("minutes").toString() : `0${date.get("minutes")}`,
    date.get("seconds") > 9 ? date.get("seconds").toString() : `0${date.get("seconds")}`
  ];

  return `${dateParts.join("-")}T${timeParts.join(":")}.000Z`;
};

const convertToText = (app: App, prop: string, value: string | ValueObject, uid: string): string => {
  if (typeof value === "string") {
    return value;
  }

  app.log(`getActiveEvents/convertToText - '${prop}' was a ValueObject. Using 'val' of object '${uid}'`);
  return value.val;
};

const isInvalidTZ = (tz?: string): boolean => {
  if (!tz) {
    return false;
  }

  return invalidTZs.map((i: string) => tz.includes(i)).includes(true);
};

const removeInvalidTZ = (app: App, event: VEvent, calendarName: string): void => {
  // remove 'Customized Time Zone*'
  try {
    if (isInvalidTZ(event.start.tz)) {
      app.log(`[WARN] getActiveEvents: Invalid timezone (${event.start.tz}) found on`, event.summary, '--', event.uid);
      delete event.start.tz
      delete event.end.tz
      event.skipTZ = true
    }
    if (event.start.tz === 'Africa/Abidjan' && event.dtstamp.tz === 'Etc/UTC') {
      app.log(`[WARN] getActiveEvents: Invalid timezone (${event.start.tz}) (this was probably Customized Time Zone) found on`, event.summary, '--', event.uid)
      delete event.start.tz
      delete event.end.tz
      event.skipTZ = true
    }
    if (event.exdate) {
      for (const exdate of Object.keys(event.exdate)) {
        if (isInvalidTZ(event.exdate[exdate].tz)) {
          app.log(`[WARN] getActiveEvents: Invalid timezone (${event.exdate[exdate].tz}) found on`, event.summary, `in exdate '${exdate}' --`, event.uid)
          delete event.exdate[exdate].tz
        }
      }
    }
    if (event.rrule) {
      if (event.rrule.origOptions && isInvalidTZ(event.rrule.origOptions.tzid)) {
        app.log(`[WARN] getActiveEvents: Invalid timezone (${event.rrule.origOptions.tzid}) found on`, event.summary, 'on rrule.origOptions --', event.uid)
        delete event.rrule.origOptions.tzid
      }
      if (event.rrule.options && isInvalidTZ(event.rrule.options.tzid)) {
        app.log(`[WARN] getActiveEvents: Invalid timezone (${event.rrule.options.tzid}) found on`, event.summary, 'on rrule.options --', event.uid)
        delete event.rrule.options.tzid
      }
      if (event.rrule.origOptions.tzid === undefined && event.rrule.options.tzid === undefined) {
        event.skipTZ = true
      }
    } else if (event.start.tz === undefined) {
      event.skipTZ = true
    }
  } catch (error) {
    app.error('[ERROR] getActiveEvents: Failed to remove invalid time zone:', error)

    triggerSynchronizationError({ app, calendar: calendarName, error, event })
      .catch(err => app.error('[ERROR] getActiveEvents/removeInvalidTZ: Failed to complete triggerSynchronizationError(...):', err))
  }
};*/

export const getActiveEvents = (_options: GetActiveEventsOptions): CalendarEvent[] => {
  return [];

  /*const { timezone, data, eventLimit, calendarName, app, logAllEvents } = options
  const now = getMoment({ timezone })
  const eventLimitStart = getMoment({ timezone }).startOf('day')
  const eventLimitEnd = getMoment({ timezone }).endOf('day').add(Number.parseInt(eventLimit.value, 10), eventLimit.type)
  const events = []

  for (const event of Object.values(data)) {
    if (event.type !== 'VEVENT') {
      continue
    }

    // set properties to be text value IF it's an object: https://github.com/jens-maus/node-ical/blob/cbb76af87ff6405f394acf993889742885cce0a0/ical.js#L78
    event.summary = convertToText(app, 'summary', event.summary, event.uid)
    event.location = convertToText(app, 'location', event.location, event.uid)
    event.description = convertToText(app, 'description', event.description, event.uid)
    event.uid = convertToText(app, 'uid', event.uid, event.uid)

    // stop if required properties are missing
    if (!hasData(event.start) || !hasData(event.end)) {
      triggerSynchronizationError({ app, calendar: calendarName, error: '"DTSTART" and/or "DTEND" is missing', event })
        .catch(err => app.error('[ERROR] getActiveEvents: Failed to complete triggerSynchronizationError(...):', err))
      throw new Error(`"DTSTART" and/or "DTEND" is missing in event with UID: ${event.uid}`)
    }

    // remove invalid timezones from event
    removeInvalidTZ(app, event, calendarName)

    if (typeof event.rrule === 'undefined') {
      // regular event
      try {
        const start = event.skipTZ || event.start.toUTCString().includes('00:00:00') ? getMoment({ date: event.start }) : getMoment({ timezone, date: event.start })
        const end = event.skipTZ || event.start.toUTCString().includes('00:00:00') ? findRegularEventEnd({ event }) : findRegularEventEnd({ timezone, event })

        // only add event if
        //    end hasn't happened yet AND start is between eventLimitStart and eventLimitEnd
        // ||
        //    start has happened AND end hasn't happened yet (ongoing)
        if ((now.diff(end, 'seconds') < 0 && start.isBetween(eventLimitStart, eventLimitEnd) === true) || (now.diff(start, 'seconds') > 0 && now.diff(end, 'seconds') < 0)) {
          if (logAllEvents) {
            if (event.datetype === 'date') {
              // Regular full day event: Summary -- Start -- End -- Original Start UTC string -- UID
              app.log('Regular full day event:', event.summary, '--', getFormattedMoment(start), '--', getFormattedMoment(end), '--', event.start.toUTCString(), '--', event.uid)
            } else {
              // Regular event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
              app.log('Regular event:', event.summary, '--', getFormattedMoment(start), '--', getFormattedMoment(end), '--', event.start.toUTCString(), `-- TZ:${event.skipTZ ? 'missing/invalid' : timezone}`, '--', event.uid)
            }
          }

          events.push({ ...event, start, end })
        }
      } catch (error) {
        app.error(`[ERROR] Regular event '${event.summary}' (${event.uid}) is invalid : `, error)

        triggerSynchronizationError({ app, calendar: calendarName, error, event })
          .catch(err => app.error('[ERROR] getActiveEvents/regularEvent: Failed to complete triggerSynchronizationError(...):', err))
      }

      continue
    }

    // recurring event
    try {
      // getting the set of start dates between eventLimitStart and eventLimitEnd
      //      Include dates which falls on until date: true||false
      let dates = event.rrule.between(eventLimitStart.toDate(), eventLimitEnd.toDate(), true)

      // getting the set of dates between rrule start and rrule until (if until is null, use eventLimitEnd.toDate())
      //      Include dates which falls on until date: true||false
      const rruleStart = (event.rrule.options && event.rrule.options.dtstart && getMoment({ timezone: event.rrule.options.tzid || timezone, date: event.rrule.options.dtstart }).startOf('day').toDate()) || eventLimitStart.toDate()
      const rruleEnd = (event.rrule.options && event.rrule.options.until && getMoment({ timezone: event.rrule.options.tzid || timezone, date: event.rrule.options.until }).endOf('day').toDate()) || eventLimitEnd.toDate()
      // first get all dates between start and end. then filter only those where date isn't after eventLimitEnd and isn't already present in dates
      const ongoingDates = event.rrule.between(rruleStart, rruleEnd, true).filter((date) => !getMoment({ date }).isAfter(eventLimitEnd.toDate()) && !dates.map((d) => d.getTime() === date.getTime()).includes(true))
      ongoingDates.forEach((date) => dates.push(date))

      // the "dates" array contains the set of dates within our desired date range that are valid
      // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
      // had its date changed from outside the range to inside the range.  One way to handle this is
      // to add *all* recurrence override entries into the set of dates that we check, and then later
      // filter out any recurrences that don't actually belong within our range.
      const recurrencesMoved = []
      if (event.recurrences !== undefined) {
        for (const recurrenceDate of Object.keys(event.recurrences)) {
          const recurrence = event.recurrences[recurrenceDate]

          // remove the original date since this date has been moved
          const rMomentRecurrence = recurrence.recurrenceid.toUTCString().includes('00:00:00') ? getMoment({ date: recurrence.recurrenceid }) : getMoment({ date: recurrence.recurrenceid, timezone })
          const rDateRecurrence = new Date(getPaddedDateString(rMomentRecurrence))
          const newDates = []
          let movedRecurrencesAdded = 0
          dates.forEach((date) => {
            const date2 = rDateRecurrence
            date2.setHours(date.getHours())
            date2.setMinutes(date.getMinutes())
            date2.setSeconds(date.getSeconds())
            date2.setMilliseconds(date.getMilliseconds())
            if (date.toISOString() !== date2.toISOString()) {
              newDates.push(date)
            } else {
              // keep track of the original date that has been moved so we can find it back further down
              recurrencesMoved.push({
                original: date
              })
              movedRecurrencesAdded++
            }
          })
          dates = newDates

          // add the new date
          // also only add dates that weren't already in the range we added from the rrule so that we don't double-add those events.
          const rMomentStart = recurrence.start.toUTCString().includes('00:00:00') ? getMoment({ date: recurrence.start }) : getMoment({ date: recurrence.start, timezone })
          const rDateStart = new Date(recurrence.start)

          if (rMomentStart.isBetween(eventLimitStart, eventLimitEnd) === true) {
            const existAlready = dates.filter((date) => date === rDateStart)
            if (existAlready.length === 0) {
              dates.push(rDateStart)
              if (movedRecurrencesAdded >= 1) {
                recurrencesMoved[recurrencesMoved.length - 1].moved = rDateStart
                if (movedRecurrencesAdded > 1) {
                  app.log(`${movedRecurrencesAdded} recurrences with same key found in '${event.uid}'. Using the last one...`)
                }
              }
              app.log(`Recurrence in '${event.summary}' (${event.uid}) was moved from '${rMomentRecurrence}' to ${rMomentStart}`)
            }
          } else {
            const rMomentEnd = recurrence.end.toUTCString().includes('00:00:00') ? getMoment({ date: recurrence.end }) : getMoment({ date: recurrence.end, timezone })
            if (rMomentStart.isBefore(eventLimitStart) && rMomentEnd.isAfter(eventLimitStart)) {
              const existAlready = dates.filter((date) => date === rDateStart)
              if (existAlready.length === 0) {
                dates.push(rDateStart)
                if (movedRecurrencesAdded >= 1) {
                  recurrencesMoved[recurrencesMoved.length - 1].moved = rDateStart
                  if (movedRecurrencesAdded > 1) {
                    app.log(`${movedRecurrencesAdded} recurrences with same key found in '${event.uid}'. Using the last one...`)
                  }
                }
                app.log(`Recurrence in '${event.summary}' (${event.uid}) was moved from '${rMomentRecurrence}' to ${rMomentStart} AND is ongoing from '${rMomentStart}' to '${rMomentEnd}'`)
              }
            }
          }
        }
      }

      // convert all recurring dates from UTC to local moment instances
      const localDates = dates.map((date) => {
        if (event.skipTZ) {
          return getMoment({ date: date.toISOString() })
        }
        return getMoment({ timezone, date: date.toISOString() })
      })

      for (const date of localDates) {
        /!** @type {import('node-ical').VEvent} *!/
        let newEvent = deepClone(event)
        if (event.exdate) {
          // "exdate" is an invalid array. And since "deepClone" only clones valid values, "exdate" becomes an empty array.
          // To make up for this we have to add the original "exdate" property to the cloned event object
          newEvent.exdate = event.exdate
        }
        let duration = getDuration(event.start, event.end)
        const offsetThis = getMoment({ timezone, date: event.start }).utcOffset()
        let start = event.skipTZ ? date : date.add(offsetThis, 'minutes')
        let end = event.skipTZ ? getEnd(start, duration) : getEnd(start, duration, timezone)

        if (event.start.toUTCString().includes('00:00:00')) {
          start = getMoment({ date: date.toDate() })
          end = getEnd(date.toDate(), duration)
        }

        // use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
        const movedRecurrence = recurrencesMoved.find((rm) => (rm.moved - date.toDate()) === 0)
        const dateLookupKey = (movedRecurrence !== undefined ? moment(movedRecurrence.original) : moment(start)).add(offsetThis, 'minutes').toISOString().slice(0, 10)
        // exdate entries are stored in UTC with GMT timezone. dates found with rrule.between are also stored in UTC BUT has no timezone information.
        // These dates can then be different even though they actually are the same.
        let previousDay
        if (event.skipTZ) {
          previousDay = (movedRecurrence !== undefined ? moment(movedRecurrence.original) : moment(start)).subtract(1, 'day')
        } else {
          previousDay = (movedRecurrence !== undefined ? moment(movedRecurrence.original) : moment(start)).add(offsetThis, 'minutes').subtract(1, 'day')
        }
        const previousDayLookupKey = previousDay.toISOString().slice(0, 10)

        // for each date that we're checking, it's possible that there is a recurrence override for that one day.
        if (newEvent.recurrences !== undefined && newEvent.recurrences[dateLookupKey] !== undefined) {
          // we found an override, so for this recurrence, use a potentially different title, start date, and duration.
          const recurrenceDate = event.skipTZ ? getMoment({ date: newEvent.recurrences[dateLookupKey].start }) : getMoment({ timezone, date: newEvent.recurrences[dateLookupKey].start })
          if (recurrenceDate.isSame(start, 'day')) {
            newEvent = deepClone(newEvent.recurrences[dateLookupKey])
            start = event.skipTZ ? getMoment({ date: newEvent.start }) : getMoment({ timezone, date: newEvent.start })
            duration = getDuration(newEvent.start, newEvent.end)
            end = event.skipTZ ? getEnd(start, duration) : getEnd(start, duration, timezone)
          }
        }

        // for each date that we're checking, it's possible that there is a recurrence override for that one day, and the UTC start time might even move back one day if different timezones
        if (newEvent.recurrences !== undefined && newEvent.recurrences[previousDayLookupKey] !== undefined) {
          // we found an override; because of timezones it appears as previousDay even though it is equal to date; so for this recurrence, use a potentially different title, start date, and duration.
          const recurrenceDate = event.skipTZ ? getMoment({ date: newEvent.recurrences[previousDayLookupKey].start }) : getMoment({ timezone, date: newEvent.recurrences[previousDayLookupKey].start })
          if (recurrenceDate.isSame(start, 'day')) {
            newEvent = deepClone(newEvent.recurrences[previousDayLookupKey])
            start = event.skipTZ ? getMoment({ date: newEvent.start }) : getMoment({ timezone, date: newEvent.start })
            duration = getDuration(newEvent.start, newEvent.end)
            end = event.skipTZ ? getEnd(start, duration) : getEnd(start, duration, timezone)
          }
        }

        // make sure the end time hasn't already past and that start time isn't either long into the future
        if (end.isBefore(now) || start.isAfter(eventLimitEnd)) {
          continue
        }

        if (newEvent.exdate !== undefined) {
          // if there's no recurrence override, check for an exception date. Exception dates represent exceptions to the rule.
          if (newEvent.exdate[dateLookupKey] !== undefined) {
            // this date is an exception date, which means we should skip it in the recurrence pattern.
            const exdate = event.skipTZ ? getMoment({ date: newEvent.exdate[dateLookupKey] }) : getMoment({ timezone, date: newEvent.exdate[dateLookupKey] })
            if (exdate.isSame(start, 'day')) {
              app.log(`Skipping '${newEvent.summary}' (${newEvent.uid}) @ `, date, '(', newEvent.exdate[dateLookupKey], ')', 'because it exists in exdate by date lookup key')
              continue
            }
          }

          if (newEvent.exdate[previousDayLookupKey] !== undefined && newEvent.datetype === 'date') {
            // this date is an exception date; because of timezones it appears as previousDay even though it is equal to date; which means we should skip it in the recurrence pattern.
            const exdate = event.skipTZ ? getMoment({ date: newEvent.exdate[previousDayLookupKey] }) : getMoment({ timezone, date: newEvent.exdate[previousDayLookupKey] })
            if (exdate.isSame(start, 'day')) {
              app.log(`Skipping '${newEvent.summary}' (${newEvent.uid}) @ `, date, '(', newEvent.exdate[previousDayLookupKey], ')', 'because it exists in exdate by previousDay lookup key')
              continue
            }
          }
        }

        // add event
        events.push({
          ...newEvent,
          uid: `${newEvent.uid}_${start.toDate().toISOString().slice(0, 10)}`,
          start,
          end
        })

        if (logAllEvents) {
          if (event.datetype === 'date') {
            // Recurring full day event: Summary -- Start -- End -- Original Start UTC string -- UID
            app.log('Recurring full day event:', event.summary, '--', getFormattedMoment(start), '--', getFormattedMoment(end), '--', event.start.toUTCString(), '--', newEvent.uid)
          } else {
            // Recurring event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
            app.log('Recurring event:', event.summary, '--', getFormattedMoment(start), '--', getFormattedMoment(end), '--', event.start.toUTCString(), `-- TZ:${event.skipTZ ? 'missing/invalid' : timezone}`, '--', newEvent.uid)
          }
        }
      }
    } catch (error) {
      app.error(`[ERROR] Recurring event '${event.summary}' (${event.uid}) is invalid : `, error)

      triggerSynchronizationError({ app, calendar: calendarName, error, event })
        .catch(err => app.error('[ERROR] getActiveEvents/recurringEvent: Failed to complete triggerSynchronizationError(...):', err))
    }
  }

  // keep only properties used
  return events.map((event) => fromEvent(app, timezone, event))*/
};
