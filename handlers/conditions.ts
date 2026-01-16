import type { App } from "homey";
import { DateTime } from "luxon";

import { getZonedDateTime } from "../lib/luxon-fns";
import type { CalendarEvent, ConditionCaller } from "../types/IcalCalendar.type";

export const isEventOngoing = (
  app: App,
  timezone: string,
  events: CalendarEvent[],
  caller: ConditionCaller = "condition"
): boolean => {
  return events.some((event: CalendarEvent) => {
    const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);

    const startDiff: number = now.diff(event.start, "seconds").seconds;
    const endDiff: number = now.diff(event.end, "seconds").seconds;
    const result: boolean = startDiff >= 0 && endDiff <= 0;

    if (result) {
      app.log(
        `isEventOngoing-${caller}: '${event.uid}' -- ${startDiff} seconds since start -- ${endDiff} seconds since end -- Ongoing: ${result} -- Now:`,
        now
      );
    }

    return result;
  });
};

export const isEventIn = (app: App, timezone: string, events: CalendarEvent[], when: number): boolean => {
  return events.some((event: CalendarEvent) => {
    const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);

    const startDiff: number = event.start.diff(now, "minutes").minutes;
    const result: boolean = startDiff <= when && startDiff >= 0;

    if (result) {
      app.log(
        `isEventIn: '${event.uid}' -- ${startDiff} minutes until start -- Expecting ${when} minutes or less -- In: ${result} -- Now:`,
        now
      );
    }

    return result;
  });
};

export const willEventNotIn = (app: App, timezone: string, events: CalendarEvent[], when: number): boolean => {
  return events.some((event: CalendarEvent) => {
    const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);

    const endDiff: number = event.end.diff(now, "minutes").minutes;
    const result: boolean = endDiff < when && endDiff >= 0;

    if (result) {
      app.log(
        `willEventNotIn: '${event.uid}' -- ${endDiff} minutes until end -- Expecting ${when} minutes or less -- In: ${result} -- Now:`,
        now
      );
    }

    return result;
  });
};
