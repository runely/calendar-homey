import type { App } from "homey";
import moment, { type Moment } from "moment";

import type { CalendarPropertyChanged } from "../types/IcalCalendar.type";
import type { FilterUpdatedCalendarsOptions } from "../types/Options.type";
import type { VariableManagementCalendar, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

import { hasData } from "./has-data.js";

function isChanged<T>(app: App, previous: T, current: T): boolean {
  if (hasData<T>(previous) && hasData<T>(current)) {
    if (typeof previous === "string" && typeof current === "string") {
      return previous.toLowerCase() !== current.toLowerCase();
    }

    if (moment.isMoment(previous) && moment.isMoment(current)) {
      return !previous.isSame(current);
    }

    app.log(
      `[WARN] filterUpdatedCalendars/isChanged: Previous and current has values, but are not moment or string types -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current}). isChanged should be updated to handle this type properly.`
    );
    return false;
  }

  if (hasData<T>(previous) && !hasData<T>(current)) {
    app.log(
      `[WARN] filterUpdatedCalendars: Previous value had data but current value does not. This is probably a sync hiccup -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current})`
    );
    return false;
  }

  if (!hasData<T>(previous) && hasData<T>(current)) {
    app.log(
      `[WARN] filterUpdatedCalendars: Previous value did not have data but current value does. This is probably a sync hiccup -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current})`
    );
    return false;
  }

  app.error(
    `[ERROR] filterUpdatedCalendars/isChanged: Both previous and current values are missing data. This should not happen -- Previous: '${previous}' (${typeof previous}) , Current: '${current}' (${typeof current})`
  );
  return false;
}

export const filterUpdatedCalendars = (options: FilterUpdatedCalendarsOptions): VariableManagementCalendar[] => {
  const { app, variableMgmt, oldCalendars, newCalendars } = options;
  const updatedCalendars: VariableManagementCalendar[] = [];

  newCalendars.forEach((newCalendar: VariableManagementCalendar) => {
    const newCalendarName: string = newCalendar.name;
    const oldCalendar: VariableManagementCalendar | undefined = oldCalendars.find(
      (calendar: VariableManagementCalendar) => calendar.name === newCalendarName
    );
    const oldCalendarEvents: VariableManagementCalendarEvent[] = oldCalendar?.events || [];

    newCalendar.events.forEach((newEvent: VariableManagementCalendarEvent) => {
      const oldEvent: VariableManagementCalendarEvent | undefined = oldCalendarEvents.find(
        (event: VariableManagementCalendarEvent) => event.uid === newEvent.uid
      );
      if (!oldEvent) {
        return;
      }

      const changed: CalendarPropertyChanged[] = [];
      const summaryChanged: boolean = isChanged<string>(app, oldEvent.summary, newEvent.summary);
      const startChanged: boolean = isChanged<Moment>(app, oldEvent.start, newEvent.start);
      const endChanged: boolean = isChanged<Moment>(app, oldEvent.end, newEvent.end);
      const descriptionChanged: boolean = isChanged<string>(app, oldEvent.description, newEvent.description);
      const locationChanged: boolean = isChanged<string>(app, oldEvent.location, newEvent.location);

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
          previousValue: `${oldEvent.start.format(variableMgmt.dateTimeFormat.long)} ${oldEvent.start.format(variableMgmt.dateTimeFormat.time)}`,
          newValue: `${newEvent.start.format(variableMgmt.dateTimeFormat.long)} ${newEvent.start.format(variableMgmt.dateTimeFormat.time)}`
        });
      }

      if (endChanged) {
        changed.push({
          type: app.homey.__("triggers.event_changed.end"),
          previousValue: `${oldEvent.end.format(variableMgmt.dateTimeFormat.long)} ${oldEvent.end.format(variableMgmt.dateTimeFormat.time)}`,
          newValue: `${newEvent.end.format(variableMgmt.dateTimeFormat.long)} ${newEvent.end.format(variableMgmt.dateTimeFormat.time)}`
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

      const updatedCalendar: VariableManagementCalendar | undefined = updatedCalendars.find(
        (calendar: VariableManagementCalendar) => calendar.name === newCalendarName
      );
      const updatedEvent: VariableManagementCalendarEvent = {
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
