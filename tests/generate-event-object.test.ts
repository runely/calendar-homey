import { DateTime } from "luxon";
import type { VEvent } from "node-ical";

import { createDateWithTimeZone, fromEvent, newLocalEvent } from "../lib/generate-event-object.js";
import { getZonedDateTime } from "../lib/luxon-fns";

import type { ArgumentAutoCompleteResult } from "../types/Homey.type";
import type { CalendarEvent, LocalEvent } from "../types/IcalCalendar.type";

import { constructedApp } from "./lib/construct-app";

const timezone: string = "Europe/Oslo";

const utcEvent: VEvent = {
  class: "PUBLIC",
  completion: "",
  dtstamp: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z"), undefined),
  exdate: undefined,
  geo: undefined,
  lastmodified: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z"), undefined),
  method: "PUBLISH",
  sequence: "",
  transparency: "OPAQUE",
  organizer: "CN=Balle",
  recurrenceid: undefined,
  params: [],
  type: "VEVENT",
  url: "",
  start: createDateWithTimeZone(new Date("2021-11-05T20:00:00.000Z"), undefined),
  datetype: "date-time",
  end: createDateWithTimeZone(new Date("2021-11-05T21:00:00.000Z"), undefined),
  uid: "cal_one_One",
  description: "OneDesc",
  location: "",
  summary: "One",
  created: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z"), undefined),
  // @ts-expect-error - This is actually on the object, but the exported types are missing it...
  "MICROSOFT-CDO-BUSYSTATUS": "WORKINGELSEWHERE"
};

const tzEvent: VEvent = {
  class: "PUBLIC",
  completion: "",
  dtstamp: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z"), undefined),
  exdate: undefined,
  geo: undefined,
  lastmodified: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z"), undefined),
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
  created: createDateWithTimeZone(new Date("2021-11-05T18:00:00.000Z"), undefined),
  // @ts-expect-error - This is actually on the object, but the exported types are missing it...
  "X-MICROSOFT-CDO-BUSYSTATUS": "BUSY"
};

describe("fromEvent", () => {
  test("Returns correct object when event is UTC", () => {
    const result: CalendarEvent = fromEvent(
      constructedApp,
      getZonedDateTime(
        DateTime.fromJSDate(utcEvent.start, { zone: utcEvent.start.tz || "utc" }),
        utcEvent.start.tz || "utc"
      ),
      getZonedDateTime(DateTime.fromJSDate(utcEvent.end, { zone: utcEvent.end.tz || "utc" }), utcEvent.end.tz || "utc"),
      timezone,
      utcEvent
    );

    expect(result.fullDayEvent).toBe(false);
    expect(result.freeBusy).toBe("WORKINGELSEWHERE");
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBe(false);
  });

  test("Returns correct object when event has TZ", () => {
    const result: CalendarEvent = fromEvent(
      constructedApp,
      getZonedDateTime(
        DateTime.fromJSDate(tzEvent.start, { zone: tzEvent.start.tz || "utc" }),
        tzEvent.start.tz || "utc"
      ),
      getZonedDateTime(DateTime.fromJSDate(tzEvent.end, { zone: tzEvent.end.tz || "utc" }), tzEvent.end.tz || "utc"),
      timezone,
      tzEvent
    );

    expect(result.fullDayEvent).toBe(false);
    expect(result.freeBusy).toBe("BUSY");
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBe(false);
  });
});

describe("newLocalEvent", () => {
  test("Returns correct object when 'applyTimezone' is false", () => {
    const title: string = "Test1";
    const description: string = "TestDesc";
    const start: string = "2023-04-06T12:00:00Z";
    const end: string = "2023-04-06T14:00:00Z";
    const applyTimezone: boolean = false;
    const calendar: ArgumentAutoCompleteResult = { id: "This has no effect here", name: "TestCal" };

    const dummyUid: string = `local_${getZonedDateTime(DateTime.now(), timezone).toFormat("dd.MM.yy_HH:mm:ss")}.`;

    const result: LocalEvent | null = newLocalEvent(constructedApp, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar
    });

    if (!result) {
      expect(result).not.toBeNull();
      throw new Error("Result is null");
    }

    expect(result.start.hour).toBe(12);
    expect(result.end.hour).toBe(14);
    expect(result.uid.startsWith(dummyUid)).toBeTruthy();
    expect(result.description).toBe(description);
    expect(result.location).toBe("");
    expect(result.summary).toBe(title);
    expect(result.created).toBeTruthy();
    expect(result.fullDayEvent).toBeFalsy();
    expect(result.freeBusy).toBe(undefined);
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBeTruthy();
    expect(result.calendar).toBe(calendar.name);
  });

  test("Returns correct object when 'applyTimezone' is true", () => {
    const title: string = "Test2";
    const description: string = "Test2Desc";
    const start: string = "2023-04-06T12:00:00";
    const end: string = "2023-04-06T14:00:00";
    const applyTimezone: boolean = true;
    const calendar: ArgumentAutoCompleteResult = { id: "This has no effect here", name: "TestCal" };

    const dummyUid: string = `local_${getZonedDateTime(DateTime.now(), timezone).toFormat("dd.MM.yy_HH:mm:ss")}.`;

    const result: LocalEvent | null = newLocalEvent(constructedApp, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar
    });

    if (!result) {
      expect(result).not.toBeNull();
      throw new Error("Result is null");
    }

    expect(result.start.hour).toBe(14);
    expect(result.end.hour).toBe(16);
    expect(result.uid.startsWith(dummyUid)).toBeTruthy();
    expect(result.description).toBe(description);
    expect(result.location).toBe("");
    expect(result.summary).toBe(title);
    expect(result.created).toBeTruthy();
    expect(result.fullDayEvent).toBeFalsy();
    expect(result.freeBusy).toBe(undefined);
    expect(result.meetingUrl).toBe(undefined);
    expect(result.local).toBeTruthy();
    expect(result.calendar).toBe(calendar.name);
  });

  test("Two local events with the same start time have different UIDs", () => {
    const title: string = "Test1";
    const description: string = "TestDesc";
    const start: string = "2023-04-06T12:00:00Z";
    const end: string = "2023-04-06T14:00:00Z";
    const applyTimezone: boolean = false;
    const calendar: ArgumentAutoCompleteResult = { id: "This has no effect here", name: "TestCal" };

    const dummyUid: string = `local_${getZonedDateTime(DateTime.now(), timezone).toFormat("dd.MM.yy_HH:mm:ss")}.`;

    const localEventOne: LocalEvent | null = newLocalEvent(constructedApp, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar
    });

    if (!localEventOne) {
      expect(localEventOne).not.toBeNull();
      throw new Error("Result is null");
    }

    const localEventTwo: LocalEvent | null = newLocalEvent(constructedApp, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar
    });

    if (!localEventTwo) {
      expect(localEventTwo).not.toBeNull();
      throw new Error("Result is null");
    }

    expect(localEventOne.uid).not.toBe(localEventTwo.uid);
    expect(localEventOne.uid.startsWith(dummyUid)).toBeTruthy();
    expect(localEventTwo.uid.startsWith(dummyUid)).toBeTruthy();
  });
});
