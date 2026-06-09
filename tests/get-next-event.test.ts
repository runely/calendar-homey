import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { DateTime } from "luxon";

import { getNextEvent } from "../lib/get-next-event.js";
import { getZonedDateTime } from "../lib/luxon-fns";

import type { Calendar, NextEvent } from "../types/IcalCalendar.type";

const timezone: string = "UTC";

const addHours = (hour: number): string => getZonedDateTime(DateTime.now(), timezone).plus({ hour }).toISO();

const expectedStart: string = addHours(1);
const expectedEnd: string = addHours(2);
const expectedFutureStart: string = "2041-11-05T20:00:00.000Z";
const expectedFutureEnd: string = "2041-11-05T21:00:00.000Z";

const calendars: Calendar[] = [
  {
    name: "events",
    events: [
      {
        start: getZonedDateTime(DateTime.fromISO("2021-11-05T20:00:00.000Z"), timezone),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2021-11-05T21:00:00.000Z"), timezone),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
        description: "Desc",
        location: "",
        summary: "Past",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getZonedDateTime(DateTime.fromISO("2041-11-05T20:00:00.000Z"), timezone),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2041-11-05T21:00:00.000Z"), timezone),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "Future",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      }
    ]
  },
  {
    name: "events2",
    events: [
      {
        start: getZonedDateTime(DateTime.fromISO("2040-11-05T20:00:00.000Z"), timezone),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2040-11-05T21:00:00.000Z"), timezone),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
        description: "Desc",
        location: "",
        summary: "Future2",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getZonedDateTime(DateTime.fromISO(expectedStart), timezone),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO(expectedEnd), timezone),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8844",
        description: "Desc",
        location: "",
        summary: "next",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      }
    ]
  }
];

describe("Next event has", () => {
  test("expectedStart and expectedEnd when 'specificCalendarName' is NOT given", () => {
    const nextEvent: NextEvent | null = getNextEvent(timezone, calendars);

    assert.ok(nextEvent !== null);
    assert.strictEqual(nextEvent?.event.start.toISO(), expectedStart);
    assert.strictEqual(nextEvent?.event.end.toISO(), expectedEnd);
    assert.strictEqual(nextEvent?.calendarName, "events2");
  });

  test("start and end in year 2041 when 'specificCalendarName' IS given", () => {
    const nextEvent: NextEvent | null = getNextEvent(timezone, calendars, "events");

    assert.ok(nextEvent !== null);
    assert.strictEqual(nextEvent?.event.start.toISO(), expectedFutureStart);
    assert.strictEqual(nextEvent?.event.end.toISO(), expectedFutureEnd);
    assert.strictEqual(nextEvent?.calendarName, "events");
  });
});
