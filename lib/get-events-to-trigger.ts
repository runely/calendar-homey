import type { App } from "homey";
import { DateTime } from "luxon";
import type { AppTests } from "../types/Homey.type";
import type { Calendar, CalendarEvent, TriggerEvent } from "../types/IcalCalendar.type";
import { getZonedDateTime } from "./luxon-fns";

export const getEventsToTrigger = (app: App | AppTests, calendars: Calendar[], timezone: string): TriggerEvent[] => {
  const events: TriggerEvent[] = [];
  calendars.forEach((calendar: Calendar) => {
    const calendarName: string = calendar.name;
    app.log(`getEventsToTrigger: Checking calendar '${calendarName}' for events to trigger`);
    calendar.events.forEach((event: CalendarEvent) => {
      const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
      const startDiff: number = now.diff(event.start, "seconds").seconds;
      const endDiff: number = now.diff(event.end, "seconds").seconds;

      const resultStart: boolean = startDiff >= 0 && startDiff <= 55 && endDiff <= 0;
      const resultEnd: boolean = endDiff >= 0 && endDiff <= 55;
      const resultStartInCheck: boolean = !resultStart && startDiff < 0;
      const resultEndInCheck: boolean = !resultEnd && endDiff < 0;

      if (resultStart) {
        events.push({
          calendarName,
          event,
          triggerId: "event_starts"
        });

        events.push({
          calendarName,
          event,
          triggerId: "event_starts_calendar",
          state: { calendarName }
        });
      }

      if (resultEnd) {
        events.push({
          calendarName,
          event,
          triggerId: "event_stops"
        });

        events.push({
          calendarName,
          event,
          triggerId: "event_stops_calendar",
          state: { calendarName }
        });
      }

      if (resultStartInCheck) {
        const startsIn: number = Math.round(event.start.diff(now, "minutes").minutes);
        events.push({
          calendarName,
          event,
          triggerId: "event_starts_in",
          state: { when: startsIn }
        });
      }

      if (resultEndInCheck) {
        const endsIn: number = Math.round(event.end.diff(now, "minutes").minutes);
        events.push({
          calendarName,
          event,
          triggerId: "event_stops_in",
          state: { when: endsIn }
        });
      }
    });
  });

  return events;
};
