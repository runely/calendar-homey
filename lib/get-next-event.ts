import type { Moment } from "moment";

import type { NextEvent } from "../types/IcalCalendar.type";
import type { VariableManagementCalendar, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

import { getMomentNow } from "./moment-datetime.js";

export const getNextEvent = (
  timezone: string,
  calendars: VariableManagementCalendar[],
  specificCalendarName?: string
): NextEvent | null => {
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);
  let minutesUntilStart: number = 1057885015800000;
  let nextEvent: NextEvent | null = null;

  calendars.forEach((calendar: VariableManagementCalendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return;
    }

    calendar.events.forEach((event: VariableManagementCalendarEvent) => {
      const now: Moment = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular;
      const startDiff: number = Math.round(event.start.diff(now, "minutes", true));
      const endDiff: number = Math.round(event.end.diff(now, "minutes", true));

      if (!(startDiff >= 0 && startDiff < minutesUntilStart)) {
        return;
      }

      minutesUntilStart = startDiff;
      nextEvent = {
        calendarName: calendar.name,
        event,
        startsIn: startDiff,
        endsIn: endDiff
      };
    });
  });

  return nextEvent;
};
