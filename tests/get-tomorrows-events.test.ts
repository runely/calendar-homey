import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { DateTime } from "luxon";

import { getEventsTomorrow } from "../lib/get-tomorrows-events.js";
import { getZonedDateTime } from "../lib/luxon-fns";

import type { Calendar, CalendarEventExtended } from "../types/IcalCalendar.type";

const timezone: string = "UTC";

const expectedStart: string = getZonedDateTime(DateTime.now(), timezone)
  .plus({ day: 1 })
  .set({ hour: 23, minute: 58, second: 59 })
  .toISO();
const expectedEnd: string = getZonedDateTime(DateTime.now(), timezone)
  .plus({ day: 1 })
  .set({ hour: 23, minute: 59, second: 59 })
  .toISO();

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
      },
      {
        start: getZonedDateTime(DateTime.fromISO(expectedStart), timezone),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO(expectedEnd), timezone),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
        description: "Desc",
        location: "",
        summary: "Today1",
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
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8844",
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
        start: getZonedDateTime(DateTime.fromISO("2041-11-05T20:00:00.000Z"), timezone),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2041-11-05T21:00:00.000Z"), timezone),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8845",
        description: "Desc",
        location: "",
        summary: "Future",
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
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8846",
        description: "Desc",
        location: "",
        summary: "Today2",
        created: undefined,
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      }
    ]
  }
];

describe("Tomorrows event count is", () => {
  test("2 when 'specificCalendarName' is NOT given", () => {
    const tomorrowsEvents: CalendarEventExtended[] = getEventsTomorrow(timezone, calendars);

    assert.strictEqual(tomorrowsEvents.length, 2);
    assert.strictEqual(tomorrowsEvents[0].start.toISO(), expectedStart);
    assert.strictEqual(tomorrowsEvents[0].end.toISO(), expectedEnd);
    assert.strictEqual(tomorrowsEvents[0].summary, "Today1");
    assert.strictEqual(tomorrowsEvents[0].calendarName, "events");
    assert.strictEqual(tomorrowsEvents[1].start.toISO(), expectedStart);
    assert.strictEqual(tomorrowsEvents[1].end.toISO(), expectedEnd);
    assert.strictEqual(tomorrowsEvents[1].summary, "Today2");
    assert.strictEqual(tomorrowsEvents[1].calendarName, "events2");
  });

  test("1 when 'specificCalendarName' IS given", () => {
    const tomorrowsEvents: CalendarEventExtended[] = getEventsTomorrow(timezone, calendars, "events2");

    assert.strictEqual(tomorrowsEvents.length, 1);
    assert.strictEqual(tomorrowsEvents[0].start.toISO(), expectedStart);
    assert.strictEqual(tomorrowsEvents[0].end.toISO(), expectedEnd);
    assert.strictEqual(tomorrowsEvents[0].summary, "Today2");
    assert.strictEqual(tomorrowsEvents[0].calendarName, "events2");
  });
});
