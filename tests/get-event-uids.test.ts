import { DateTime } from "luxon";

import { getEventUids } from "../lib/get-event-uids.js";
import { getZonedDateTime } from "../lib/luxon-fns";

import type { Calendar, CalendarEventUid } from "../types/IcalCalendar.type";

const calendars: Calendar[] = [
  {
    name: "events",
    events: [
      {
        start: getZonedDateTime(DateTime.fromISO("2021-11-05T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2021-11-05T21:00:00.000Z"), "utc"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
        description: "Desc",
        location: "",
        summary: "Past",
        fullDayEvent: false,
        local: false
      },
      {
        start: getZonedDateTime(DateTime.fromISO("2041-11-05T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2041-11-05T21:00:00.000Z"), "utc"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        local: false
      }
    ]
  },
  {
    name: "events2",
    events: [
      {
        start: getZonedDateTime(DateTime.fromISO("2040-11-05T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2040-11-05T21:00:00.000Z"), "utc"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
        description: "Desc",
        location: "",
        summary: "Future2",
        fullDayEvent: false,
        local: false
      },
      {
        start: getZonedDateTime(DateTime.fromISO("2041-11-05T20:00:00.000Z"), "utc"),
        dateType: "date-time",
        end: getZonedDateTime(DateTime.fromISO("2041-11-05T21:00:00.000Z"), "utc"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        local: false
      }
    ]
  }
];

test("No calendars returns an empty array", () => {
  const result: CalendarEventUid[] = getEventUids([]);
  expect(result.length).toBe(0);
});

test("Will return only unique uids", () => {
  const result: CalendarEventUid[] = getEventUids(calendars);
  expect(result.length).toBe(3);
});
