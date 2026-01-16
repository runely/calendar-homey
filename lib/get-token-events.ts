import type { App } from "homey";
import { DateTime } from "luxon";
import type { CalendarEventExtended } from "../types/IcalCalendar.type";
import type { VariableManagement } from "../types/VariableMgmt.type";
import { getZonedDateTime } from "./luxon-fns";

export const getTokenEvents = (
  app: App,
  variableMgmt: VariableManagement,
  timezone: string,
  events: CalendarEventExtended[]
): string => {
  let value: string = "";

  events.forEach((event: CalendarEventExtended) => {
    if (!variableMgmt.dateTimeFormat) {
      app.error("Variable Management Date Time Format is not defined");
      throw new Error("Variable Management Date Time Format is not defined");
    }

    const now: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
    let eventValue: string;

    if (event.dateType === "date-time") {
      if (event.start.hasSame(event.end, "day")) {
        eventValue = `${event.summary}; ${event.start.toFormat(variableMgmt.dateTimeFormat.time)} ${app.homey.__("flowTokens.events_today-tomorrow_start-stop_stamps_pre")} ${event.end.toFormat(variableMgmt.dateTimeFormat.time)}`;
      } else if (event.start.hasSame(event.end, "year")) {
        eventValue = `${event.summary}; ${!event.start.hasSame(now, "day") && !event.end.hasSame(now, "day") ? app.homey.__("flowTokens.events_today-tomorrow_startstamp_fullday") : `${event.start.toFormat(variableMgmt.dateTimeFormat.short)} ${event.start.toFormat(variableMgmt.dateTimeFormat.time)} ${app.homey.__("flowTokens.events_today-tomorrow_start-stop_stamps_pre")} ${event.end.toFormat(variableMgmt.dateTimeFormat.short)} ${event.end.toFormat(variableMgmt.dateTimeFormat.time)}`}`;
      } else {
        eventValue = `${event.summary}; ${!event.start.hasSame(now, "day") && !event.end.hasSame(now, "day") ? app.homey.__("flowTokens.events_today-tomorrow_startstamp_fullday") : `${event.start.toFormat(variableMgmt.dateTimeFormat.long)} ${event.start.toFormat(variableMgmt.dateTimeFormat.time)} ${app.homey.__("flowTokens.events_today-tomorrow_start-stop_stamps_pre")} ${event.end.toFormat(variableMgmt.dateTimeFormat.long)} ${event.end.toFormat(variableMgmt.dateTimeFormat.time)}`}`;
      }

      if (value === "") {
        value = `${eventValue}`;
        return;
      }

      value += `; ${eventValue}`;
      return;
    }

    eventValue = `${event.summary}; ${app.homey.__("flowTokens.events_today-tomorrow_startstamp_fullday")}`;
    if (value === "") {
      value = `${eventValue}`;
      return;
    }

    value += `; ${eventValue}`;
  });

  return value;
};
