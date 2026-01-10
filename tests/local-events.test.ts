import { getLocalActiveEvents, saveLocalEvents } from "../lib/local-events.js";
import { getMoment } from "../lib/moment-datetime.js";
import { varMgmt } from "../lib/variable-management";

import type { GetLocalActiveEventsOptions } from "../types/Options.type";
import type { VariableManagementLocalEvent, VariableManagementLocalJsonEvent } from "../types/VariableMgmt.type";

import { constructedApp } from "./lib/construct-app.js";

constructedApp.homey.settings.set = jest.fn();

const events: VariableManagementLocalEvent[] = [
  {
    start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
    dateType: "date-time",
    end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
    uid: "cal_one_One",
    description: "One",
    location: "",
    summary: "One",
    created: undefined,
    fullDayEvent: false,
    skipTZ: true,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: false,
    calendar: ""
  },
  {
    start: getMoment({ date: "2021-11-06T20:00:00.000Z" }),
    dateType: "date-time",
    end: getMoment({ date: "2021-11-06T21:00:00.000Z" }),
    uid: "cal_one_Two",
    description: "Two",
    location: "",
    summary: "Two",
    created: undefined,
    fullDayEvent: false,
    skipTZ: true,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: false,
    calendar: ""
  }
];

const localEvents: VariableManagementLocalJsonEvent[] = [
  {
    start: "2021-11-05T20:00:00.000Z",
    dateType: "date-time",
    end: "2021-11-05T21:00:00.000Z",
    uid: "cal_one_One",
    description: "One",
    location: "",
    summary: "One",
    created: "2021-11-05T18:00:00.000Z",
    skipTZ: false,
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
    skipTZ: false,
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: getMoment().add(7, "days").toISOString(),
    dateType: "date-time",
    end: getMoment().add(7, "days").add(2, "hours").toISOString(),
    uid: "cal_one_Three",
    description: "Three",
    location: "",
    summary: "Three",
    created: "2021-11-05T18:00:00.000Z",
    skipTZ: true,
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: getMoment({ timezone: "Europe/Oslo" }).add(7, "days").toISOString(),
    dateType: "date-time",
    end: getMoment({ timezone: "Europe/Oslo" }).add(7, "days").add(2, "hours").toISOString(),
    uid: "cal_one_Four",
    description: "Four",
    location: "",
    summary: "Four",
    created: "2021-11-05T18:00:00.000Z",
    skipTZ: false,
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: getMoment().add(365, "days").toISOString(),
    dateType: "date-time",
    end: getMoment().add(365, "days").add(2, "hours").toISOString(),
    uid: "cal_one_Five",
    description: "Five",
    location: "",
    summary: "Five",
    created: "2021-11-05T18:00:00.000Z",
    skipTZ: true,
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  }
];

const ongoingEvents: VariableManagementLocalJsonEvent[] = [
  {
    start: getMoment({ timezone: "Europe/Oslo" }).subtract(1, "days").toISOString(),
    dateType: "date-time",
    end: getMoment({ timezone: "Europe/Oslo" }).add(2, "days").add(2, "hours").toISOString(),
    uid: "cal_one_One",
    description: "One",
    location: "",
    summary: "One",
    created: "2021-11-05T18:00:00.000Z",
    skipTZ: false,
    fullDayEvent: false,
    freeBusy: undefined,
    meetingUrl: undefined,
    local: true,
    calendar: ""
  },
  {
    start: getMoment({ timezone: "Europe/Oslo" }).subtract(2, "days").toISOString(),
    dateType: "date-time",
    end: getMoment({ timezone: "Europe/Oslo" }).add(7, "days").add(2, "hours").toISOString(),
    uid: "cal_one_Two",
    description: "Two",
    location: "",
    summary: "Two",
    created: "2021-11-05T18:00:00.000Z",
    skipTZ: false,
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
    const result: VariableManagementLocalEvent[] = getLocalActiveEvents(options);
    const three: VariableManagementLocalEvent | undefined = result.find(
      (event: VariableManagementLocalEvent) => event.summary === "Three"
    );
    const four: VariableManagementLocalEvent | undefined = result.find(
      (event: VariableManagementLocalEvent) => event.summary === "Four"
    );

    expect(result.length).toBe(2);
    expect(three).toBeTruthy();
    expect(three?.start.isUtcOffset()).toBeFalsy();
    expect(four).toBeTruthy();
    expect(four?.start.isUtcOffset()).toBeTruthy();
  });

  test("Returns 2 events when events passed in is ongoing", () => {
    //console.log('ongoingEvents:', ongoingEvents)
    const result: VariableManagementLocalEvent[] = getLocalActiveEvents({ ...options, events: ongoingEvents });

    expect(result.length).toBe(2);
  });

  test("Returns empty array when no events passed in", () => {
    const result: VariableManagementLocalEvent[] = getLocalActiveEvents({ ...options, events: [] });

    expect(result.length).toBe(0);
  });

  test("Returns empty array when events passed in isn't within eventLimit", () => {
    const result: VariableManagementLocalEvent[] = getLocalActiveEvents({
      ...options,
      eventLimit: { value: "2", type: "days" }
    });

    expect(result.length).toBe(0);
  });
});
