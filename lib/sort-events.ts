import { sortEvent } from './sort-event';

import { ExtCalendarEvent, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

export const sortEvents = (events: ExtCalendarEvent[] | VariableManagementCalendarEvent[]): ExtCalendarEvent[] | VariableManagementCalendarEvent[] => {
  return events.sort((a: ExtCalendarEvent | VariableManagementCalendarEvent, b: ExtCalendarEvent | VariableManagementCalendarEvent) => sortEvent(a, b));
}
