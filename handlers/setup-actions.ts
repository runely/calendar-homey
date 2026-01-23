import type { App, FlowCard, FlowCardAction } from "homey";

import { calendarAutocomplete } from "../lib/autocomplete.js";
import { newLocalEvent } from "../lib/generate-event-object.js";
import { getTokenDuration } from "../lib/get-token-duration.js";
import { getTokenValue } from "../lib/get-token-value.js";
import { saveLocalEvents } from "../lib/local-events.js";
import { sortCalendarsEvents } from "../lib/sort-calendars.js";

import type { Calendar, CalendarEvent, EventDuration, LocalEvent } from "../types/IcalCalendar.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { getEvents } from "./get-events.js";
import { triggerEvents } from "./trigger-cards.js";

const getDateTime = (value: string): string | null => {
  const match: RegExpExecArray | null =
    /[1-2][0-9][0-9][0-9]-((0[1-9])|(1[0-2]))-((0[1-9])|(1[0-9])|(2[0-9])|(3[0-1]))T([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z?/g.exec(
      value
    );
  return Array.isArray(match) && match.length > 0 ? match[0].toUpperCase() : null;
};

export const setupActions = (app: App, variableMgmt: VariableManagement): void => {
  // register run listener on action flow cards
  app.homey.flow.getActionCard("sync-calendar").registerRunListener(async (_, __) => {
    app.log(
      `sync-calendar: Action card triggered. ${variableMgmt.gettingEventsRunning ? "getEvents already running" : "Triggering getEvents without reregistering tokens"}`
    );
    const getEventsFinished: string[] = variableMgmt.gettingEventsRunning ? [] : await getEvents(app, variableMgmt);

    if (getEventsFinished.length > 0) {
      throw new Error(getEventsFinished.join("\n\n"));
    }

    return true;
  });

  const newEventAction: FlowCardAction = app.homey.flow.getActionCard("new_event");
  newEventAction.registerRunListener(async (args, _) => {
    if (!variableMgmt.calendars) {
      app.error("[ERROR] new_event: Calendars not initialized yet");
      throw new Error("Calendars not set yet");
    }

    if (typeof args.event_name !== "string" || args.event_name === "") {
      app.log("[WARN] new_event: Title is invalid:", args);
      throw new Error(app.homey.__("actions.new_event.titleInvalid"));
    }

    const startDate: string | null = getDateTime(args.event_start);
    if (startDate === null) {
      app.log("[WARN] new_event: startDate is invalid:", args);
      throw new Error(app.homey.__("actions.new_event.startInvalid"));
    }

    const endDate: string | null = getDateTime(args.event_end);
    if (endDate === null) {
      app.log("[WARN] new_event: endDate is invalid:", args);
      throw new Error(app.homey.__("actions.new_event.endInvalid"));
    }

    const event: LocalEvent | null = newLocalEvent(app, app.homey.clock.getTimezone(), args);
    if (event === null) {
      throw new Error(app.homey.__("actions.new_event.createEventError"));
    }

    app.log("new_event: Adding event", event);
    const calendar: Calendar | undefined = variableMgmt.calendars.find((c: Calendar) => c.name === event.calendar);
    if (!calendar) {
      app.log(`[WARN] new_event: Event '${event.summary}' not added because calendar`, event.calendar, "was not found");
      throw new Error(
        `${app.homey.__("actions.calendarNotFoundOne")} ${event.calendar} ${app.homey.__("actions.calendarNotFoundTwo")}`
      );
    }

    app.log(`new_event: Added '${event.summary}' to calendar '${event.calendar}'`);
    calendar.events.push(event);
    sortCalendarsEvents(variableMgmt.calendars);
    variableMgmt.localEvents.push(event);
    saveLocalEvents(app, variableMgmt, variableMgmt.localEvents);
    await triggerEvents(app, variableMgmt, app.homey.clock.getTimezone(), {
      calendarName: event.calendar,
      event,
      triggerId: "event_added"
    });

    return true;
  });
  newEventAction.registerArgumentAutocompleteListener(
    "calendar",
    (query: string, _): FlowCard.ArgumentAutocompleteResults => calendarAutocomplete(app, variableMgmt, query)
  );

  app.homey.flow.getActionCard("delete_event_name").registerRunListener(async (args, _) => {
    if (!variableMgmt.calendars) {
      app.error("[ERROR] new_event: Calendars not initialized yet");
      throw new Error("Calendars not set yet");
    }

    const event: LocalEvent | undefined = Array.isArray(variableMgmt.localEvents)
      ? variableMgmt.localEvents.find((e: LocalEvent) => e.summary === args.event_name)
      : undefined;
    if (!event) {
      app.log("[WARN] delete_event_name: Local event with title", args.event_name, "not found");
      throw new Error(
        `${app.homey.__("actions.delete_event_name.eventNotFoundOne")} ${args.event_name} ${app.homey.__("actions.delete_event_name.eventNotFoundTwo")}`
      );
    }

    const calendar: Calendar | undefined = variableMgmt.calendars.find((c: Calendar) => c.name === event.calendar);
    if (!calendar) {
      app.log("[WARN] delete_event_name: Calendar", event.calendar, "was not found");
      throw new Error(
        `${app.homey.__("actions.calendarNotFoundOne")} ${event.calendar} ${app.homey.__("actions.calendarNotFoundTwo")}`
      );
    }

    const newCalendarEvents: CalendarEvent[] = calendar.events.filter(
      (e: CalendarEvent) => e.summary !== args.event_name
    );
    const removedEvents: number = calendar.events.length - newCalendarEvents.length;
    calendar.events = newCalendarEvents;
    variableMgmt.localEvents = variableMgmt.localEvents.filter((e: LocalEvent) => e.summary !== args.event_name);
    app.log("delete_event_name: Deleted", removedEvents, "local events by title", args.event_name);
    saveLocalEvents(app, variableMgmt, variableMgmt.localEvents);

    return true;
  });

  app.homey.flow.getActionCard("get_calendars_metadata").registerRunListener((_, __) => {
    if (!variableMgmt.calendars || variableMgmt.calendars.length === 0) {
      throw new Error("Calendars not set yet");
    }

    return {
      json: JSON.stringify(
        variableMgmt.calendars.map((calendar: Calendar) => {
          return {
            calendarName: calendar.name,
            events: calendar.events.map((_: CalendarEvent, index: number) => index)
          };
        })
      )
    };
  });

  const getCalendarEvent: FlowCardAction = app.homey.flow.getActionCard("get_calendar_event");
  getCalendarEvent.registerRunListener((args, _) => {
    if (!variableMgmt.calendars || variableMgmt.calendars.length === 0) {
      throw new Error("Calendars not set yet");
    }

    if (!variableMgmt.dateTimeFormat) {
      throw new Error("Date time format not set yet");
    }

    const calendar: Calendar | undefined = variableMgmt.calendars.find(
      (cal: Calendar) => cal.name === args.calendar.name
    );
    if (!calendar) {
      throw new Error(`Calendar '${args.calendar.name}' not found`);
    }

    const eventIndex: number = args.index;
    if (eventIndex >= calendar.events.length) {
      throw new Error(`Index out of bounce. Index:${eventIndex}, EventCount:${calendar.events.length}`);
    }

    const event: CalendarEvent = calendar.events[eventIndex];
    if (!event) {
      throw new Error(`Event with index ${eventIndex} in calendar '${calendar.name}' was not found`);
    }

    const eventDuration: EventDuration = getTokenDuration(app, event);
    return {
      event_start: event.start.toFormat(`${variableMgmt.dateTimeFormat.long} ${variableMgmt.dateTimeFormat.time}`),
      event_end: event.end.toFormat(`${variableMgmt.dateTimeFormat.long} ${variableMgmt.dateTimeFormat.time}`),
      event_uid: event.uid,
      event_name: getTokenValue(event.summary),
      event_description: getTokenValue(event.description),
      event_location: getTokenValue(event.location),
      event_created: event.created
        ? event.created.toFormat(`${variableMgmt.dateTimeFormat.long} ${variableMgmt.dateTimeFormat.time}`)
        : "",
      event_fullday_event: event.fullDayEvent,
      event_duration_readable: eventDuration.duration,
      event_duration: eventDuration.durationMinutes,
      event_calendar_name: calendar.name,
      event_status: event.freeBusy,
      event_meeting_url: event.meetingUrl
    };
  });
  getCalendarEvent.registerArgumentAutocompleteListener(
    "calendar",
    (query: string, _): FlowCard.ArgumentAutocompleteResults => calendarAutocomplete(app, variableMgmt, query)
  );
};
