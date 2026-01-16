import nodeIcal, { type CalendarComponent, type CalendarResponse, type VEvent } from "node-ical";

import { getActiveEvents } from "../lib/get-active-events.js";
import { varMgmt } from "../lib/variable-management";
import locale from "../locales/en.json";

import type { CalendarEvent } from "../types/IcalCalendar.type";
import type { SettingEventLimit } from "../types/VariableMgmt.type";

import { constructedApp } from "./lib/construct-app.js";

const data: CalendarResponse = nodeIcal.sync.parseFile("./tests/data/calendar.ics");
const invalidTimezone: CalendarResponse = nodeIcal.sync.parseFile("./tests/data/calendar-invalid-timezone.ics");

const eventLimit: SettingEventLimit = {
  value: "3",
  type: "weeks"
};

constructedApp.homey.__ = () => locale.locale.luxon;
constructedApp.homey.settings.get = () => undefined;

varMgmt.hitCount.data = "";

let activeEvents: CalendarEvent[];
let onceAWeekEvents: CalendarEvent[];
let alwaysOngoingEvents: CalendarEvent[];
let dataNoTzId: CalendarEvent[];

describe("getActiveEvents returns an array", () => {
  beforeAll(async () => {
    activeEvents = await getActiveEvents({
      app: constructedApp,
      variableMgmt: varMgmt,
      timezone: "UTC",
      data,
      eventLimit,
      calendarName: "Test",
      logAllEvents: false
    });

    onceAWeekEvents = activeEvents.filter((event: CalendarEvent) => event.summary === "OnceAWeek");
    alwaysOngoingEvents = activeEvents.filter((event: CalendarEvent) => event.summary === "AlwaysOngoing");
  });

  test("Where all 'OnceAWeek' events has a unique uid", () => {
    expect(
      onceAWeekEvents.filter((event: CalendarEvent) => event.uid === `hidden_${event.start.toISODate()}`).length
    ).toBe(onceAWeekEvents.length);
  });

  test("Where all 'AlwaysOngoing' events has a unique uid", () => {
    expect(
      alwaysOngoingEvents.filter((event: CalendarEvent) => event.uid === `hidden2_${event.start.toISODate()}`).length
    ).toBe(alwaysOngoingEvents.length);
  });
});

describe("getActiveEvents filter out", () => {
  test('Events where "DTSTART" is missing', async () => {
    const dataNoStart: CalendarResponse = nodeIcal.sync.parseFile("./tests/data/calendar-missing-start.ics");
    const activeEvents = await getActiveEvents({
      app: constructedApp,
      variableMgmt: varMgmt,
      timezone: "UTC",
      data: dataNoStart,
      eventLimit,
      calendarName: "Test",
      logAllEvents: false
    });

    expect(Object.values(dataNoStart).filter((event: CalendarComponent) => event.type === "VEVENT").length).toBe(1);
    expect(activeEvents.length).toBe(0);
  });
});

describe('When "DTEND" is missing', () => {
  test('"DTEND" is set to "DTSTART"', () => {
    const dataNoEnd: CalendarResponse = nodeIcal.sync.parseFile("./tests/data/calendar-missing-end.ics");
    const dataNoEndEvent: VEvent = dataNoEnd["noEnd"] as VEvent;
    const { start, end } = dataNoEndEvent;

    expect(start.toISOString()).toBe(end.toISOString());
  });
});

describe('When "SUMMARY" is missing', () => {
  test('"SUMMARY" is undefined', () => {
    const dataNoSummary = nodeIcal.sync.parseFile("./tests/data/calendar-missing-summary.ics");
    const dataNoSummaryEvent: VEvent = dataNoSummary["noSummary"] as VEvent;
    const { summary } = dataNoSummaryEvent;

    expect(summary).toBe(undefined);
  });
});

describe('When "TZID" is missing', () => {
  const localTimeZone: string = "UTC";

  beforeAll(async () => {
    dataNoTzId = await getActiveEvents({
      app: constructedApp,
      variableMgmt: varMgmt,
      timezone: localTimeZone,
      data: nodeIcal.sync.parseFile("./tests/data/calendar-missing-timezone.ics"),
      eventLimit,
      calendarName: "Test",
      logAllEvents: false
    });
  });

  test("on a recurring event, zoneName should be timezone used on system", () => {
    const dataNoTzIdEvent: CalendarEvent | undefined = dataNoTzId.find(
      (event: CalendarEvent) => event.summary === "RecurringNoTzid"
    );

    expect(dataNoTzIdEvent).not.toBeUndefined();
    expect(dataNoTzIdEvent?.start.zoneName).toBe(localTimeZone);
  });

  test("on a regular event, zoneName should be timezone used on system", () => {
    const dataNoTzIdEvent: CalendarEvent | undefined = dataNoTzId.find(
      (event: CalendarEvent) => event.summary === "RegularNoTzid"
    );

    expect(dataNoTzIdEvent).not.toBeUndefined();
    expect(dataNoTzIdEvent?.start.zoneName).toBe(localTimeZone);
  });
});

describe('Invalid timezone should have been replaced by "node-ical"', () => {
  for (const event of Object.values(invalidTimezone)) {
    if (event.type !== "VEVENT") {
      continue;
    }

    test(`"${event.summary}" should have its start TZ replaced from "${event.summary}" to a valid timezone ("${event.start.tz}")`, () => {
      expect(event.start.tz === event.summary).toBeFalsy();
    });

    test(`"${event.summary}" should have its end TZ replaced from "${event.summary}" to a valid timezone ("${event.end.tz}")`, () => {
      expect(event.end.tz === event.summary).toBeFalsy();
    });
  }
});
