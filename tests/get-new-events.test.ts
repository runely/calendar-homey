import { DateTime } from "luxon";

import { getNewEvents } from "../lib/get-new-events.js";

import type { Calendar, CalendarEventExtended, CalendarEventUid } from "../types/IcalCalendar.type";

import { constructedApp } from "./lib/construct-app.js";

const calendarsEvents: Calendar[] = [
  {
    name: "events",
    events: [
      {
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
      },
      {
        start: DateTime.now().minus({ hour: 1 }),
        dateType: "date-time",
        end: DateTime.now(),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "stopNow",
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
        start: DateTime.now().plus({ hour: 2 }),
        dateType: "date-time",
        end: DateTime.now().plus({ hour: 3 }),
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
        start: DateTime.now().minus({ hour: 2 }),
        dateType: "date-time",
        end: DateTime.now().minus({ hour: 1 }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8844",
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
        start: DateTime.now().minus({ hour: 4 }),
        dateType: "date-time",
        end: DateTime.now().minus({ hour: 2 }),
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
        created: DateTime.now().minus({ hour: 8 }),
        start: DateTime.now().minus({ hour: 4 }),
        dateType: "date-time",
        end: DateTime.now().minus({ hour: 2 }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8846",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        created: DateTime.now().minus({ hour: 28 }),
        start: DateTime.now().minus({ hour: 4 }),
        dateType: "date-time",
        end: DateTime.now().minus({ hour: 2 }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8847",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      }
    ]
  }
];

const oldCalendarsUids: CalendarEventUid[] = [
  {
    calendar: "events",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8841"
  },
  {
    calendar: "events",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8842"
  },
  {
    calendar: "events2",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8843"
  },
  {
    calendar: "events2",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8844"
  }
];

test("When 0 new events - Will return an empty array", () => {
  const result: CalendarEventExtended[] = getNewEvents({
    timezone: "UTC",
    oldCalendarsUids,
    newCalendarsUids: [],
    calendarsEvents,
    app: constructedApp
  });
  expect(result.length).toBe(0);
});

test("When 0 old events - Will return an empty array", () => {
  const result: CalendarEventExtended[] = getNewEvents({
    timezone: "UTC",
    oldCalendarsUids: [],
    newCalendarsUids: [],
    calendarsEvents,
    app: constructedApp
  });
  expect(result.length).toBe(0);
});

test('When 1 new event, but "created" property is missing - Will return 0 events', () => {
  const calendarsUids: CalendarEventUid = {
    calendar: "events2",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8845"
  };

  const result: CalendarEventExtended[] = getNewEvents({
    timezone: "UTC",
    oldCalendarsUids,
    newCalendarsUids: [calendarsUids],
    calendarsEvents,
    app: constructedApp
  });

  expect(result.length).toBe(0);
});

test('When 1 new event, and "created" is more then last 24 hours - Will return 0 event', () => {
  const calendarsUids: CalendarEventUid = {
    calendar: "events2",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8847"
  };

  const result: CalendarEventExtended[] = getNewEvents({
    timezone: "UTC",
    oldCalendarsUids,
    newCalendarsUids: [calendarsUids],
    calendarsEvents,
    app: constructedApp
  });

  expect(result.length).toBe(0);
});

test('When 1 new event, and "created" is within the last 24 hours - Will return 1 event', () => {
  const calendarsUids: CalendarEventUid = {
    calendar: "events2",
    uid: "F7177A32-DBD4-46A9-85C7-669749EA8846"
  };

  const result: CalendarEventExtended[] = getNewEvents({
    timezone: "UTC",
    oldCalendarsUids,
    newCalendarsUids: [calendarsUids],
    calendarsEvents,
    app: constructedApp
  });

  expect(result.length).toBe(1);
  expect(result[0].calendarName).toBe(calendarsUids.calendar);
  expect(result[0].uid).toBe(calendarsUids.uid);
});
