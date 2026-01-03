import type { VariableManagementCalendar } from "../types/VariableMgmt.type";

import { sortEvents } from "./sort-events";

export const sortCalendarsEvents = (calendars: VariableManagementCalendar[]): VariableManagementCalendar[] => {
  return calendars.map((calendar: VariableManagementCalendar) => {
    return { ...calendar, events: sortEvents(calendar.events) };
  });
};
