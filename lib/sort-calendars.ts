import { sortEvents } from './sort-events';

import { VariableManagementCalendar } from "../types/VariableMgmt.type";

export const sortCalendarsEvents = (calendars: VariableManagementCalendar[]): VariableManagementCalendar[] => {
  return calendars.map((calendar: VariableManagementCalendar) => {
    return { ...calendar, events: sortEvents(calendar.events) };
  });
}
