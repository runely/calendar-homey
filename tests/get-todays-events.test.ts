import { DateTime } from "luxon";

import { getEventsToday } from "../lib/get-todays-events.js";
import { getZonedDateTime } from "../lib/luxon-fns";

import type { Calendar, CalendarEventExtended } from "../types/IcalCalendar.type";

const timezone: string = "UTC";

const expectedStart: string = getZonedDateTime(DateTime.now(), timezone)
  .set({ hour: 23, minute: 58, second: 59 })
  .toISO();
const expectedEnd: string = getZonedDateTime(DateTime.now(), timezone)
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

describe("Today's event count is", () => {
  test("2 when 'specificCalendarName' is NOT given", () => {
    const eventsToday: CalendarEventExtended[] = getEventsToday(timezone, calendars);

    expect(eventsToday.length).toBe(2);
    expect(eventsToday[0].start.toISO()).toBe(expectedStart);
    expect(eventsToday[0].end.toISO()).toBe(expectedEnd);
    expect(eventsToday[0].summary).toBe("Today1");
    expect(eventsToday[0].calendarName).toBe("events");
    expect(eventsToday[1].start.toISO()).toBe(expectedStart);
    expect(eventsToday[1].end.toISO()).toBe(expectedEnd);
    expect(eventsToday[1].summary).toBe("Today2");
    expect(eventsToday[1].calendarName).toBe("events2");
  });

  test("1 when 'specificCalendarName' IS given", () => {
    const eventsToday: CalendarEventExtended[] = getEventsToday(timezone, calendars, "events2");

    expect(eventsToday.length).toBe(1);
    expect(eventsToday[0].start.toISO()).toBe(expectedStart);
    expect(eventsToday[0].end.toISO()).toBe(expectedEnd);
    expect(eventsToday[0].summary).toBe("Today2");
    expect(eventsToday[0].calendarName).toBe("events2");
  });
});
