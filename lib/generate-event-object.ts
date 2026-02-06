import type { App } from "homey";
import { DateTime } from "luxon";
import type { DateType, ParameterValue, VEvent } from "node-ical";

import type { AppTests } from "../types/Homey.type";
import type { BusyStatus, CalendarEvent, LocalEvent } from "../types/IcalCalendar.type";
import type { NewEventOptions } from "../types/Options.type";

import { extractFreeBusyStatus } from "./extract-free-busy-status";
import { extractMeetingUrl } from "./extract-meeting-url.js";
import { getDateTime, getLocalEventDateTime, getZonedDateTime } from "./luxon-fns";

const generateRandomNumber = (count: number): number => {
  let generatedNumber: string = "";

  for (let i: number = 0; i < count; i++) {
    generatedNumber += Math.floor(Math.random() * 10).toString();
  }

  return parseInt(generatedNumber, 10);
};

const createNewEventUid = (dateTime: DateTime<true>): string => {
  return `local_${dateTime.toFormat(`dd.MM.yy_HH:mm:ss.${generateRandomNumber(3)}`)}`;
};

const createNewEvent = (
  app: App | AppTests,
  start: DateTime<true>,
  dateType: DateType,
  end: DateTime<true>,
  uid: string,
  description: string,
  location: string,
  summary: string,
  created: DateTime<true> | undefined,
  fullDayEvent: boolean,
  freeBusy: BusyStatus | undefined,
  meetingUrl: string | undefined,
  local: boolean
): CalendarEvent => {
  const newEvent: CalendarEvent = {
    start: start.setLocale(app.homey.__("locale.luxon")),
    dateType,
    end: end.setLocale(app.homey.__("locale.luxon")),
    uid,
    description,
    location,
    summary,
    fullDayEvent,
    local
  };

  if (created) {
    newEvent.created = created.setLocale(app.homey.__("locale.luxon"));
  }

  if (freeBusy) {
    newEvent.freeBusy = freeBusy;
  }

  if (meetingUrl) {
    newEvent.meetingUrl = meetingUrl;
  }

  return newEvent;
};

export const convertToText = (app: App | AppTests, prop: string, value: ParameterValue, uid: string): string => {
  if (value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  app.log(`getActiveEvents/convertToText - '${prop}' was object. Using 'val' of object '${uid}'`);
  return value.val;
};

export const fromEvent = (
  app: App | AppTests,
  start: DateTime<true>,
  end: DateTime<true>,
  timezone: string,
  event: VEvent
): CalendarEvent => {
  const created: DateTime<true> | null = event.created
    ? getDateTime(app, event.created, event.created.tz, timezone, false, true)
    : null;

  const description: string = convertToText(app, "description", event.description, event.uid);
  const location: string = convertToText(app, "location", event.location, event.uid);
  const summary: string = convertToText(app, "summary", event.summary, event.uid);

  const fullDayEvent: boolean = event.datetype === "date";
  const freeBusy: BusyStatus | undefined = extractFreeBusyStatus(event);
  const meetingUrl: string | undefined = extractMeetingUrl(description);

  return createNewEvent(
    app,
    start,
    event.datetype,
    end,
    event.uid,
    description,
    location,
    summary,
    created || undefined,
    fullDayEvent,
    freeBusy,
    meetingUrl,
    false
  );
};

export const newLocalEvent = (app: App | AppTests, timezone: string, options: NewEventOptions): LocalEvent | null => {
  const {
    event_name: title,
    event_description: description,
    event_start: start,
    event_end: end,
    apply_timezone: applyTimezone
  } = options;

  const fullDayEvent: boolean = start.includes("00:00:00") && end.includes("00:00:00");
  const startLuxon: DateTime<true> | null = getLocalEventDateTime(
    app,
    new Date(start),
    "utc",
    timezone,
    applyTimezone,
    true
  );
  if (!startLuxon) {
    app.error(`[ERROR] - newLocalEvent: Unable to parse start date: ${start}`);
    return null;
  }

  const endLuxon: DateTime<true> | null = getLocalEventDateTime(
    app,
    new Date(end),
    "utc",
    timezone,
    applyTimezone,
    true
  );
  if (!endLuxon) {
    app.error(`[ERROR] - newLocalEvent: Unable to parse end date: ${end}`);
    return null;
  }

  const created: DateTime<true> = getZonedDateTime(DateTime.now(), timezone);
  const dateType: DateType = fullDayEvent ? "date" : "date-time";

  const newEvent: CalendarEvent = createNewEvent(
    app,
    startLuxon,
    dateType,
    endLuxon,
    createNewEventUid(created),
    description,
    "",
    title,
    created,
    fullDayEvent,
    undefined,
    undefined,
    true
  );

  return { ...newEvent, calendar: options.calendar.name };
};
