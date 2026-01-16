import type { App } from "homey";
import { DateTime, Duration } from "luxon";
import type { DateType } from "node-ical";
import type { AppTests } from "../types/Homey.type";
import type { LocalEvent } from "../types/IcalCalendar.type";
import type { GetLocalActiveEventsOptions } from "../types/Options.type";
import type { VariableManagement } from "../types/VariableMgmt.type";
import { createDateWithTimeZone } from "./generate-event-object";
import { getDateTime, getZonedDateTime } from "./luxon-fns";

export const getLocalActiveEvents = (options: GetLocalActiveEventsOptions): LocalEvent[] => {
  const { timezone, events, eventLimit, app, logAllEvents } = options;
  const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
  const eventLimitStart: DateTime<true> = getZonedDateTime(DateTime.now(), timezone).startOf("day");
  const eventLimitEnd: DateTime<true> = getZonedDateTime(DateTime.now(), timezone)
    .endOf("day")
    .plus(Duration.fromObject({ [eventLimit.type]: eventLimit.value }));
  const activeEvents: LocalEvent[] = [];

  for (const event of events) {
    const start: DateTime<true> | null = getDateTime({
      app,
      dateWithTimeZone: createDateWithTimeZone(new Date(event.start), timezone),
      localTimeZone: timezone,
      fullDayEvent: event.dateType === "date",
      keepOriginalZonedTime: false,
      quiet: !logAllEvents
    });
    const end: DateTime<true> | null = getDateTime({
      app,
      dateWithTimeZone: createDateWithTimeZone(new Date(event.end), timezone),
      localTimeZone: timezone,
      fullDayEvent: event.dateType === "date",
      keepOriginalZonedTime: false,
      quiet: !logAllEvents
    });
    const created: DateTime<true> | null = !event.created
      ? null
      : getDateTime({
          app,
          dateWithTimeZone: createDateWithTimeZone(new Date(event.created), timezone),
          localTimeZone: timezone,
          fullDayEvent: event.dateType === "date",
          keepOriginalZonedTime: false,
          quiet: !logAllEvents
        });

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
        if (event.dateType === "date") {
          // Regular full day event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
          app.log(
            "Local regular full day event:",
            event.summary,
            "--",
            start,
            "--",
            end,
            "--",
            event.start,
            `-- TZ:${timezone}`,
            "--",
            event.uid
          );
        } else {
          // Regular event: Summary -- Start -- End -- Original Start UTC string -- TZ -- UID
          app.log(
            "Local regular event:",
            event.summary,
            "--",
            start,
            "--",
            end,
            "--",
            event.start,
            `-- TZ:${timezone}`,
            "--",
            event.uid
          );
        }
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

export const saveLocalEvents = (app: App | AppTests, variableMgmt: VariableManagement, events: LocalEvent[]): void => {
  if (events.length === 0) {
    app.log("saveLocalEvents: No events to save");
    return;
  }

  const json: string = JSON.stringify(events);
  app.homey.settings.set(variableMgmt.storage.localEvents, json);
  app.log("saveLocalEvents: Saved", events.length, "local events");
};
