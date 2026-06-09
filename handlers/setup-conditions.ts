import type { App, FlowCard, FlowCardCondition } from "homey";
import { DateTime } from "luxon";

import { calendarAutocomplete } from "../lib/autocomplete.js";
import { convertToMinutes } from "../lib/convert-to-minutes.js";
import { filterByCalendar, filterByProperty, filterBySummary, filterByUID } from "../lib/filter-by.js";
import { getNextEventValue } from "../lib/get-next-event-value.js";
import { getZonedDateTime } from "../lib/luxon-fns";
import { sortEvent } from "../lib/sort-event.js";

import type { EventAutoCompleteResult } from "../types/Homey.type";
import type { Calendar, CalendarEvent, CalendarEventExtended } from "../types/IcalCalendar.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { isEventIn, isEventOngoing, willEventNotIn } from "./conditions.js";
import { triggerSynchronizationError } from "./trigger-cards.js";
import { updateNextEventWithTokens } from "./update-tokens.js";

type ConditionCardArgumentId = "" | "calendar" | "event";
type ConditionCardRunListenerId =
  | "ongoing"
  | "in"
  | "any_ongoing"
  | "any_ongoing_calendar"
  | "any_in"
  | "stops_in"
  | "any_stops_in"
  | "event_containing_calendar"
  | "event_containing_calendar_stops"
  | "event_containing_calendar_ongoing"
  | "any_in_calendar"
  | "equal_in"
  | "match_in";

type ConditionCard = {
  id: string;
  runListenerId: ConditionCardRunListenerId;
  autocompleteListener: {
    argumentId: ConditionCardArgumentId;
    id: ConditionCardArgumentId;
  };
};

const cards: ConditionCard[] = [
  {
    id: "event_ongoing",
    runListenerId: "ongoing",
    autocompleteListener: {
      argumentId: "event",
      id: "event"
    }
  },
  {
    id: "event_in",
    runListenerId: "in",
    autocompleteListener: {
      argumentId: "event",
      id: "event"
    }
  },
  {
    id: "any_event_ongoing",
    runListenerId: "any_ongoing",
    autocompleteListener: {
      argumentId: "",
      id: ""
    }
  },
  {
    id: "any_event_ongoing_calendar",
    runListenerId: "any_ongoing_calendar",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  },
  {
    id: "any_event_in",
    runListenerId: "any_in",
    autocompleteListener: {
      argumentId: "",
      id: ""
    }
  },
  {
    id: "event_stops_in",
    runListenerId: "stops_in",
    autocompleteListener: {
      argumentId: "event",
      id: "event"
    }
  },
  {
    id: "any_event_stops_in",
    runListenerId: "any_stops_in",
    autocompleteListener: {
      argumentId: "",
      id: ""
    }
  },
  {
    id: "event_containing_in_calendar",
    runListenerId: "event_containing_calendar",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  },
  {
    id: "event_containing_in_calendar_stops_in",
    runListenerId: "event_containing_calendar_stops",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  },
  {
    id: "event_containing_in_calendar_ongoing",
    runListenerId: "event_containing_calendar_ongoing",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  },
  {
    id: "any_event_in_calendar",
    runListenerId: "any_in_calendar",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  },
  {
    id: "calendar_event_equal_in",
    runListenerId: "equal_in",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  },
  {
    id: "calendar_event_match_in",
    runListenerId: "match_in",
    autocompleteListener: {
      argumentId: "calendar",
      id: "calendar"
    }
  }
];

const getEventList = (
  app: App,
  variableMgmt: VariableManagement,
  timezone: string,
  calendars: Calendar[]
): Array<EventAutoCompleteResult> => {
  const eventList: Array<EventAutoCompleteResult> = [];

  if (calendars.length === 0) {
    app.log("[WARN] getEventList: No calendars. Returning empty array");
    return eventList;
  }

  calendars.forEach((calendar: Calendar) => {
    calendar.events.forEach((event: CalendarEvent) => {
      if (!variableMgmt.dateTimeFormat) {
        app.log("[WARN] getEventList: dateTimeFormat not set yet. Returning empty array");
        return;
      }

      const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
      let startStamp: string = "";
      let endStamp: string = "";

      try {
        if (event.dateType === "date-time") {
          startStamp = event.start.toFormat(`${variableMgmt.dateTimeFormat.long} ${variableMgmt.dateTimeFormat.time}`);

          if (event.end.hasSame(event.start, "day")) {
            endStamp = event.end.toFormat(variableMgmt.dateTimeFormat.time);
          } else {
            endStamp = event.end.toFormat(`${variableMgmt.dateTimeFormat.long} ${variableMgmt.dateTimeFormat.time}`);
          }
        }

        if (event.dateType === "date") {
          startStamp = event.start.toFormat(variableMgmt.dateTimeFormat.long);

          if (event.end.hasSame(now, "year")) {
            endStamp = event.end.hasSame(event.start, "day")
              ? ""
              : event.end.toFormat(variableMgmt.dateTimeFormat.long);
          } else {
            endStamp = event.end.toFormat(variableMgmt.dateTimeFormat.long);
          }
        }
      } catch (error) {
        app.error(
          `[ERROR] getEventList: Failed to parse 'start' (${event.start}) or 'end' (${event.end}) on uid '${event.uid}' ->`,
          error
        );
        startStamp = "";
        endStamp = "";

        triggerSynchronizationError({
          app,
          variableMgmt,
          calendar: calendar.name,
          error: error as Error | string,
          event
        }).catch(err => app.error("[ERROR] getEventList: Failed to trigger synchronization error ->", err));
      }

      const name: string = event.summary;
      let description: string = calendar.name;

      if (startStamp !== "" && endStamp !== "") {
        description += ` -- (${startStamp} -> ${endStamp})`;
      }

      if (endStamp === "") {
        description += ` -- (${startStamp})`;
      }

      if (event.freeBusy) {
        description += ` -- ${event.freeBusy}`;
      }

      eventList.push({ id: event.uid, name, description, start: event.start });
    });
  });

  eventList.sort((a: EventAutoCompleteResult, b: EventAutoCompleteResult) => sortEvent(a, b));

  return eventList;
};

const onEventAutocomplete = async (
  app: App,
  variableMgmt: VariableManagement,
  timezone: string,
  query: string,
  type: ConditionCardArgumentId
): Promise<Array<EventAutoCompleteResult>> => {
  if (!variableMgmt.calendars || variableMgmt.calendars.length <= 0) {
    app.log("[WARN] onEventAutocomplete: Calendars not set yet. Nothing to show...");
    return [];
  }

  if (type !== "event") {
    return [];
  }

  if (query) {
    const filtered: Calendar[] = filterBySummary(variableMgmt.calendars, query);
    return getEventList(app, variableMgmt, timezone, filtered);
  }

  return getEventList(app, variableMgmt, timezone, variableMgmt.calendars);
};

const checkEvent = async (
  app: App,
  variableMgmt: VariableManagement,
  timezone: string,
  // biome-ignore lint/suspicious/noExplicitAny: args is from Homey condition cards and can be a lot of things
  args: any,
  type: ConditionCardRunListenerId
): Promise<boolean> => {
  if (!variableMgmt.calendars) {
    app.log("[WARN] checkEvent: Calendars not set yet. Resolving with false");
    return false;
  }

  let filteredCalendars: Calendar[] = [];

  if (type === "ongoing" || type === "in" || type === "stops_in") {
    filteredCalendars = filterByUID(variableMgmt.calendars, args.event.id);
  }

  if (type === "any_ongoing" || type === "any_in" || type === "any_stops_in") {
    filteredCalendars = variableMgmt.calendars;
  }

  if (
    [
      "any_in_calendar",
      "any_ongoing_calendar",
      "event_containing_calendar",
      "event_containing_calendar_stops",
      "equal_in",
      "match_in"
    ].includes(type)
  ) {
    filteredCalendars = filterByCalendar(variableMgmt.calendars, args.calendar.name);
  }

  if (type === "event_containing_calendar_ongoing") {
    filteredCalendars = filterByCalendar(variableMgmt.calendars, args.calendar.name);
    filteredCalendars = filterBySummary(filteredCalendars, args.value);
  }

  if (filteredCalendars.length === 0) {
    app.log("[WARN] checkEvent: filteredCalendars empty... Resolving with false");
    return false;
  }

  if (type === "event_containing_calendar") {
    const inMinutes: number = convertToMinutes(args.when, args.type);
    const nextEvent: CalendarEventExtended | null = getNextEventValue({
      calendars: filteredCalendars,
      specificCalendarName: args.calendar.name,
      value: args.value,
      eventType: "starts",
      timezone
    });
    if (!nextEvent) {
      app.log("checkEvent/event_containing_calendar: No nextEvent found... Resolving with false");
      return false;
    }

    const startsWithin: boolean = isEventIn(app, timezone, [nextEvent], inMinutes);
    app.log(
      `checkEvent/event_containing_calendar: Next event containing found: '${nextEvent.summary}' ${nextEvent.start}. Starts within ${inMinutes} minutes? ${startsWithin}`
    );
    if (startsWithin) {
      await updateNextEventWithTokens(app, variableMgmt, nextEvent);
    }
    return startsWithin;
  }

  if (type === "event_containing_calendar_stops") {
    const inMinutes: number = convertToMinutes(args.when, args.type);
    const nextEvent: CalendarEventExtended | null = getNextEventValue({
      calendars: filteredCalendars,
      specificCalendarName: args.calendar.name,
      value: args.value,
      eventType: "ends",
      timezone
    });
    if (!nextEvent) {
      app.log("checkEvent/event_containing_calendar_stops: No nextEvent found... Resolving with false");
      return false;
    }

    const endsWithin: boolean = willEventNotIn(app, timezone, [nextEvent], inMinutes);
    app.log(
      `checkEvent/event_containing_calendar_stops: Next event containing found: '${nextEvent.summary}' ${nextEvent.end}. Ends within ${inMinutes} minutes? ${endsWithin}`
    );
    if (endsWithin) {
      await updateNextEventWithTokens(app, variableMgmt, nextEvent);
    }
    return endsWithin;
  }

  if (type === "equal_in") {
    if (args.property === undefined || args.property === "" || args.value === undefined || args.value === "") {
      app.log("[WARN] checkEvent: Equal_in : property or value is missing! Returning false");
      return false;
    }

    filteredCalendars = filterByProperty(filteredCalendars, args.value, args.property, "equal");
    if (filteredCalendars.length !== 1 || filteredCalendars[0].events.length === 0) {
      return false;
    }

    if (args.when === undefined || args.type === undefined || args.when === null || args.type === null) {
      app.log(
        `checkEvent: Equal_in found ${filteredCalendars[0].events.length} events in calendar ${filteredCalendars[0].name} matching '${args.property}' with '${args.value}'. No timeframe given (when:'${args.when}', type:'${args.type}')! Returning true`
      );
      return true;
    }
  }

  if (type === "match_in") {
    if (
      args.property === undefined ||
      args.property === "" ||
      args.matcher === undefined ||
      args.matcher === "" ||
      args.value === undefined ||
      args.value === ""
    ) {
      app.log("[WARN] checkEvent: Match_in : property, matcher or value is missing! Returning false");
      return false;
    }

    filteredCalendars = filterByProperty(filteredCalendars, args.value, args.property, args.matcher);
    if (filteredCalendars.length !== 1 || filteredCalendars[0].events.length === 0) {
      return false;
    }

    if (args.when === undefined || args.type === undefined || args.when === null || args.type === null) {
      app.log(
        `checkEvent: Match_in found ${filteredCalendars[0].events.length} events in calendar ${filteredCalendars[0].name} where '${args.property}' '${args.matcher}' '${args.value}'. No timeframe given (when:'${args.when}', type:'${args.type}')! Returning true`
      );
      return true;
    }
  }

  return filteredCalendars.some((calendar: Calendar) => {
    if (calendar.events.length === 0) {
      return false;
    }

    app.log(`checkEvent: Checking ${calendar.events.length} events from '${calendar.name}'`);

    if (type === "ongoing") {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      return isEventOngoing(app, timezone, calendar.events);
      // app.log(`checkEvent: Ongoing? ${eventCondition}`);
    }

    if (["in", "equal_in", "match_in"].includes(type)) {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      return isEventIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type));
      // app.log(`checkEvent: Starting within ${args.when} minutes or less? ${eventCondition}`);
    }

    if (type === "stops_in") {
      // app.log(`checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
      return willEventNotIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type));
      // app.log(`checkEvent: Ending within less than ${args.when} minutes? ${eventCondition}`);
    }

    if (["any_ongoing", "any_ongoing_calendar", "event_containing_calendar_ongoing"].includes(type)) {
      return isEventOngoing(app, timezone, calendar.events);
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ongoing? ${eventCondition}`);
    }

    if (["any_in_calendar", "any_in"].includes(type)) {
      return isEventIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type));
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events starting within ${args.when} minutes or less? ${eventCondition}`);
    }

    if (type === "any_stops_in") {
      return willEventNotIn(app, timezone, calendar.events, convertToMinutes(args.when, args.type));
      // app.log(`checkEvent: Is any of the ${calendar.events.length} events ending within ${args.when} minutes or less? ${eventCondition}`);
    }

    return false;
  });
};

export const setupConditions = (app: App, variableMgmt: VariableManagement, timezone: string): void => {
  // register condition flow cards
  cards.forEach(({ id, runListenerId, autocompleteListener }: ConditionCard) => {
    const conditionCard: FlowCardCondition = app.homey.flow.getConditionCard(id);
    conditionCard.registerRunListener((args, _) => checkEvent(app, variableMgmt, timezone, args, runListenerId));
    if (autocompleteListener.argumentId && autocompleteListener.id) {
      if (autocompleteListener.id === "calendar") {
        conditionCard.registerArgumentAutocompleteListener(
          autocompleteListener.argumentId,
          (query: string, _): FlowCard.ArgumentAutocompleteResults => calendarAutocomplete(app, variableMgmt, query)
        );
        return;
      }

      conditionCard.registerArgumentAutocompleteListener(
        autocompleteListener.argumentId,
        async (query: string, _): Promise<FlowCard.ArgumentAutocompleteResults> =>
          onEventAutocomplete(app, variableMgmt, timezone, query, autocompleteListener.id)
      );
    }
  });
};
