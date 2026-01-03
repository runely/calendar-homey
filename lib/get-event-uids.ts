import { CalendarEventUid } from "../types/IcalCalendar.type";
import { VariableManagementCalendar, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

export const getEventUids = (calendars: VariableManagementCalendar[]): CalendarEventUid[] => {
  return calendars.reduce((acc: CalendarEventUid[], curr: VariableManagementCalendar) => {
    curr.events.forEach((event: VariableManagementCalendarEvent) => {
      if (!acc.find((accItem: CalendarEventUid) => accItem.uid === event.uid)) {
        acc.push({ calendar: curr.name, uid: event.uid });
      }
    });

    return acc;
  }, []);
}
