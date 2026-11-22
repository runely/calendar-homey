import type { App } from "homey";
import { DateTime } from "luxon";
import type { AppTests } from "../types/Homey.type.js";
import type { Calendar, CalendarEvent } from "../types/IcalCalendar.type";
import type { FilterDeletedCalendarsEventsOptions } from "../types/Options.type";
import { getZonedDateTime } from "./luxon-fns.js";

const isDeleted = (
  app: App | AppTests,
  oldCalendar: Calendar,
  oldEvent: CalendarEvent,
  newCalendars: Calendar[]
): boolean => {
  const newCalendar: Calendar | undefined = newCalendars.find(
    (newCalendar: Calendar) => newCalendar.name === oldCalendar.name
  );
  if (!newCalendar) {
    // Calendar is removed from settings
    return false;
  }

  const newCalendarEvent: CalendarEvent | undefined = newCalendar.events.find(
    (newEvent: CalendarEvent) => newEvent.uid === oldEvent.uid
  );
  if (newCalendarEvent) {
    // Event is still present
    return false;
  }

  const now: DateTime<true> = getZonedDateTime(DateTime.now(), app.homey.clock.getTimezone());
  // If event.end is less than now, the event has been removed since it's finished
  return oldEvent.end > now;
};

export const filterDeletedCalendarsEvents = (options: FilterDeletedCalendarsEventsOptions): Calendar[] => {
  const { app, oldCalendars, newCalendars } = options;
  const deletedCalendarEvents: Calendar[] = [];

  oldCalendars.forEach((oldCalendar: Calendar) => {
    oldCalendar.events.forEach((oldEvent: CalendarEvent) => {
      if (!isDeleted(app, oldCalendar, oldEvent, newCalendars)) {
        return;
      }

      const deletedFromCalendar: Calendar | undefined = deletedCalendarEvents.find(
        (calendar: Calendar) => calendar.name === oldCalendar.name
      );

      if (deletedFromCalendar) {
        deletedFromCalendar.events.push(oldEvent);
        return;
      }

      deletedCalendarEvents.push({ name: oldCalendar.name, events: [oldEvent] });
    });
  });

  return deletedCalendarEvents;
};
