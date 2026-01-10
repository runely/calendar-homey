import { getTokenDuration } from "../lib/get-token-duration.js";
import { getMoment } from "../lib/moment-datetime.js";
import locale from "../locales/en.json";
import type { EventDuration } from "../types/IcalCalendar.type";
import type { VariableManagementCalendarEvent } from "../types/VariableMgmt.type";
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

const event: VariableManagementCalendarEvent = {
  start: getMoment(),
  dateType: "date-time",
  end: getMoment().add(1, "hours"),
  uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
  description: "Desc",
  location: "",
  summary: "startNow",
  created: undefined,
  fullDayEvent: false,
  skipTZ: true,
  freeBusy: undefined,
  meetingUrl: undefined,
  local: false
};

const eventLong: VariableManagementCalendarEvent = {
  start: getMoment(),
  dateType: "date-time",
  end: getMoment().add(15789, "minutes"),
  uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
  description: "Desc",
  location: "",
  summary: "startNow",
  created: undefined,
  fullDayEvent: false,
  skipTZ: true,
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
