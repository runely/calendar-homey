import { DateTime } from "luxon";
import type { Calendar, CalendarEvent, NextEvent } from "../types/IcalCalendar.type";
import { getZonedDateTime } from "./luxon-fns";

export const getNextEvent = (
  timezone: string,
  calendars: Calendar[],
  specificCalendarName?: string
): NextEvent | null => {
  let minutesUntilStart: number = 1057885015800000;
  let nextEvent: NextEvent | null = null;

  calendars.forEach((calendar: Calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return;
    }

    calendar.events.forEach((event: CalendarEvent) => {
      const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
      const startDiff: number = Math.round(event.start.diff(now, "minutes").minutes);
      const endDiff: number = Math.round(event.end.diff(now, "minutes").minutes);

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
