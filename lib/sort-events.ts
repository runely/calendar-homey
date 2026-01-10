import type { CalendarEvent, CalendarEventExtended } from "../types/IcalCalendar.type";

import { sortEvent } from "./sort-event";

export const sortEvents = (
  events: CalendarEventExtended[] | CalendarEvent[]
): CalendarEventExtended[] | CalendarEvent[] => {
  return events.sort((a: CalendarEventExtended | CalendarEvent, b: CalendarEventExtended | CalendarEvent) =>
    sortEvent(a, b)
  );
};
