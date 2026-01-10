import type { App } from "homey";
import type { Moment } from "moment";

import type { CalendarEventExtended, VariableManagement } from "../types/VariableMgmt.type";

import { getMomentNow } from "./moment-datetime.js";

export const getTokenEvents = (
  app: App,
  variableMgmt: VariableManagement,
  timezone: string,
  events: CalendarEventExtended[]
): string => {
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);
  let value: string = "";

  events.forEach((event: CalendarEventExtended) => {
    if (!variableMgmt.dateTimeFormat) {
      app.error("Variable Management Date Time Format is not defined");
      throw new Error("Variable Management Date Time Format is not defined");
    }

    const now: Moment = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular;
    let eventValue: string = "";

    if (event.dateType === "date-time") {
      if (event.start.isSame(event.end, "day")) {
        eventValue = `${event.summary}; ${event.start.format(variableMgmt.dateTimeFormat.time)} ${app.homey.__("flowTokens.events_today-tomorrow_start-stop_stamps_pre")} ${event.end.format(variableMgmt.dateTimeFormat.time)}`;
      } else if (event.start.isSame(event.end, "year")) {
        eventValue = `${event.summary}; ${!event.start.isSame(now, "day") && !event.end.isSame(now, "day") ? app.homey.__("flowTokens.events_today-tomorrow_startstamp_fullday") : `${event.start.format(variableMgmt.dateTimeFormat.short)} ${event.start.format(variableMgmt.dateTimeFormat.time)} ${app.homey.__("flowTokens.events_today-tomorrow_start-stop_stamps_pre")} ${event.end.format(variableMgmt.dateTimeFormat.short)} ${event.end.format(variableMgmt.dateTimeFormat.time)}`}`;
      } else {
        eventValue = `${event.summary}; ${!event.start.isSame(now, "day") && !event.end.isSame(now, "day") ? app.homey.__("flowTokens.events_today-tomorrow_startstamp_fullday") : `${event.start.format(variableMgmt.dateTimeFormat.long)} ${event.start.format(variableMgmt.dateTimeFormat.time)} ${app.homey.__("flowTokens.events_today-tomorrow_start-stop_stamps_pre")} ${event.end.format(variableMgmt.dateTimeFormat.long)} ${event.end.format(variableMgmt.dateTimeFormat.time)}`}`;
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
