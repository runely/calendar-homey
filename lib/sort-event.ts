import { EventAutoCompleteResult } from "../types/Homey.type";
import { ExtCalendarEvent, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

export const sortEvent = (a: ExtCalendarEvent | VariableManagementCalendarEvent | EventAutoCompleteResult, b: ExtCalendarEvent | VariableManagementCalendarEvent | EventAutoCompleteResult): number => {
  return a.start.toDate().getTime() - b.start.toDate().getTime();
}
