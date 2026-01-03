import type { App } from "homey";
import type { Moment } from "moment";
import type { DateType } from "node-ical";

import type { GetLocalActiveEventsOptions } from "../types/Options.type";
import type { VariableManagement, VariableManagementLocalEvent } from "../types/VariableMgmt.type";

import { findRegularLocalEventEnd } from "./find-regular-event-end.js";
import { getMoment, getMomentNow } from "./moment-datetime.js";

export const getLocalActiveEvents = (options: GetLocalActiveEventsOptions): VariableManagementLocalEvent[] => {
  const { timezone, events, eventLimit, app, logAllEvents } = options;
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);
  const eventLimitStart: Moment = getMoment({ timezone }).startOf("day");
  const eventLimitEnd: Moment = getMoment({ timezone })
    .endOf("day")
    .add(Number.parseInt(eventLimit.value, 10), eventLimit.type);
  const activeEvents: VariableManagementLocalEvent[] = [];

  for (const event of events) {
    const now: Moment = event.skipTZ ? momentNowUtcOffset : momentNowRegular;

    /*const startDate: Date = new Date(event.start as string);
    const endDate: Date = new Date(event.end as string);*/
    const start: Moment = event.skipTZ
      ? getMoment({ date: event.start as string })
      : getMoment({ timezone, date: event.start as string });
    const end: Moment = event.skipTZ ? findRegularLocalEventEnd(event) : findRegularLocalEventEnd(event, timezone);
    const created: Moment = getMoment({ timezone, date: event.created as string });
    const dateType: DateType = event.dateType as DateType;

    // only add event if
    //    end hasn't happened yet AND start is between eventLimitStart and eventLimitEnd
    // ||
    //    start has happened AND end hasn't happened yet (ongoing)
    if (
      (now.diff(end, "seconds") < 0 && start.isBetween(eventLimitStart, eventLimitEnd)) ||
      (now.diff(start, "seconds") > 0 && now.diff(end, "seconds") < 0)
    ) {
      if (logAllEvents) {
        if (event.dateType === "date") {
          // Regular full day event: Summary -- Start -- End -- Original Start UTC string -- UID
          app.log(
            "Local regular full day event:",
            event.summary,
            "--",
            start,
            "--",
            end,
            "--",
            event.start as string,
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
            event.start as string,
            `-- TZ:${event.skipTZ ? "missing/invalid" : timezone}`,
            "--",
            event.uid
          );
        }
      }

      // set start and end with correct locale (supports only the languages in the locales folder!)
      start.locale(app.homey.__("locale.moment"));
      end.locale(app.homey.__("locale.moment"));

      activeEvents.push({ ...event, start, end, created, dateType: dateType } as VariableManagementLocalEvent);
    }
  }

  return activeEvents;
};

export const saveLocalEvents = (
  app: App,
  variableMgmt: VariableManagement,
  events: VariableManagementLocalEvent[]
): void => {
  if (events.length === 0) {
    app.log("saveLocalEvents: No events to save");
    return;
  }

  const json: string = JSON.stringify(events);
  app.homey.settings.set(variableMgmt.storage.localEvents, json);
  app.log("saveLocalEvents: Saved", events.length, "local events");
};
