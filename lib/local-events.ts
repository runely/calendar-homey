import type { App } from "homey";
import { DateTime, Duration } from "luxon";
import type { DateType } from "node-ical";

import type { AppTests } from "../types/Homey.type";
import type { LocalEvent, LocalJsonEvent } from "../types/IcalCalendar.type";
import type { GetLocalActiveEventsOptions } from "../types/Options.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { getDateTime, getLocalEventDateTime, getZonedDateTime } from "./luxon-fns";

export const getLocalActiveEvents = (options: GetLocalActiveEventsOptions): LocalEvent[] => {
  const { timezone, events, eventLimit, app, logAllEvents } = options;
  const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
  const eventLimitStart: DateTime<true> = getZonedDateTime(DateTime.now(), timezone).startOf("day");
  const eventLimitEnd: DateTime<true> = getZonedDateTime(DateTime.now(), timezone)
    .endOf("day")
    .plus(Duration.fromObject({ [eventLimit.type]: eventLimit.value }));
  const activeEvents: LocalEvent[] = [];

  for (const event of events) {
    const start: DateTime<true> | null = getDateTime(
      app,
      new Date(event.start),
      "utc",
      timezone,
      event.dateType === "date",
      !logAllEvents
    );
    const end: DateTime<true> | null = getDateTime(
      app,
      new Date(event.end),
      "utc",
      timezone,
      event.dateType === "date",
      !logAllEvents
    );
    const created: DateTime<true> | null = event.created
      ? getDateTime(app, new Date(event.created), "utc", timezone, false, !logAllEvents)
      : null;

    if (!start || !end) {
      app.error(
        `[ERROR] - getLocalActiveEvents: Invalid start or end date for event '${event.summary}' (${event.uid}). Skipping event.`
      );
      continue;
    }

    const dateType: DateType = event.dateType as DateType;
    const startDiff: number = now.diff(start, "seconds").seconds;
    const endDiff: number = now.diff(end, "seconds").seconds;
    const betweenLimit: boolean =
      start.diff(eventLimitStart, "seconds").seconds >= 0 && start.diff(eventLimitEnd, "seconds").seconds <= 0;

    // only add event if
    //    end hasn't happened yet AND start is between eventLimitStart and eventLimitEnd
    // ||
    //    start has happened AND end hasn't happened yet (ongoing)
    if ((endDiff < 0 && betweenLimit) || (startDiff > 0 && endDiff < 0)) {
      if (logAllEvents) {
        // Regular full day event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
        //   or
        // Regular event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
        app.log(
          event.dateType === "date" ? "Local regular full day event:" : "Local regular event:",
          event.summary,
          "--",
          start,
          `(${start.toFormat("dd.MM.yy HH:mm:ss")}) --`,
          end,
          `(${end.toFormat("dd.MM.yy HH:mm:ss")}) --`,
          event.start,
          `-- TZ:${timezone}`,
          "--",
          event.uid
        );
      }

      // set start and end with correct locale (supports only the languages in the locales folder!)
      activeEvents.push({
        ...event,
        start: start.setLocale(app.homey.__("locale.luxon")),
        end: end.setLocale(app.homey.__("locale.luxon")),
        created,
        dateType
      } as LocalEvent);
    }
  }

  return activeEvents;
};

export const getLocalEvents = (
  app: App | AppTests,
  events: string | null,
  timezone: string,
  logAllEvents: boolean
): LocalJsonEvent[] => {
  const localJsonEvents: LocalJsonEvent[] = events && events.length > 0 ? (JSON.parse(events) as LocalJsonEvent[]) : [];

  if (localJsonEvents.every((event: LocalJsonEvent) => "dateType" in event)) {
    return localJsonEvents;
  }

  app.log(
    "getLocalEvents: Detected old format on some or all local events. Converting to new format. Old events:",
    localJsonEvents
  );

  const newLocalEvents: LocalJsonEvent[] = [];

  // convert old events to new format
  for (const event of localJsonEvents) {
    if (!("datetype" in event) && !("skipTZ" in event) && !("freebusy" in event)) {
      newLocalEvents.push(event);
      continue;
    }

    // @ts-expect-error - datetype is from old format
    const oldDateType: string = event["datetype"];
    // @ts-expect-error - skipTZ is from old format
    const oldSkipTZ: boolean = event["skipTZ"];
    // @ts-expect-error - freebusy is from old format
    const oldFreeBusy: string = event["freebusy"];

    // @ts-expect-error - datetype is from old format
    delete event["datetype"];
    // @ts-expect-error - skipTZ is from old format is not needed anymore
    delete event["skipTZ"];
    // @ts-expect-error - freebusy is from old format
    delete event["freebusy"];

    const start: DateTime<true> | null = getLocalEventDateTime(
      app,
      new Date(event.start),
      "utc",
      timezone,
      !oldSkipTZ,
      !logAllEvents
    );

    const end: DateTime<true> | null = getLocalEventDateTime(
      app,
      new Date(event.end),
      "utc",
      timezone,
      !oldSkipTZ,
      !logAllEvents
    );

    if (!start || !end) {
      app.error(
        `[ERROR] - getLocalEvents: Invalid start or end date for event '${event.summary}' (${event.uid}). Removing event!`
      );
      continue;
    }

    newLocalEvents.push({
      ...event,
      start: start.toUTC().toISO(),
      end: end.toUTC().toISO(),
      dateType: oldDateType,
      freeBusy: oldFreeBusy !== "" ? oldFreeBusy : null
    } as LocalJsonEvent);
  }

  app.log("getLocalEvents: Converted to new format. New events:", newLocalEvents);

  app.log(
    "getLocalEvents: Converted",
    localJsonEvents.length,
    "old local events to",
    newLocalEvents.length,
    "new local events with new format"
  );

  return newLocalEvents;
};

export const saveLocalEvents = (
  app: App | AppTests,
  variableMgmt: VariableManagement,
  events: LocalEvent[],
  force: boolean = false
): void => {
  if (events.length === 0) {
    if (force) {
      app.homey.settings.set(variableMgmt.storage.localEvents, JSON.stringify(events));
      app.log("saveLocalEvents: Saved 0 local events (forced)");
      return;
    }

    app.log("saveLocalEvents: No events to save");
    return;
  }

  const savableEvents: LocalJsonEvent[] = events.map((event: LocalEvent) => {
    return {
      ...event,
      start: event.start.toUTC().toISO(),
      end: event.end.toUTC().toISO(),
      created: event.created ? event.created.toUTC().toISO() : undefined,
      description: event.description || ""
    };
  });

  const json: string = JSON.stringify(savableEvents);
  app.homey.settings.set(variableMgmt.storage.localEvents, json);
  app.log("saveLocalEvents: Saved", events.length, "local events:", savableEvents);
  app.log("saveLocalEvents: Previous events", events);
};
