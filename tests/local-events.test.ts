import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { DateTime } from "luxon";

import { getLocalActiveEvents, getLocalEvents, saveLocalEvents } from "../lib/local-events.js";
import { getZonedDateTime } from "../lib/luxon-fns";
import { varMgmt } from "../lib/variable-management";

import type { LocalEvent, LocalJsonEvent } from "../types/IcalCalendar.type";
import type { GetLocalActiveEventsOptions } from "../types/Options.type";

import { constructedApp } from "./lib/construct-app.js";

let settingsSetCallCount = 0;
constructedApp.homey.settings.set = (_path: string, _data: string): void => {
  settingsSetCallCount++;
};

const events: LocalEvent[] = [
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
    local: false,
    calendar: ""
  },
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
    local: false,
    calendar: ""
  }
];

const localEvents: LocalJsonEvent[] = [
  {
    start: "2021-11-05T20:00:00.000Z",
    dateType: "date-time",
    end: "2021-11-05T21:00:00.000Z",
    uid: "cal_one_One",
    description: "One",
    location: "",
    summary: "One",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: "2021-11-06T20:00:00.000Z",
    dateType: "date-time",
    end: "2021-11-06T21:00:00.000Z",
    uid: "cal_one_Two",
    description: "Two",
    location: "",
    summary: "Two",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: DateTime.now().plus({ days: 7 }).toISO(),
    dateType: "date-time",
    end: DateTime.now().plus({ days: 7 }).plus({ hour: 2 }).toISO(),
    uid: "cal_one_Three",
    description: "Three",
    location: "",
    summary: "Three",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: getZonedDateTime(DateTime.now(), "Europe/Oslo").plus({ days: 7 }).toISO(),
    dateType: "date-time",
    end: getZonedDateTime(DateTime.now(), "Europe/Oslo").plus({ days: 7 }).plus({ hour: 2 }).toISO(),
    uid: "cal_one_Four",
    description: "Four",
    location: "",
    summary: "Four",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: DateTime.now().plus({ days: 365 }).toISO(),
    dateType: "date-time",
    end: DateTime.now().plus({ days: 365 }).plus({ hour: 2 }).toISO(),
    uid: "cal_one_Five",
    description: "Five",
    location: "",
    summary: "Five",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  }
];

const ongoingEvents: LocalJsonEvent[] = [
  {
    start: getZonedDateTime(DateTime.now(), "Europe/Oslo").minus({ days: 1 }).toISO(),
    dateType: "date-time",
    end: getZonedDateTime(DateTime.now(), "Europe/Oslo").plus({ days: 2 }).plus({ hour: 2 }).toISO(),
    uid: "cal_one_One",
    description: "One",
    location: "",
    summary: "One",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: getZonedDateTime(DateTime.now(), "Europe/Oslo").minus({ days: 2 }).toISO(),
    dateType: "date-time",
    end: getZonedDateTime(DateTime.now(), "Europe/Oslo").plus({ days: 7 }).plus({ hour: 2 }).toISO(),
    uid: "cal_one_Two",
    description: "Two",
    location: "",
    summary: "Two",
    created: "2021-11-05T18:00:00.000Z",
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  }
];

const options: GetLocalActiveEventsOptions = {
  timezone: "Europe/Oslo",
  events: localEvents,
  eventLimit: {
    value: "3",
    type: "weeks"
  },
  app: constructedApp,
  logAllEvents: true
};

describe("saveLocalEvents", () => {
  test("Does not save when 'events' has no items", () => {
    settingsSetCallCount = 0;
    saveLocalEvents(constructedApp, varMgmt, []);
    assert.strictEqual(settingsSetCallCount, 0);
  });

  test("Does save when 'events' is an array", () => {
    settingsSetCallCount = 0;
    saveLocalEvents(constructedApp, varMgmt, events);
    assert.strictEqual(settingsSetCallCount, 1);
  });
});

describe("getLocalActiveEvents", () => {
  test("Returns 2 events", () => {
    const result: LocalEvent[] = getLocalActiveEvents(options);
    const three: LocalEvent | undefined = result.find((event: LocalEvent) => event.summary === "Three");
    const four: LocalEvent | undefined = result.find((event: LocalEvent) => event.summary === "Four");

    assert.strictEqual(result.length, 2);
    assert.ok(three);
    assert.ok(four);
  });

  test("Returns 2 events when events passed in is ongoing", () => {
    //console.log('ongoingEvents:', ongoingEvents)
    const result: LocalEvent[] = getLocalActiveEvents({ ...options, events: ongoingEvents });

    assert.strictEqual(result.length, 2);
  });

  test("Returns empty array when no events passed in", () => {
    const result: LocalEvent[] = getLocalActiveEvents({ ...options, events: [] });

    assert.strictEqual(result.length, 0);
  });

  test("Returns empty array when events passed in isn't within eventLimit", () => {
    const result: LocalEvent[] = getLocalActiveEvents({
      ...options,
      eventLimit: { value: "2", type: "days" }
    });

    assert.strictEqual(result.length, 0);
  });
});

describe("getLocalEvents", () => {
  test("Returns events with new format without conversion since local events have new format already", () => {
    const eventsWithNewFormat: string = JSON.stringify([
      {
        start: "2021-11-05T20:00:00.000Z",
        dateType: "date-time",
        end: "2021-11-05T21:00:00.000Z",
        uid: "cal_one_One",
        description: "One",
        location: "",
        summary: "One",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: true,
        calendar: ""
      },
      {
        start: "2021-11-06T20:00:00.000Z",
        dateType: "date-time",
        end: "2021-11-06T21:00:00.000Z",
        uid: "cal_one_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: true,
        calendar: ""
      }
    ]);
    const localJsonEvents: LocalJsonEvent[] = getLocalEvents(
      constructedApp,
      eventsWithNewFormat,
      options.timezone,
      true
    );

    assert.strictEqual(localJsonEvents.length, 2);
  });

  test("Returns events with new format with conversion since local events have old format", () => {
    const eventsWithOldFormat: string = JSON.stringify([
      {
        start: "2021-11-05T20:00:00.000Z",
        datetype: "date-time",
        end: "2021-11-05T21:00:00.000Z",
        uid: "cal_one_One",
        description: "One",
        location: "",
        summary: "One",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        skipTZ: false,
        freebusy: "",
        meetingUrl: undefined,
        local: true,
        calendar: ""
      },
      {
        start: "2021-11-06T20:00:00.000Z",
        datetype: "date-time",
        end: "2021-11-06T21:00:00.000Z",
        uid: "cal_one_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        skipTZ: true,
        freebusy: "BUSY",
        meetingUrl: undefined,
        local: true,
        calendar: ""
      }
    ]);
    const localJsonEvents: LocalJsonEvent[] = getLocalEvents(
      constructedApp,
      eventsWithOldFormat,
      options.timezone,
      true
    );

    assert.strictEqual(localJsonEvents.length, 2);
    assert.strictEqual(
      localJsonEvents.every((event: LocalJsonEvent) => !("datetype" in event)),
      true
    );
    assert.strictEqual(
      localJsonEvents.every((event: LocalJsonEvent) => !("skipTZ" in event)),
      true
    );
    assert.strictEqual(
      localJsonEvents.every((event: LocalJsonEvent) => !("freebusy" in event)),
      true
    );

    // NOTE: Event at index 0 should be converted from 20:00:00.000Z to 21:00:00.000Z and then saved back to 20:00:00.000Z (in UTC)
    assert.strictEqual(localJsonEvents[0].start, "2021-11-05T20:00:00.000Z");
    assert.strictEqual(localJsonEvents[0].end, "2021-11-05T21:00:00.000Z");
    assert.strictEqual(localJsonEvents[0].dateType, "date-time");
    assert.strictEqual(localJsonEvents[0].freeBusy, null);

    // NOTE: Event at index 1 should stay as 20:00:00.000Z and saved back as 19:00:00.000Z (in UTC)
    assert.strictEqual(localJsonEvents[1].start, "2021-11-06T19:00:00.000Z");
    assert.strictEqual(localJsonEvents[1].end, "2021-11-06T20:00:00.000Z");
    assert.strictEqual(localJsonEvents[1].dateType, "date-time");
    assert.strictEqual(localJsonEvents[1].freeBusy, "BUSY");
  });

  test("Returns events with new format with conversion on two events since local events have one event with new format and two events with old format", () => {
    const eventsWithNewAndOldFormat: string = JSON.stringify([
      {
        start: "2021-11-05T20:00:00.000Z",
        dateType: "date-time",
        end: "2021-11-05T21:00:00.000Z",
        uid: "cal_one_One",
        description: "One",
        location: "",
        summary: "One",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: true,
        calendar: ""
      },
      {
        start: "2021-11-06T20:00:00.000Z",
        datetype: "date-time",
        end: "2021-11-06T21:00:00.000Z",
        uid: "cal_one_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        skipTZ: false,
        freebusy: "",
        meetingUrl: undefined,
        local: true,
        calendar: ""
      },
      {
        start: "2021-11-06T20:00:00.000Z",
        datetype: "date-time",
        end: "2021-11-06T21:00:00.000Z",
        uid: "cal_one_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: "2021-11-05T18:00:00.000Z",
        fullDayEvent: false,
        skipTZ: true,
        freebusy: "",
        meetingUrl: undefined,
        local: true,
        calendar: ""
      }
    ]);
    const localJsonEvents: LocalJsonEvent[] = getLocalEvents(
      constructedApp,
      eventsWithNewAndOldFormat,
      options.timezone,
      true
    );

    assert.strictEqual(localJsonEvents.length, 3);
    assert.strictEqual(
      localJsonEvents.every((event: LocalJsonEvent) => !("datetype" in event)),
      true
    );
    assert.strictEqual(
      localJsonEvents.every((event: LocalJsonEvent) => !("skipTZ" in event)),
      true
    );
    assert.strictEqual(
      localJsonEvents.every((event: LocalJsonEvent) => !("freebusy" in event)),
      true
    );

    // NOTE: Event at index 0 should have no changes since it was already in new format
    assert.strictEqual(localJsonEvents[0].start, "2021-11-05T20:00:00.000Z");
    assert.strictEqual(localJsonEvents[0].end, "2021-11-05T21:00:00.000Z");
    assert.strictEqual(localJsonEvents[0].dateType, "date-time");
    assert.strictEqual(localJsonEvents[0].freeBusy, undefined);

    // NOTE: Event at index 1 should be converted from 20:00:00.000Z to 21:00:00.000Z and then saved back to 20:00:00.000Z (in UTC)
    assert.strictEqual(localJsonEvents[1].start, "2021-11-06T20:00:00.000Z");
    assert.strictEqual(localJsonEvents[1].end, "2021-11-06T21:00:00.000Z");
    assert.strictEqual(localJsonEvents[1].dateType, "date-time");
    assert.strictEqual(localJsonEvents[1].freeBusy, null);

    // NOTE: Event at index 2 should stay as 20:00:00.000Z and saved back as 19:00:00.000Z (in UTC)
    assert.strictEqual(localJsonEvents[2].start, "2021-11-06T19:00:00.000Z");
    assert.strictEqual(localJsonEvents[2].end, "2021-11-06T20:00:00.000Z");
    assert.strictEqual(localJsonEvents[2].dateType, "date-time");
    assert.strictEqual(localJsonEvents[2].freeBusy, null);
  });
});
