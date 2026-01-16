import { DateTime } from "luxon";

import type { Calendar, CalendarEvent, CalendarEventExtended } from "../types/IcalCalendar.type";

import { getZonedDateTime } from "./luxon-fns";
import { sortEvents } from "./sort-events.js";

export const getEventsTomorrow = (
  timezone: string,
  calendars: Calendar[],
  specificCalendarName?: string
): CalendarEventExtended[] => {
  const eventsTomorrow: CalendarEventExtended[] = [];
  const tomorrowStart: DateTime<true> = getZonedDateTime(DateTime.now(), timezone).plus({ day: 1 }).startOf("day");

  calendars.forEach((calendar: Calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return;
    }

    calendar.events.forEach((event: CalendarEvent) => {
      const startDiff: number = tomorrowStart.diff(event.start, "milliseconds").milliseconds;
      const endDiff: number = tomorrowStart.diff(event.end, "milliseconds").milliseconds;
      const startIsSameDay: boolean = event.start.hasSame(tomorrowStart, "day");

      const tomorrowNotStartedYet: boolean = startDiff <= 0 && startIsSameDay;
      const startPastButNotEnded: boolean = startDiff > 0 && !startIsSameDay && endDiff < 0;
      if (tomorrowNotStartedYet || startPastButNotEnded) {
        eventsTomorrow.push({ ...event, calendarName: calendar.name });
      }
    });
  });

  sortEvents(eventsTomorrow);
  return eventsTomorrow;
};
