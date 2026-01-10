import type { DateWithTimeZone, VEvent } from "node-ical";
import { fromEvent, newEvent } from "../lib/generate-event-object.js";
import { getMoment } from "../lib/moment-datetime.js";
import type { CalendarEvent, LocalEvent } from "../types/VariableMgmt.type";
import { constructedApp } from "./lib/construct-app";

const createDateWithTimeZone = (date: Date, timeZone?: string | undefined): DateWithTimeZone => {
  return Object.defineProperty(date, "tz", {
    value: timeZone,
    enumerable: false,
    configurable: true,
    writable: false
  }) as DateWithTimeZone;
};

const timezone: string = "Europe/Oslo";

const utcEvent: VEvent = {
  class: "PUBLIC",
  completion: "",
  dtstamp: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z")),
  exdate: undefined,
  geo: undefined,
  lastmodified: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z")),
  method: "PUBLISH",
  sequence: "",
  transparency: "OPAQUE",
  organizer: "CN=Balle",
  recurrenceid: undefined,
  params: [],
  type: "VEVENT",
  url: "",
  start: createDateWithTimeZone(new Date("2021-11-05T20:00:00.000Z")),
  datetype: "date-time",
  end: createDateWithTimeZone(new Date("2021-11-05T21:00:00.000Z")),
  uid: "cal_one_One",
  description: "OneDesc",
  location: "",
  summary: "One",
  created: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z")),
  // @ts-expect-error - This is actually on the object, but the exported types are missing it...
  "MICROSOFT-CDO-BUSYSTATUS": "WORKINGELSEWHERE"
};

const tzEvent: VEvent = {
  class: "PUBLIC",
  completion: "",
  dtstamp: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z")),
  exdate: undefined,
  geo: undefined,
  lastmodified: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z")),
  method: "PUBLISH",
  sequence: "",
  transparency: "OPAQUE",
  organizer: "CN=Balle",
  recurrenceid: undefined,
  params: [],
  type: "VEVENT",
  url: "",
  start: createDateWithTimeZone(new Date("2021-11-05T20:00:00.000Z"), timezone),
  datetype: "date-time",
  end: createDateWithTimeZone(new Date("2021-11-05T21:00:00.000Z"), timezone),
  uid: "cal_one_One",
  description: "OneDesc",
  location: "",
  summary: "One",
  created: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z")),
  // @ts-expect-error - This is actually on the object, but the exported types are missing it...
  "X-MICROSOFT-CDO-BUSYSTATUS": "BUSY"
};

describe("fromEvent", () => {
  test("Returns correct object when event is UTC", () => {
    const result: CalendarEvent = fromEvent(
      constructedApp,
      getMoment({ date: utcEvent.start.toISOString() }),
      getMoment({ date: utcEvent.end.toISOString() }),
      timezone,
      utcEvent
    );
    expect(result.fullDayEvent).toBe(false);
    expect(result.skipTZ).toBe(true);
    expect(result.freeBusy).toBe("WORKINGELSEWHERE");
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBe(false);
  });

  test("Returns correct object when event has TZ", () => {
    const result: CalendarEvent = fromEvent(
      constructedApp,
      getMoment({ date: tzEvent.start.toISOString(), timezone }),
      getMoment({ date: tzEvent.end.toISOString(), timezone }),
      timezone,
      tzEvent
    );
    expect(result.fullDayEvent).toBe(false);
    expect(result.skipTZ).toBe(true);
    expect(result.freeBusy).toBe("BUSY");
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBe(false);
  });
});

describe("newEvent", () => {
  test("Returns correct object when 'applyTimezone' is false", () => {
    const title: string = "Test1";
    const description: string = "TestDesc";
    const start: string = "2023-04-06T12:00:00Z";
    const end: string = "2023-04-06T14:00:00Z";
    const applyTimezone: boolean = false;
    const calendarName: string = "TestCal";
    const result: LocalEvent = newEvent(constructedApp, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar: calendarName
    });

    expect(result.start.get("hours")).toBe(12);
    expect(result.end.get("hours")).toBe(14);
    expect(result.uid).toBe(`local_${start}`);
    expect(result.description).toBe(description);
    expect(result.location).toBe("");
    expect(result.summary).toBe(title);
    expect(result.created).toBeTruthy();
    expect(result.fullDayEvent).toBeFalsy();
    expect(result.skipTZ).toBeTruthy();
    expect(result.freeBusy).toBe(undefined);
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBeTruthy();
    expect(result.calendar).toBe(calendarName);
  });

  test("Returns correct object when 'applyTimezone' is true", () => {
    const title: string = "Test2";
    const description: string = "Test2Desc";
    const start: string = "2023-04-06T12:00:00";
    const end: string = "2023-04-06T14:00:00";
    const applyTimezone: boolean = true;
    const calendarName: string = "TestCal";
    const result: LocalEvent = newEvent(constructedApp, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar: calendarName
    });

    // TODO: Commented out until luxon migration is done
    /*expect(result.start.get("hours")).toBe(14);
    expect(result.end.get("hours")).toBe(16);*/
    expect(result.uid).toBe(`local_${start}`);
    expect(result.description).toBe(description);
    expect(result.location).toBe("");
    expect(result.summary).toBe(title);
    expect(result.created).toBeTruthy();
    expect(result.fullDayEvent).toBeFalsy();
    expect(result.skipTZ).toBeFalsy();
    expect(result.freeBusy).toBe(undefined);
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBeTruthy();
    expect(result.calendar).toBe(calendarName);
  });
});
