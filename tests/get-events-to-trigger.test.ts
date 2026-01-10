import { getEventsToTrigger } from "../lib/get-events-to-trigger.js";
import { getMoment } from "../lib/moment-datetime";
import type { TriggerEvent } from "../types/IcalCalendar.type";

import type { Calendar } from "../types/VariableMgmt.type";
import { constructedApp } from "./lib/construct-app";

const calendars: Calendar[] = [
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
      }
    ]
  }
];

const calendarResult: TriggerEvent[] = getEventsToTrigger(constructedApp, calendars, "UTC");

test("No calendars will return an empty array", () => {
  const result: TriggerEvent[] = getEventsToTrigger(constructedApp, [], "UTC");
  expect(result.length).toBe(0);
});

test("When start is now - Will return 3 events", () => {
  const result: TriggerEvent[] = calendarResult.filter(
    (res: TriggerEvent) => res.event.uid === "F7177A32-DBD4-46A9-85C7-669749EA8841"
  );
  expect(result.length).toBe(3);
  expect(result[0].triggerId).toBe("event_starts");
  expect(result[0].state).toBeFalsy();
  expect(result[1].triggerId).toBe("event_starts_calendar");
  expect(result[1].state).toBeTruthy();
  expect(result[1].state?.calendarName).toBe("events");
  expect(result[2].triggerId).toBe("event_stops_in");
  expect(result[2].state).toBeTruthy();
  expect(result[2].state?.when).toBe(60);
});

test("When end is now - Will return 2 events", () => {
  const result: TriggerEvent[] = calendarResult.filter(
    (res: TriggerEvent) => res.event.uid === "F7177A32-DBD4-46A9-85C7-669749EA8842"
  );
  expect(result.length).toBe(2);
  expect(result[0].triggerId).toBe("event_stops");
  expect(result[0].state).toBeFalsy();
  expect(result[1].triggerId).toBe("event_stops_calendar");
  expect(result[1].state).toBeTruthy();
  expect(result[1].state?.calendarName).toBe("events");
});

test("When start is in 2 hours - Will return 2 events", () => {
  const result: TriggerEvent[] = calendarResult.filter(
    (res: TriggerEvent) => res.event.uid === "F7177A32-DBD4-46A9-85C7-669749EA8843"
  );
  expect(result.length).toBe(2);
  expect(result[0].triggerId).toBe("event_starts_in");
  expect(result[0].state).toBeTruthy();
  expect(result[0].state?.when).toBe(120);
  expect(result[1].triggerId).toBe("event_stops_in");
  expect(result[1].state).toBeTruthy();
  expect(result[1].state?.when).toBe(180);
});

test("When start and end has past - Will return 0 events", () => {
  const result: TriggerEvent[] = calendarResult.filter(
    (res: TriggerEvent) => res.event.uid === "F7177A32-DBD4-46A9-85C7-669749EA8844"
  );
  expect(result.length).toBe(0);
});
