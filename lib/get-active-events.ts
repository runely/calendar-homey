import type { App } from "homey";
import deepClone from "lodash.clonedeep";
import { DateTime, type DateTimeMaybeValid, Duration } from "luxon";
import type { CalendarComponent, VEvent } from "node-ical";

import { triggerSynchronizationError } from "../handlers/trigger-cards";

import type { AppTests } from "../types/Homey.type";
import type { CalendarEvent, IcalOccurence } from "../types/IcalCalendar.type";
import type { GetActiveEventsOptions } from "../types/Options.type";

import { createDateWithTimeZone, fromEvent } from "./generate-event-object";
import { hasData } from "./has-data";
import { getDateTime, getZonedDateTime } from "./luxon-fns";

const untilRegexp = /UNTIL=(\d{8}T\d{6})/;

const convertToText = (
  app: App | AppTests,
  prop: string,
  value: { params: unknown; val: string } | string,
  uid: string
): string => {
  if (typeof value === "object") {
    app.log(`[WARN] - getActiveEvents/convertToText - '${prop}' was object. Using 'val' of object '${uid}'`);
    return value.val;
  }

  return value;
};

const filterOutUnwantedEvents = (
  app: App | AppTests,
  logAllEvents: boolean,
  events: CalendarComponent[],
  eventLimitStart: DateTime<true>,
  eventLimitEnd: DateTime<true>
): VEvent[] => {
  const eventLimitStartMillis: number = eventLimitStart.toUTC().toJSDate().getTime();
  const eventLimitEndMillis: number = eventLimitEnd.toUTC().toJSDate().getTime();

  // statistics only
  let nonVEvents: number = 0;
  let regularInvalidVEvents: number = 0;
  let regularVEventsPast: number = 0;
  let regularVEventsInside: number = 0;
  let recurringVEventsWithoutUntil: number = 0;
  let recurringVEventsWithPastUntil: number = 0;
  let recurringVEventsWithFutureUntil: number = 0;

  const filteredEvents: VEvent[] = events.filter((event: CalendarComponent) => {
    // Needed to let TypeScript know that event is of type VEvent
    if (event.type !== "VEVENT") {
      nonVEvents++;
      return false;
    }

    if (!event.rrule) {
      if (!hasData(event.start) || !hasData(event.end)) {
        app.error(
          `[ERROR] - getActiveEvents/filterOutUnwantedEvents: Missing DTSTART (${event.start} (${event.start?.tz || "undefined TZ"})) and/or DTEND (${event.end} (${event.end?.tz || "undefined TZ"})) on non-recurring event UID '${event.uid}'. Skipping event.`
        );
        regularInvalidVEvents++;
        return false;
      }

      const startMillis: number = event.start.getTime();
      const endMillis: number = event.end.getTime();
      const isRegularEventInside: boolean =
        (startMillis >= eventLimitStartMillis && endMillis <= eventLimitEndMillis) || // event fully inside range
        (startMillis <= eventLimitStartMillis && endMillis >= eventLimitEndMillis) || // event fully outside range (ongoing)
        (startMillis <= eventLimitStartMillis && endMillis > eventLimitStartMillis) || // event starting before range, ending after start limit (ongoing)
        (startMillis >= eventLimitStartMillis && startMillis < eventLimitEndMillis && endMillis >= eventLimitEndMillis); // event starting inside range, ending after range (ongoing)

      if (isRegularEventInside) {
        regularVEventsInside++;
        return isRegularEventInside;
      }

      regularVEventsPast++;
      return isRegularEventInside;
    }

    const untilMatch: RegExpExecArray | null = untilRegexp.exec(event.rrule.toString());
    if (!untilMatch || untilMatch.length < 2) {
      recurringVEventsWithoutUntil++;
      return true;
    }

    const untilString: string | undefined = untilMatch[1];
    if (!untilString) {
      app.log(
        `[WARN] - getActiveEvents/filterOutUnwantedEvents: UNTIL string extraction failed for event UID '${event.uid}'. Skipping event.`
      );
      recurringVEventsWithoutUntil++;
      return false;
    }

    const untilDateTime: DateTimeMaybeValid = DateTime.fromFormat(untilString, "yyyyMMdd'T'HHmmss", { zone: "utc" });
    if (!untilDateTime.isValid) {
      app.log(
        `[WARN] - getActiveEvents/filterOutUnwantedEvents: UNTIL date parsing failed for event UID '${event.uid}'. Skipping event. Reason: ${untilDateTime.invalidReason}`
      );
      recurringVEventsWithoutUntil++;
      return false;
    }

    // keep only events where untilDateTime is after now
    const untilMillis: number = (untilDateTime as DateTime<true>).toMillis();
    const isRecurringUntilFuture: boolean =
      (untilMillis > eventLimitStartMillis && untilMillis >= eventLimitEndMillis) ||
      (untilMillis > eventLimitStartMillis && untilMillis <= eventLimitEndMillis);

    if (isRecurringUntilFuture) {
      recurringVEventsWithFutureUntil++;
      return isRecurringUntilFuture;
    }

    recurringVEventsWithPastUntil++;
    return isRecurringUntilFuture;
  }) as VEvent[];

  if (logAllEvents) {
    app.log(
      `getActiveEvents/filterOutUnwantedEvents: Filtered out events numbers -- nonVEvents: ${nonVEvents} -- regularInvalidVEvents: ${regularInvalidVEvents} -- regularVEventsPast: ${regularVEventsPast} -- recurringVEventsWithPastUntil: ${recurringVEventsWithPastUntil} -- recurringVEventsWithoutUntil: ${recurringVEventsWithoutUntil} -- regularVEventsInside: ${regularVEventsInside} -- recurringVEventsWithFutureUntil: ${recurringVEventsWithFutureUntil}. Totally filtered from ${events.length} to ${filteredEvents.length} events.`
    );
  }

  return filteredEvents;
};

const getRecurrenceDates = (
  app: App | AppTests,
  event: VEvent,
  eventLimitStart: DateTime<true>,
  eventLimitEnd: DateTime<true>,
  localTimeZone: string,
  showLuxonDebugInfo: boolean
): IcalOccurence[] => {
  const instances = new Map<string, IcalOccurence>();

  if (event.rrule) {
    const occurrences: Date[] = event.rrule.between(eventLimitStart.toJSDate(), eventLimitEnd.toJSDate(), true);
    for (const date of occurrences) {
      const occurence: DateTime<true> | null = getDateTime({
        app,
        dateWithTimeZone: createDateWithTimeZone(date, event.rrule?.options.tzid || event.start.tz || undefined),
        localTimeZone: localTimeZone,
        fullDayEvent: event.datetype === "date",
        keepOriginalZonedTime: true,
        quiet: !showLuxonDebugInfo
      });
      if (!occurence) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Invalid occurrence date for event UID '${event.uid}'. Skipping this occurrence.`
        );
        continue;
      }

      const occurenceUtc: DateTime<true> = occurence.toUTC();
      const occurenceStamp: string | null = occurenceUtc.toISO();
      const lookupKey: string | null = occurenceUtc.toISODate();
      if (!occurenceStamp || !lookupKey) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Invalid occurrenceStamp or lookupKey for event UID '${event.uid}'. Skipping this occurrence.`
        );
        continue;
      }

      if (event.recurrences?.[lookupKey]) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Recurrence override found for event UID '${event.uid}' on date '${lookupKey}'. Skipping occurrence.`
        );
        continue;
      }

      if (instances.has(occurenceStamp)) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Duplicate occurrence found for event UID '${event.uid}' on date '${lookupKey}'. Skipping duplicate.`
        );
        continue;
      }

      instances.set(occurenceStamp, {
        occurenceStart: occurence,
        lookupKey
      });
    }
  }

  if (event.recurrences) {
    for (const recurrence of Object.values(event.recurrences)) {
      const recurStart: DateTime<true> | null =
        recurrence?.start instanceof Date
          ? getDateTime({
              app,
              dateWithTimeZone: createDateWithTimeZone(recurrence.start, recurrence.start.tz || undefined),
              localTimeZone: localTimeZone,
              fullDayEvent: event.datetype === "date",
              keepOriginalZonedTime: true,
              quiet: !showLuxonDebugInfo
            })
          : null;

      const recurId: DateTimeMaybeValid | null =
        recurrence?.recurrenceid instanceof Date ? DateTime.fromJSDate(recurrence.recurrenceid) : null;

      if (!recurStart || !recurId || !recurId.isValid) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Invalid recurrence or recurrenceId found for event UID '${event.uid}'. Skipping this recurrence.`
        );
        continue;
      }

      if (!(recurStart.toMillis() >= eventLimitStart.toMillis() && recurStart.toMillis() <= eventLimitEnd.toMillis())) {
        continue;
      }

      const recurUtc: DateTime<true> = recurStart.toUTC();
      const recurUtcIso: string | null = recurUtc.toISODate();
      if (!recurUtcIso) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Invalid recurUtcIso for event UID '${event.uid}'. Skipping this recurrence.`
        );
        continue;
      }

      const recurStamp: string | null = recurUtc.toISO();
      if (!recurStamp) {
        app.log(
          `[WARN] - getActiveEvents/getRecurrenceDates: Invalid recurStamp for event UID '${event.uid}'. Skipping this recurrence.`
        );
        continue;
      }

      instances.set(recurStamp, {
        occurenceStart: recurStart,
        lookupKey: recurUtcIso
      });
    }
  }

  return Array.from(instances.values()).sort(
    (a: IcalOccurence, b: IcalOccurence) => a.occurenceStart.toMillis() - b.occurenceStart.toMillis()
  );
};

const shouldKeepOriginalZonedTime = (
  event: VEvent,
  eventTimezone: string | undefined,
  localTimezone: string
): boolean => {
  if ("APPLE-CREATOR-IDENTITY" in event) {
    // NOTE: Apple Calendar needs special handling here because they store the timeZoned time as local time
    return true;
  }

  /* NOTE: Exchange Calendar uses Windows timezones and node-ical replaces them with IANA timezones.
           Exchange Calendar stores the timeZoned time as local time, same as with Apple Calendar.
           Interesting to see if this breaks any timezone conversion out there.
  */
  return eventTimezone !== localTimezone;
};

export const getActiveEvents = async (options: GetActiveEventsOptions): Promise<CalendarEvent[]> => {
  const { app, variableMgmt, calendarName, data, eventLimit, logAllEvents, timezone } = options;
  const eventLimitStart: DateTime<true> = getZonedDateTime(DateTime.now(), timezone).startOf("day");

  const eventLimitDuration: Duration = Duration.fromObject({ [eventLimit.type]: eventLimit.value });
  const eventLimitEnd: DateTime<true> = DateTime.now().endOf("day").plus(eventLimitDuration);
  const events: CalendarEvent[] = [];
  let recurrenceEventCount: number = 0;
  let regularEventCount: number = 0;

  const actualEvents: VEvent[] = filterOutUnwantedEvents(
    app,
    logAllEvents,
    Object.values(data),
    eventLimitStart,
    eventLimitEnd
  );

  for (const event of actualEvents) {
    if (event.recurrenceid) {
      // TODO: Fix handling of recurrenceid events
      app.log(`[WARN] - getActiveEvents - We don't care about recurrenceId for now (${event.uid})`);
      continue;
    }

    // set properties to be text value IF it's an object
    event.summary = convertToText(app, "summary", event.summary, event.uid);
    event.location = convertToText(app, "location", event.location, event.uid);
    event.description = convertToText(app, "description", event.description, event.uid);
    event.uid = convertToText(app, "uid", event.uid, event.uid);

    const startDate: DateTime<true> | null = getDateTime({
      app,
      dateWithTimeZone: event.start,
      localTimeZone: timezone,
      fullDayEvent: event.datetype === "date",
      keepOriginalZonedTime: shouldKeepOriginalZonedTime(event, event.start.tz, timezone),
      quiet: !logAllEvents
    });
    const endDate: DateTime<true> | null = getDateTime({
      app,
      dateWithTimeZone: event.end,
      localTimeZone: timezone,
      fullDayEvent: event.datetype === "date",
      keepOriginalZonedTime: shouldKeepOriginalZonedTime(event, event.end.tz, timezone),
      quiet: !logAllEvents
    });

    if (!startDate || !endDate) {
      app.error(
        `[ERROR] getActiveEvents - DTSTART (${startDate}) and/or DTEND (${endDate}) is invalid on '${event.summary}' (${event.uid})`
      );

      await triggerSynchronizationError({
        app,
        variableMgmt,
        calendar: calendarName,
        error: `DTSTART and/or DTEND is invalid on '${event.summary}'`,
        event
      });

      continue;
    }

    if (event.rrule) {
      // Recurring event
      const recurrenceDates: IcalOccurence[] = getRecurrenceDates(
        app,
        event,
        eventLimitStart,
        eventLimitEnd,
        timezone,
        logAllEvents
      );

      if (recurrenceDates.length === 0) {
        app.log(
          `[WARN] - getActiveEvents - No recurrence dates in time range found for event UID '${event.uid}'. Skipping this recurring event.`
        );

        continue;
      }

      for (const { occurenceStart, lookupKey } of recurrenceDates) {
        if (event.exdate?.[lookupKey]) {
          app.log(
            `[WARN] - getActiveEvents - ExDate found for event UID '${event.uid}' on date '${lookupKey}'. Skipping this recurrence.`
          );
          continue;
        }

        let currentEvent: VEvent = deepClone(event);
        let currentDuration: Duration<true> = endDate.diff(startDate);
        let currentStartDate: DateTime<true> | null = occurenceStart;

        if (currentEvent.recurrences?.[lookupKey]) {
          // we found an override, so for this recurrence, use a potentially different start/end
          currentEvent = currentEvent.recurrences[lookupKey] as VEvent;
          app.log(
            `[WARN] - getActiveEvents - Found recurrence override for event UID '${event.uid}' on date '${lookupKey}'. Using overridden start/end.`
          );

          currentStartDate = getDateTime({
            app,
            dateWithTimeZone: createDateWithTimeZone(currentEvent.start, currentEvent.start.tz || undefined),
            localTimeZone: timezone,
            fullDayEvent: event.datetype === "date",
            keepOriginalZonedTime: shouldKeepOriginalZonedTime(event, event.start.tz, timezone),
            quiet: !logAllEvents
          });

          const overrideEndDate: DateTime<true> | null = getDateTime({
            app,
            dateWithTimeZone: createDateWithTimeZone(currentEvent.end, currentEvent.end.tz || undefined),
            localTimeZone: timezone,
            fullDayEvent: event.datetype === "date",
            keepOriginalZonedTime: shouldKeepOriginalZonedTime(event, event.end.tz, timezone),
            quiet: !logAllEvents
          });

          if (!currentStartDate || !overrideEndDate) {
            app.error(
              `[ERROR] getActiveEvents - DTSTART and/or DTEND is invalid on RECURRENCE OVERRIDE for '${currentEvent.summary}' (${currentEvent.uid}) with lookupKey '${lookupKey}'`
            );

            await triggerSynchronizationError({
              app,
              variableMgmt,
              calendar: calendarName,
              error: `DTSTART and/or DTEND is invalid on RECURRENCE OVERRIDE for '${currentEvent.summary}'`,
              event: currentEvent
            });

            continue;
          }

          currentDuration = overrideEndDate.diff(currentStartDate);
        }

        const currentEndDate: DateTime<true> = currentStartDate.plus(currentDuration);

        if (
          currentEndDate.toMillis() < eventLimitStart.toMillis() ||
          currentStartDate.toMillis() > eventLimitEnd.toMillis()
        ) {
          app.log(
            `getActiveEvents - Recurrence occurence is not inside event limit on event UID '${event.uid}' on date '${lookupKey}'. Start: '${currentStartDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${currentStartDate.toISO()} (${currentStartDate.zoneName})). End: '${currentEndDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${currentEndDate.toISO()} (${currentEndDate.zoneName})). Skipping this recurrence.`
          );
          continue;
        }

        recurrenceEventCount++;

        // NOTE: IF toISODate fails, fallback month will be a single digit IF month is < 10
        const startDateIso: string =
          currentStartDate.toISODate() || `${currentStartDate.year}-${currentStartDate.month}-${currentStartDate.day}`;
        currentEvent.uid = `${currentEvent.uid}_${startDateIso}`;

        if (logAllEvents) {
          app.log(
            `getActiveEvents - Recurrence Summary: '${currentEvent.summary}' -- Start: '${currentStartDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${currentStartDate.toISO()} (${currentStartDate.zoneName})) -- End: '${currentEndDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${currentEndDate.toISO()} (${currentEndDate.zoneName})) -- UID: '${currentEvent.uid}' -- DateType: '${event.datetype === "date" ? "FULL DAY" : "PARTIAL DAY"}'`
          );
        }
        events.push(fromEvent(app, currentStartDate, currentEndDate, timezone, currentEvent));
      }

      continue;
    }

    regularEventCount++;

    if (logAllEvents) {
      app.log(
        `getActiveEvents - Summary: '${event.summary}' -- Start: '${startDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${startDate.toISO()} (${startDate.zoneName})) -- End: '${endDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${endDate.toISO()} (${endDate.zoneName})) -- UID: '${event.uid}' -- DateType: '${event.datetype === "date" ? "FULL DAY" : "PARTIAL DAY"}'`
      );
    }

    events.push(fromEvent(app, startDate, endDate, timezone, event));
  }

  if (logAllEvents) {
    app.log(`getActiveEvents - Recurrences: ${recurrenceEventCount} -- Regulars: ${regularEventCount}`);
  }

  return events;
};
