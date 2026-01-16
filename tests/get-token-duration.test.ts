import { DateTime } from "luxon";

import { getTokenDuration } from "../lib/get-token-duration.js";

import locale from "../locales/en.json";

import type { CalendarEvent, EventDuration } from "../types/IcalCalendar.type";

import { constructedApp } from "./lib/construct-app.js";

const {
  locale: { humanize },
  humanize: { conjunction }
} = locale;

constructedApp.homey.__ = (prop: string): string => {
  if (prop.includes("locale.humanize")) {
    return humanize;
  }
  if (prop.includes("humanize.conjunction")) {
    return conjunction;
  }

  return "";
};

const event: CalendarEvent = {
  start: DateTime.now(),
  dateType: "date-time",
  end: DateTime.now().plus({ hour: 1 }),
  uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
  description: "Desc",
  location: "",
  summary: "startNow",
  created: undefined,
  fullDayEvent: false,
  freeBusy: undefined,
  meetingUrl: undefined,
  local: false
};

const eventLong: CalendarEvent = {
  start: DateTime.now(),
  dateType: "date-time",
  end: DateTime.now().plus({ minutes: 15789 }),
  uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
  description: "Desc",
  location: "",
  summary: "startNow",
  created: undefined,
  fullDayEvent: false,
  freeBusy: undefined,
  meetingUrl: undefined,
  local: false
};

describe("getTokenDuration", () => {
  test('Returns an object where "duration" is "1 hour"', () => {
    const result: EventDuration = getTokenDuration(constructedApp, event);
    expect(result.duration).toBe("1 hour");
  });

  test('Returns an object where "duration" is "1 week, 3 days and 23 hours"', () => {
    const result: EventDuration = getTokenDuration(constructedApp, eventLong);
    expect(result.duration).toBe("1 week, 3 days and 23 hours");
  });

  test('Returns an object where "durationMinutes" is 60', () => {
    const result: EventDuration = getTokenDuration(constructedApp, event);
    expect(result.durationMinutes).toBe(60);
  });
});
