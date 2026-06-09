import { DateTime } from "luxon";
import type { Calendar, CalendarEvent, CalendarEventExtended } from "../types/IcalCalendar.type";
import { getZonedDateTime } from "./luxon-fns";
import { sortEvents } from "./sort-events.js";

export const getEventsToday = (
  timezone: string,
  calendars: Calendar[],
  specificCalendarName?: string
): CalendarEventExtended[] => {
  const eventsToday: CalendarEventExtended[] = [];

  calendars.forEach((calendar: Calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return;
    }

    calendar.events.forEach((event: CalendarEvent) => {
      const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
      const startDiff: number = now.diff(event.start, "milliseconds").milliseconds;
      const endDiff: number = now.diff(event.end, "milliseconds").milliseconds;
      const startIsSameDay: boolean = event.start.hasSame(now, "day");

      const todayNotStartedYet: boolean = startDiff < 0 && startIsSameDay;
      const todayAlreadyStarted: boolean = startDiff > 0 && startIsSameDay && endDiff < 0;
      const startPastButNotEnded: boolean = startDiff > 0 && !startIsSameDay && endDiff < 0;
      if (todayNotStartedYet || todayAlreadyStarted || startPastButNotEnded) {
        eventsToday.push({ ...event, calendarName: calendar.name });
      }
    });
  });

  sortEvents(eventsToday);
  return eventsToday;
};
