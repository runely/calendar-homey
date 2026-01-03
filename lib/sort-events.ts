import type { ExtCalendarEvent, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

import { sortEvent } from "./sort-event";

export const sortEvents = (
  events: ExtCalendarEvent[] | VariableManagementCalendarEvent[]
): ExtCalendarEvent[] | VariableManagementCalendarEvent[] => {
  return events.sort(
    (a: ExtCalendarEvent | VariableManagementCalendarEvent, b: ExtCalendarEvent | VariableManagementCalendarEvent) =>
      sortEvent(a, b)
  );
};
