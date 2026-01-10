import { getNewEvents } from "../lib/get-new-events.js";
import { getMoment } from "../lib/moment-datetime.js";
import type { Calendar, CalendarEventExtended, CalendarEventUid } from "../types/IcalCalendar.type";
import { constructedApp } from "./lib/construct-app.js";

const calendarsEvents: Calendar[] = [
  {
    name: "events",
    events: [
      {
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
      },
      {
        start: getMoment().subtract(1, "hour"),
        dateType: "date-time",
        end: getMoment(),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "stopNow",
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
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
        start: getMoment().add(2, "hours"),
        dateType: "date-time",
        end: getMoment().add(3, "hours"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
        description: "Desc",
        location: "",
        summary: "Future2",
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getMoment().subtract(2, "hours"),
        dateType: "date-time",
        end: getMoment().subtract(1, "hours"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8844",
        description: "Desc",
        location: "",
        summary: "Future",
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getMoment().subtract(4, "hours"),
        dateType: "date-time",
        end: getMoment().subtract(2, "hours"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8845",
        description: "Desc",
        location: "",
        summary: "Future",
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        created: getMoment().subtract(8, "hours"),
        start: getMoment().subtract(4, "hours"),
        dateType: "date-time",
        end: getMoment().subtract(2, "hours"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8846",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        created: getMoment().subtract(28, "hours"),
        start: getMoment().subtract(4, "hours"),
        dateType: "date-time",
        end: getMoment().subtract(2, "hours"),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8847",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        skipTZ: true,
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
