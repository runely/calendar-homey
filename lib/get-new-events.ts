import { DateTime } from "luxon";
import type { Calendar, CalendarEvent, CalendarEventExtended, CalendarEventUid } from "../types/IcalCalendar.type";
import type { GetNewEventsOptions } from "../types/Options.type";
import { getZonedDateTime } from "./luxon-fns";

const isEventNew = (timezone: string, created: DateTime<true> | undefined): boolean => {
  if (!created) {
    return false;
  }

  const oneDay: number = 86400000;
  const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
  return now.toMillis() - created.toMillis() < oneDay;
};

export const getNewEvents = (options: GetNewEventsOptions): CalendarEventExtended[] => {
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

  const newEvents: CalendarEventExtended[] = [];
  newlyAddedEvents.forEach((newEvent: CalendarEventUid) => {
    const calendar: Calendar | undefined = calendarsEvents.find(
      (calendar: Calendar) => calendar.name === newEvent.calendar
    );
    if (!calendar) {
      app.log(`[WARN] getNewEvents: Calendar '${newEvent.calendar}' not found 😬`);
      return;
    }

    const event: CalendarEvent | undefined = calendar.events.find((event: CalendarEvent) => event.uid === newEvent.uid);
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
