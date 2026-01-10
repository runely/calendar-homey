import type { CalendarEventUid } from "../types/IcalCalendar.type";
import type { Calendar, CalendarEvent } from "../types/VariableMgmt.type";

export const getEventUids = (calendars: Calendar[]): CalendarEventUid[] => {
  return calendars.reduce((acc: CalendarEventUid[], curr: Calendar) => {
    curr.events.forEach((event: CalendarEvent) => {
      if (!acc.find((accItem: CalendarEventUid) => accItem.uid === event.uid)) {
        acc.push({ calendar: curr.name, uid: event.uid });
      }
    });

    return acc;
  }, []);
};
