import type { Moment } from "moment";

import type { Calendar, CalendarEvent, CalendarEventExtended } from "../types/IcalCalendar.type";

import { getMomentNow } from "./moment-datetime.js";
import { sortEvents } from "./sort-events.js";

export const getEventsTomorrow = (
  timezone: string,
  calendars: Calendar[],
  specificCalendarName?: string
): CalendarEventExtended[] => {
  const eventsTomorrow: CalendarEventExtended[] = [];
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);
  const tomorrowStartRegular: Moment = momentNowRegular.add(1, "day").startOf("day");
  const tomorrowStartUtcOffset: Moment = momentNowUtcOffset.add(1, "day").startOf("day");

  calendars.forEach((calendar: Calendar) => {
    if (specificCalendarName && specificCalendarName !== calendar.name) {
      return;
    }

    calendar.events.forEach((event: CalendarEvent) => {
      const tomorrowStart: Moment = event.fullDayEvent || event.skipTZ ? tomorrowStartUtcOffset : tomorrowStartRegular;
      const startDiff: number = tomorrowStart.diff(event.start);
      const endDiff: number = tomorrowStart.diff(event.end);
      const startIsSameDay: boolean = event.start.isSame(tomorrowStart, "day");

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
