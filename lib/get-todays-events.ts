import type { Moment } from "moment";

import type { Calendar, CalendarEvent, CalendarEventExtended } from "../types/VariableMgmt.type";

import { getMomentNow } from "./moment-datetime.js";
import { sortEvents } from "./sort-events.js";

export const getEventsToday = (
  timezone: string,
  calendars: Calendar[],
  specificCalendarName?: string
): CalendarEventExtended[] => {
  const eventsToday: CalendarEventExtended[] = [];
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);

  calendars.forEach((calendar: Calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return;
    }

    calendar.events.forEach((event: CalendarEvent) => {
      const now: Moment = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular;
      const startDiff: number = now.diff(event.start);
      const endDiff: number = now.diff(event.end);
      const startIsSameDay: boolean = event.start.isSame(now, "day");

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
