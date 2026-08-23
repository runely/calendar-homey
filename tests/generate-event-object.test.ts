import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { DateTime } from "luxon";
import type { DateWithTimeZone, VEvent } from "node-ical";

import { createDateWithTimeZone } from "../lib/create-date-with-timezone.js";
import { fromEvent, newLocalEvent } from "../lib/generate-event-object.js";
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
  "X-MICROSOFT-CDO-BUSYSTATUS": "BUSY"
};

describe("fromEvent", () => {
  test("Returns correct object when event is UTC", () => {
    const eventEnd: DateWithTimeZone = utcEvent.end ?? utcEvent.start;

    const result: CalendarEvent = fromEvent(
      constructedApp,
      utcEvent,
      getZonedDateTime(
        DateTime.fromJSDate(utcEvent.start, { zone: utcEvent.start.tz || "utc" }),
        utcEvent.start.tz || "utc"
      ),
      getZonedDateTime(DateTime.fromJSDate(eventEnd, { zone: eventEnd.tz || "utc" }), eventEnd.tz || "utc"),
      timezone,
      utcEvent.uid,
      utcEvent.datetype === "date"
    );

    assert.strictEqual(result.fullDayEvent, false);
    assert.strictEqual(result.freeBusy, "WORKINGELSEWHERE");
    assert.strictEqual(result.meetingUrl, undefined);
    assert.strictEqual(result.local, false);
  });

  test("Returns correct object when event has TZ", () => {
    const eventEnd: DateWithTimeZone = tzEvent.end ?? tzEvent.start;

    const result: CalendarEvent = fromEvent(
      constructedApp,
      tzEvent,
      getZonedDateTime(
        DateTime.fromJSDate(tzEvent.start, { zone: tzEvent.start.tz || "utc" }),
        tzEvent.start.tz || "utc"
      ),
      getZonedDateTime(DateTime.fromJSDate(eventEnd, { zone: eventEnd.tz || "utc" }), eventEnd.tz || "utc"),
      timezone,
      tzEvent.uid,
      tzEvent.datetype === "date"
    );

    assert.strictEqual(result.fullDayEvent, false);
    assert.strictEqual(result.freeBusy, "BUSY");
    assert.strictEqual(result.meetingUrl, undefined);
    assert.strictEqual(result.local, false);
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
      assert.ok(result !== null);
      throw new Error("Result is null");
    }

    assert.strictEqual(result.start.hour, 12);
    assert.strictEqual(result.end.hour, 14);
    assert.ok(result.uid.startsWith(dummyUid));
    assert.strictEqual(result.description, description);
    assert.strictEqual(result.location, "");
    assert.strictEqual(result.summary, title);
    assert.ok(result.created);
    assert.ok(!result.fullDayEvent);
    assert.strictEqual(result.freeBusy, undefined);
    assert.strictEqual(result.meetingUrl, undefined);
    assert.ok(result.local);
    assert.strictEqual(result.calendar, calendar.name);
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
      assert.ok(result !== null);
      throw new Error("Result is null");
    }

    assert.strictEqual(result.start.hour, 14);
    assert.strictEqual(result.end.hour, 16);
    assert.ok(result.uid.startsWith(dummyUid));
    assert.strictEqual(result.description, description);
    assert.strictEqual(result.location, "");
    assert.strictEqual(result.summary, title);
    assert.ok(result.created);
    assert.ok(!result.fullDayEvent);
    assert.strictEqual(result.freeBusy, undefined);
    assert.strictEqual(result.meetingUrl, undefined);
    assert.ok(result.local);
    assert.strictEqual(result.calendar, calendar.name);
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
      assert.ok(localEventOne !== null);
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
      assert.ok(localEventTwo !== null);
      throw new Error("Result is null");
    }

    assert.notStrictEqual(localEventOne.uid, localEventTwo.uid);
    assert.ok(localEventOne.uid.startsWith(dummyUid));
    assert.ok(localEventTwo.uid.startsWith(dummyUid));
  });
});
