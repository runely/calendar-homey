import assert from "node:assert/strict";
import { test } from "node:test";

import { DateTime } from "luxon";

import { getZonedDateTime } from "../lib/luxon-fns";
import { sortCalendarsEvents } from "../lib/sort-calendars.js";

import type { Calendar } from "../types/IcalCalendar.type";

const calendars: Calendar[] = [
  {
    name: "CalendarOne",
    events: [
      {
        start: getZonedDateTime(DateTime.fromISO("2021-11-06T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2021-11-06T21:00:00.000Z"), "utc"),
        uid: "cal_one_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getZonedDateTime(DateTime.fromISO("2021-11-05T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2021-11-05T21:00:00.000Z"), "utc"),
        uid: "cal_one_One",
        description: "One",
        location: "",
        summary: "One",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      }
    ]
  },
  {
    name: "CalendarTwo",
    events: [
      {
        start: getZonedDateTime(DateTime.fromISO("2021-11-06T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2021-11-06T21:00:00.000Z"), "utc"),
        uid: "cal_two_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getZonedDateTime(DateTime.fromISO("2021-11-05T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2021-11-05T21:00:00.000Z"), "utc"),
        uid: "cal_two_One",
        description: "One",
        location: "",
        summary: "One",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      }
    ]
  }
];

test('Calendar events are sorted after "start" datetime', () => {
  const result: Calendar[] = sortCalendarsEvents(calendars);

  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].name, "CalendarOne");
  assert.strictEqual(result[0].events.length, 2);
  assert.strictEqual(result[0].events[0].uid, "cal_one_One");
  assert.strictEqual(result[0].events[1].uid, "cal_one_Two");
  assert.strictEqual(result[1].name, "CalendarTwo");
  assert.strictEqual(result[1].events.length, 2);
  assert.strictEqual(result[1].events[0].uid, "cal_two_One");
  assert.strictEqual(result[1].events[1].uid, "cal_two_Two");
});
