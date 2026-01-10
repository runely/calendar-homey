import type { App } from "homey";
import type { Moment } from "moment";

import { getMomentNow } from "../lib/moment-datetime.js";

import type { ConditionCaller } from "../types/IcalCalendar.type";
import type { CalendarEvent } from "../types/VariableMgmt.type";

export const isEventOngoing = (
  app: App,
  timezone: string,
  events: CalendarEvent[],
  caller: ConditionCaller = "condition"
): boolean => {
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);

  return events.some((event: CalendarEvent) => {
    const useOffset: boolean = event.fullDayEvent || event.skipTZ;
    const now: Moment = useOffset ? momentNowUtcOffset : momentNowRegular;

    const startDiff: number = now.diff(event.start, "seconds");
    const endDiff: number = now.diff(event.end, "seconds");
    const result: boolean = startDiff >= 0 && endDiff <= 0;

    if (result) {
      app.log(
        `isEventOngoing-${caller}: '${event.uid}' -- ${startDiff} seconds since start -- ${endDiff} seconds since end -- Ongoing: ${result} -- Now:`,
        now,
        `-- Offset used: ${useOffset}`
      );
    }

    return result;
  });
};

export const isEventIn = (app: App, timezone: string, events: CalendarEvent[], when: number): boolean => {
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);

  return events.some((event: CalendarEvent) => {
    const useOffset: boolean = event.fullDayEvent || event.skipTZ;
    const now: Moment = useOffset ? momentNowUtcOffset : momentNowRegular;

    const startDiff: number = event.start.diff(now, "minutes", true);
    const result: boolean = startDiff <= when && startDiff >= 0;

    if (result) {
      app.log(
        `isEventIn: '${event.uid}' -- ${startDiff} minutes until start -- Expecting ${when} minutes or less -- In: ${result} -- Now:`,
        now,
        `-- Offset used: ${useOffset}`
      );
    }

    return result;
  });
};

export const willEventNotIn = (app: App, timezone: string, events: CalendarEvent[], when: number): boolean => {
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);

  return events.some((event: CalendarEvent) => {
    const useOffset: boolean = event.fullDayEvent || event.skipTZ;
    const now: Moment = useOffset ? momentNowUtcOffset : momentNowRegular;

    const endDiff: number = event.end.diff(now, "minutes", true);
    const result: boolean = endDiff < when && endDiff >= 0;

    if (result) {
      app.log(
        `willEventNotIn: '${event.uid}' -- ${endDiff} minutes until end -- Expecting ${when} minutes or less -- In: ${result} -- Now:`,
        now,
        `-- Offset used: ${useOffset}`
      );
    }

    return result;
  });
};
