import type { App } from "homey";
import { DateTime, type DateTimeMaybeValid, Duration } from "luxon";
import type { CalendarComponent, EventInstance, VEvent } from "node-ical";
import nodeICal from "node-ical";

import { triggerSynchronizationError } from "../handlers/trigger-cards";

import type { AppTests } from "../types/Homey.type";
import type { CalendarEvent } from "../types/IcalCalendar.type";
import type { GetActiveEventsOptions } from "../types/Options.type";

import { convertToText, fromEvent } from "./generate-event-object";
import { hasData } from "./has-data";
import { getDateTime, getZonedDateTime } from "./luxon-fns";

const untilRegexp = /UNTIL=(\d{8}T\d{6})/;

const filterOutUnwantedEvents = (
  app: App | AppTests,
  logAllEvents: boolean,
  events: (CalendarComponent | undefined)[],
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

  const filteredEvents: VEvent[] = events.filter((event: CalendarComponent | undefined) => {
    if (!event) {
      nonVEvents++;
      return false;
    }

    // Needed to let TypeScript know that event is of type VEvent
    if (event.type !== "VEVENT") {
      nonVEvents++;
      return false;
    }

    if (!event.rrule) {
      if (!hasData(event.start)) {
        app.error(
          `[ERROR] - getActiveEvents/filterOutUnwantedEvents: Missing DTSTART (${event.start} (${event.start?.tz || "undefined TZ"})) on non-recurring event UID '${event.uid}'. Skipping event.`
        );
        regularInvalidVEvents++;
        return false;
      }

      const startMillis: number = event.start.getTime();
      const endMillis: number = (event.end ?? event.start).getTime();
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

export const getActiveEvents = async (options: GetActiveEventsOptions): Promise<CalendarEvent[]> => {
  const { app, variableMgmt, calendarName, data, eventLimit, logAllEvents, timezone } = options;
  const eventLimitStart: DateTime<true> = getZonedDateTime(DateTime.now(), timezone).startOf("day");

  const eventLimitDuration: Duration = Duration.fromObject({ [eventLimit.type]: eventLimit.value });
  const eventLimitEnd: DateTime<true> = DateTime.now().endOf("day").plus(eventLimitDuration);
  const events: CalendarEvent[] = [];
  let recurrenceEventCount: number = 0;
  let regularEventCount: number = 0;

  const actualEvents: VEvent[] = filterOutUnwantedEvents(app, logAllEvents, data, eventLimitStart, eventLimitEnd);

  for (const event of actualEvents) {
    const eventInstances: EventInstance[] = nodeICal.expandRecurringEvent(event, {
      excludeExdates: true,
      expandOngoing: true,
      includeOverrides: true,
      from: eventLimitStart.toJSDate(),
      to: eventLimitEnd.toJSDate()
    });

    if (eventInstances.length === 0) {
      if (logAllEvents) {
        app.log(
          `[WARN] - getActiveEvents - No event instances found for event UID '${event.uid}' after expanding events. Skipping event.`
        );
      }

      continue;
    }

    const fixedEventUids: Set<string> = new Set();

    for (const eventInstance of eventInstances) {
      if (!fixedEventUids.has(eventInstance.event.uid)) {
        // set properties to be text value IF it's an object
        eventInstance.event.uid = convertToText(app, "uid", eventInstance.event.uid, eventInstance.event.uid);
        eventInstance.event.summary = convertToText(app, "summary", eventInstance.summary, eventInstance.event.uid);
        eventInstance.event.location = convertToText(
          app,
          "location",
          eventInstance.event.location,
          eventInstance.event.uid
        );
        eventInstance.event.description = convertToText(
          app,
          "description",
          eventInstance.event.description,
          eventInstance.event.uid
        );

        // make sure not to convert the same eventInstance.event multiple times
        fixedEventUids.add(eventInstance.event.uid);
      }

      eventInstance.summary = eventInstance.event.summary; // ensure eventInstance summary is converted to text as well

      const eventEndTz: string | undefined = eventInstance.end?.tz || eventInstance.start.tz;
      if (!eventInstance.event.end) {
        app.log(
          `[WARN] - getActiveEvents - End is not specified on event UID '${eventInstance.event.uid}'. Using start TZ as end TZ: ${eventEndTz || "undefined TZ"}`
        );
      }

      const startDate: DateTime<true> | null = getDateTime(
        app,
        eventInstance.start,
        eventInstance.event.start.tz,
        timezone,
        eventInstance.isFullDay,
        !logAllEvents
      );
      const endDate: DateTime<true> | null = getDateTime(
        app,
        eventInstance.end,
        eventEndTz,
        timezone,
        eventInstance.isFullDay,
        !logAllEvents
      );

      if (!startDate || !endDate) {
        app.error(
          `getActiveEvents - start (${startDate}) and/or end (${endDate}) is invalid on '${eventInstance.summary}' (${eventInstance.event.uid}). Skipping this event`
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

      if (eventInstance.isRecurring) {
        recurrenceEventCount++;

        // NOTE: IF toISODate fails, fallback month will be a single digit IF month is < 10
        const startDateIso: string = startDate.toISODate() || `${startDate.year}-${startDate.month}-${startDate.day}`;
        const recurringEventUid = `${eventInstance.event.uid}_${startDateIso}`;

        app.log(
          `getActiveEvents - Recurrence Summary: '${eventInstance.summary}' -- Start: '${startDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${startDate.toISO()} (${startDate.zoneName})) -- End: '${endDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${endDate.toISO()} (${endDate.zoneName})) -- UID: '${recurringEventUid}' -- DateType: '${eventInstance.isFullDay ? "FULL DAY" : "PARTIAL DAY"}'`
        );

        events.push(
          fromEvent(app, eventInstance.event, startDate, endDate, timezone, recurringEventUid, eventInstance.isFullDay)
        );

        continue;
      }

      regularEventCount++;

      app.log(
        `getActiveEvents - Summary: '${eventInstance.summary}' -- Start: '${startDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${startDate.toISO()} (${startDate.zoneName})) -- End: '${endDate.toFormat("dd.MM.yyyy HH:mm:ss")}' (${endDate.toISO()} (${endDate.zoneName})) -- UID: '${eventInstance.event.uid}' -- DateType: '${eventInstance.isFullDay ? "FULL DAY" : "PARTIAL DAY"}'`
      );

      events.push(
        fromEvent(
          app,
          eventInstance.event,
          startDate,
          endDate,
          timezone,
          eventInstance.event.uid,
          eventInstance.isFullDay
        )
      );
    }
  }

  if (logAllEvents) {
    app.log(`getActiveEvents - Recurrences: ${recurrenceEventCount} -- Regulars: ${regularEventCount}`);
  }

  return events;
};
