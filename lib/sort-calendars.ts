import type { Calendar } from "../types/IcalCalendar.type";

import { sortEvents } from "./sort-events";

export const sortCalendarsEvents = (calendars: Calendar[]): Calendar[] => {
  return calendars.map((calendar: Calendar) => {
    return { ...calendar, events: sortEvents(calendar.events) };
  });
};
