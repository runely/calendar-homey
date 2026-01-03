import type { Moment } from "moment";

import type { CalendarEventUid } from "../types/IcalCalendar.type";
import type { GetNewEventsOptions } from "../types/Options.type";
import type {
  ExtCalendarEvent,
  VariableManagementCalendar,
  VariableManagementCalendarEvent
} from "../types/VariableMgmt.type";

import { getMoment } from "./moment-datetime";

const isEventNew = (timezone: string, created: Moment | undefined): boolean => {
  if (!created) {
    return false;
  }

  const oneDay: number = 86400000;
  const now: Moment = getMoment({ timezone });
  return now.toDate().getTime() - created.toDate().getTime() < oneDay;
};

export const getNewEvents = (options: GetNewEventsOptions): ExtCalendarEvent[] => {
  const { timezone, oldCalendarsUids, newCalendarsUids, calendarsEvents, app } = options;
  if (oldCalendarsUids.length === 0) {
    return [];
  }

  const newlyAddedEvents: CalendarEventUid[] = newCalendarsUids.filter(
    (newEvent: CalendarEventUid) =>
      !oldCalendarsUids.find((oldEvent: CalendarEventUid) => newEvent.uid === oldEvent.uid)
  );
  if (newlyAddedEvents.length === 0) {
    return [];
  }

  const newEvents: ExtCalendarEvent[] = [];
  newlyAddedEvents.forEach((newEvent: CalendarEventUid) => {
    const calendar: VariableManagementCalendar | undefined = calendarsEvents.find(
      (calendar: VariableManagementCalendar) => calendar.name === newEvent.calendar
    );
    if (!calendar) {
      app.log(`[WARN] getNewEvents: Calendar '${newEvent.calendar}' not found 😬`);
      return;
    }

    const event: VariableManagementCalendarEvent | undefined = calendar.events.find(
      (event: VariableManagementCalendarEvent) => event.uid === newEvent.uid
    );
    if (!event) {
      app.log(`[WARN] getNewEvents: Event '${newEvent.uid}' in calendar '${newEvent.calendar}' not found 😬`);
      return;
    }

    if (!isEventNew(timezone, event.created)) {
      return;
    }

    app.log(
      `getNewEvents: Will trigger new event for event with uid '${event.uid}' from '${calendar.name}' with name '${event.summary}' created @ '${event.created}'`
    );
    newEvents.push({ ...event, calendarName: calendar.name });
  });

  return newEvents;
};
