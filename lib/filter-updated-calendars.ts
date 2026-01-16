import type { App } from "homey";
import { DateTime } from "luxon";

import type { AppTests } from "../types/Homey.type";
import type { Calendar, CalendarEvent, CalendarEventPropertyChanged, HasDataType } from "../types/IcalCalendar.type";
import type { FilterUpdatedCalendarsOptions } from "../types/Options.type";

import { hasData } from "./has-data.js";

function isChanged(app: App | AppTests, previous: HasDataType, current: HasDataType): boolean {
  if (hasData(previous) && hasData(current)) {
    if (typeof previous === "string" && typeof current === "string") {
      return previous.toLowerCase() !== current.toLowerCase();
    }

    if (DateTime.isDateTime(previous) && DateTime.isDateTime(current)) {
      return !previous.equals(current);
    }

    app.error(
      `[ERROR] filterUpdatedCalendars/isChanged: Previous and current has values, but are not luxon or string types -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current}). isChanged should be updated to handle this type properly.`
    );
    return false;
  }

  if (hasData(previous) && !hasData(current)) {
    app.log(
      `filterUpdatedCalendars: Previous value had data but current value does not. This can be a sync hiccup or correct -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current})`
    );
    return true;
  }

  if (!hasData(previous) && hasData(current)) {
    app.log(
      `filterUpdatedCalendars: Previous value did not have data but current value does. This can be a sync hiccup or correct -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current})`
    );
    return true;
  }

  app.log(
    `filterUpdatedCalendars/isChanged: Both previous and current values are missing data -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current})`
  );
  return false;
}

export const filterUpdatedCalendars = (options: FilterUpdatedCalendarsOptions): Calendar[] => {
  const { app, variableMgmt, oldCalendars, newCalendars } = options;
  const updatedCalendars: Calendar[] = [];

  newCalendars.forEach((newCalendar: Calendar) => {
    const newCalendarName: string = newCalendar.name;
    const oldCalendar: Calendar | undefined = oldCalendars.find(
      (calendar: Calendar) => calendar.name === newCalendarName
    );
    const oldCalendarEvents: CalendarEvent[] = oldCalendar?.events || [];

    newCalendar.events.forEach((newEvent: CalendarEvent) => {
      const oldEvent: CalendarEvent | undefined = oldCalendarEvents.find(
        (event: CalendarEvent) => event.uid === newEvent.uid
      );
      if (!oldEvent) {
        return;
      }

      const changed: CalendarEventPropertyChanged[] = [];
      const summaryChanged: boolean = isChanged(app, oldEvent.summary, newEvent.summary);
      const startChanged: boolean = isChanged(app, oldEvent.start, newEvent.start);
      const endChanged: boolean = isChanged(app, oldEvent.end, newEvent.end);
      const descriptionChanged: boolean = isChanged(app, oldEvent.description, newEvent.description);
      const locationChanged: boolean = isChanged(app, oldEvent.location, newEvent.location);

      if (variableMgmt.dateTimeFormat?.long === undefined || variableMgmt.dateTimeFormat?.time === undefined) {
        app.error(
          `[ERROR] filterUpdatedCalendars: dateTimeFormat is not properly defined in variableMgmt. long: '${variableMgmt.dateTimeFormat?.long}' , time: '${variableMgmt.dateTimeFormat?.time}'`
        );
        throw new Error("variableMgmt.dateTimeFormat is not properly defined.");
      }

      if (summaryChanged) {
        changed.push({
          type: app.homey.__("triggers.event_changed.summary"),
          previousValue: oldEvent.summary,
          newValue: newEvent.summary
        });
      }

      if (startChanged) {
        changed.push({
          type: app.homey.__("triggers.event_changed.start"),
          previousValue: `${oldEvent.start.toFormat(variableMgmt.dateTimeFormat.long)} ${oldEvent.start.toFormat(variableMgmt.dateTimeFormat.time)}`,
          newValue: `${newEvent.start.toFormat(variableMgmt.dateTimeFormat.long)} ${newEvent.start.toFormat(variableMgmt.dateTimeFormat.time)}`
        });
      }

      if (endChanged) {
        changed.push({
          type: app.homey.__("triggers.event_changed.end"),
          previousValue: `${oldEvent.end.toFormat(variableMgmt.dateTimeFormat.long)} ${oldEvent.end.toFormat(variableMgmt.dateTimeFormat.time)}`,
          newValue: `${newEvent.end.toFormat(variableMgmt.dateTimeFormat.long)} ${newEvent.end.toFormat(variableMgmt.dateTimeFormat.time)}`
        });
      }

      if (descriptionChanged) {
        changed.push({
          type: app.homey.__("triggers.event_changed.description"),
          previousValue: oldEvent.description,
          newValue: newEvent.description
        });
      }

      if (locationChanged) {
        changed.push({
          type: app.homey.__("triggers.event_changed.location"),
          previousValue: oldEvent.location,
          newValue: newEvent.location
        });
      }

      if (changed.length === 0) {
        return;
      }

      const updatedCalendar: Calendar | undefined = updatedCalendars.find(
        (calendar: Calendar) => calendar.name === newCalendarName
      );
      const updatedEvent: CalendarEvent = {
        ...newEvent,
        changed,
        oldEvent
      };

      if (updatedCalendar) {
        updatedCalendar.events.push(updatedEvent);
      } else {
        updatedCalendars.push({ name: newCalendarName, events: [updatedEvent] });
      }

      app.log(
        `filterUpdatedCalendars: Updated event - Summary: '${oldEvent.summary}' -> '${newEvent.summary}' (${summaryChanged}) , Start: '${oldEvent.start}' -> '${newEvent.start}' (${startChanged}) , End: '${oldEvent.end}' -> '${newEvent.end}' (${endChanged}) , Description: '${oldEvent.description}' -> '${newEvent.description}' (${descriptionChanged}) , Location: '${oldEvent.location}' -> '${newEvent.location}' (${locationChanged})`
      );
    });
  });

  return updatedCalendars;
};
