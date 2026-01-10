import type { EventAutoCompleteResult } from "../types/Homey.type";
import type { CalendarEvent, CalendarEventExtended } from "../types/VariableMgmt.type";

export const sortEvent = (
  a: CalendarEventExtended | CalendarEvent | EventAutoCompleteResult,
  b: CalendarEventExtended | CalendarEvent | EventAutoCompleteResult
): number => {
  return a.start.toDate().getTime() - b.start.toDate().getTime();
};
