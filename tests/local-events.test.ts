import { DateTime } from "luxon";

import { getLocalActiveEvents, getLocalEvents, saveLocalEvents } from "../lib/local-events.js";
import { getZonedDateTime } from "../lib/luxon-fns";
import { varMgmt } from "../lib/variable-management";

import type { LocalEvent, LocalJsonEvent } from "../types/IcalCalendar.type";
import type { GetLocalActiveEventsOptions } from "../types/Options.type";

import { constructedApp } from "./lib/construct-app.js";

constructedApp.homey.settings.set = jest.fn();

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
    if (!("mock" in constructedApp.homey.settings.set)) {
      throw new Error("settings.set is not mocked");
    }

    saveLocalEvents(constructedApp, varMgmt, []);

    expect(constructedApp.homey.settings.set.mock.calls).toHaveLength(0);
  });

  test("Does save when 'events' is an array", () => {
    if (!("mock" in constructedApp.homey.settings.set)) {
      throw new Error("settings.set is not mocked");
    }

    saveLocalEvents(constructedApp, varMgmt, events);

    expect(constructedApp.homey.settings.set.mock.calls).toHaveLength(1);
  });
});

describe("getLocalActiveEvents", () => {
  test("Returns 2 events", () => {
    const result: LocalEvent[] = getLocalActiveEvents(options);
    const three: LocalEvent | undefined = result.find((event: LocalEvent) => event.summary === "Three");
    const four: LocalEvent | undefined = result.find((event: LocalEvent) => event.summary === "Four");

    expect(result.length).toBe(2);
    expect(three).toBeTruthy();
    expect(four).toBeTruthy();
  });

  test("Returns 2 events when events passed in is ongoing", () => {
    //console.log('ongoingEvents:', ongoingEvents)
    const result: LocalEvent[] = getLocalActiveEvents({ ...options, events: ongoingEvents });

    expect(result.length).toBe(2);
  });

  test("Returns empty array when no events passed in", () => {
    const result: LocalEvent[] = getLocalActiveEvents({ ...options, events: [] });

    expect(result.length).toBe(0);
  });

  test("Returns empty array when events passed in isn't within eventLimit", () => {
    const result: LocalEvent[] = getLocalActiveEvents({
      ...options,
      eventLimit: { value: "2", type: "days" }
    });

    expect(result.length).toBe(0);
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

    expect(localJsonEvents.length).toBe(2);
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

    expect(localJsonEvents.length).toBe(2);
    expect(localJsonEvents.every((event: LocalJsonEvent) => !("datetype" in event))).toBe(true);
    expect(localJsonEvents.every((event: LocalJsonEvent) => !("skipTZ" in event))).toBe(true);
    expect(localJsonEvents.every((event: LocalJsonEvent) => !("freebusy" in event))).toBe(true);

    // NOTE: Event at index 0 should be converted from 20:00:00.000Z to 21:00:00.000Z and then saved back to 20:00:00.000Z (in UTC)
    expect(localJsonEvents[0].start).toBe("2021-11-05T20:00:00.000Z");
    expect(localJsonEvents[0].end).toBe("2021-11-05T21:00:00.000Z");
    expect(localJsonEvents[0].dateType).toBe("date-time");
    expect(localJsonEvents[0].freeBusy).toBeNull();

    // NOTE: Event at index 1 should stay as 20:00:00.000Z and saved back as 19:00:00.000Z (in UTC)
    expect(localJsonEvents[1].start).toBe("2021-11-06T19:00:00.000Z");
    expect(localJsonEvents[1].end).toBe("2021-11-06T20:00:00.000Z");
    expect(localJsonEvents[1].dateType).toBe("date-time");
    expect(localJsonEvents[1].freeBusy).toBe("BUSY");
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

    expect(localJsonEvents.length).toBe(3);
    expect(localJsonEvents.every((event: LocalJsonEvent) => !("datetype" in event))).toBe(true);
    expect(localJsonEvents.every((event: LocalJsonEvent) => !("skipTZ" in event))).toBe(true);
    expect(localJsonEvents.every((event: LocalJsonEvent) => !("freebusy" in event))).toBe(true);

    // NOTE: Event at index 0 should have no changes since it was already in new format
    expect(localJsonEvents[0].start).toBe("2021-11-05T20:00:00.000Z");
    expect(localJsonEvents[0].end).toBe("2021-11-05T21:00:00.000Z");
    expect(localJsonEvents[0].dateType).toBe("date-time");
    expect(localJsonEvents[0].freeBusy).toBeUndefined();

    // NOTE: Event at index 1 should be converted from 20:00:00.000Z to 21:00:00.000Z and then saved back to 20:00:00.000Z (in UTC)
    expect(localJsonEvents[1].start).toBe("2021-11-06T20:00:00.000Z");
    expect(localJsonEvents[1].end).toBe("2021-11-06T21:00:00.000Z");
    expect(localJsonEvents[1].dateType).toBe("date-time");
    expect(localJsonEvents[1].freeBusy).toBeNull();

    // NOTE: Event at index 2 should stay as 20:00:00.000Z and saved back as 19:00:00.000Z (in UTC)
    expect(localJsonEvents[2].start).toBe("2021-11-06T19:00:00.000Z");
    expect(localJsonEvents[2].end).toBe("2021-11-06T20:00:00.000Z");
    expect(localJsonEvents[2].dateType).toBe("date-time");
    expect(localJsonEvents[2].freeBusy).toBeNull();
  });
});
