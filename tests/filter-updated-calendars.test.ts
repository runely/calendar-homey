import { filterUpdatedCalendars } from "../lib/filter-updated-calendars.js";
import { getMoment } from "../lib/moment-datetime.js";
import { varMgmt } from "../lib/variable-management";
import locale from "../locales/en.json";
import type { Calendar, VariableManagement } from "../types/VariableMgmt.type";
import { constructedApp } from "./lib/construct-app";

type UpdatedCalendars = {
  [key: string]: Calendar[];
};

const start: string = locale.triggers.event_changed.start;
const end: string = locale.triggers.event_changed.end;
const description: string = locale.triggers.event_changed.description;
const location: string = locale.triggers.event_changed.location;
const summary: string = locale.triggers.event_changed.summary;

const long: string = locale.settings.datetime.date.default;
const time: string = locale.settings.datetime.time.default;

const variableMgmt: VariableManagement = {
  ...varMgmt,
  dateTimeFormat: {
    long,
    short: "MM/DD",
    time
  }
};

constructedApp.homey.__ = (prop: string): string => {
  if (prop.includes("start")) return start;
  if (prop.includes("end")) return end;
  if (prop.includes("description")) return description;
  if (prop.includes("location")) return location;
  if (prop.includes("summary")) return summary;
  return "";
};

const oldCalendars: UpdatedCalendars = {
  nothingChanged: [
    {
      name: "nothingChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
          description: "Desc",
          location: "",
          summary: "Nothing changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  startChanged: [
    {
      name: "startChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
          description: "Desc",
          location: "",
          summary: "Start changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  endChanged: [
    {
      name: "endChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
          description: "Desc",
          location: "",
          summary: "End changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  descriptionChanged: [
    {
      name: "descriptionChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8844",
          description: "Desc",
          location: "",
          summary: "Description changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  locationChanged: [
    {
      name: "locationChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8845",
          description: "Desc",
          location: "",
          summary: "Location changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  summaryChanged: [
    {
      name: "summaryChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8846",
          description: "Desc",
          location: "",
          summary: "Summary changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ]
};

const newCalendars: UpdatedCalendars = {
  nothingChanged: [
    {
      name: "nothingChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
          description: "Desc",
          location: "",
          summary: "Nothing changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  startChanged: [
    {
      name: "startChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T19:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
          description: "Desc",
          location: "",
          summary: "Start changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  endChanged: [
    {
      name: "endChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T22:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
          description: "Desc",
          location: "",
          summary: "End changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  descriptionChanged: [
    {
      name: "descriptionChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8844",
          description: "",
          location: "",
          summary: "Description changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  locationChanged: [
    {
      name: "locationChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8845",
          description: "Desc",
          location: "Loc, 9867 Station",
          summary: "Location changed",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ],
  summaryChanged: [
    {
      name: "summaryChanged",
      events: [
        {
          start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
          dateType: "date-time",
          end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
          uid: "F7177A32-DBD4-46A9-85C7-669749EA8846",
          description: "Desc",
          location: "",
          summary: "Summary changed again",
          fullDayEvent: false,
          skipTZ: true,
          local: false
        }
      ]
    }
  ]
};

describe("Expect 'filterUpdatedCalendars' to return", () => {
  test("An empty array when nothing's changed", () => {
    const eventsChanged: Calendar[] = filterUpdatedCalendars({
      app: constructedApp,
      variableMgmt,
      oldCalendars: oldCalendars.nothingChanged,
      newCalendars: newCalendars.nothingChanged
    });
    expect(Array.isArray(eventsChanged)).toBe(true);
    expect(eventsChanged.length).toBe(0);
  });

  test("'Start' when start has changed", () => {
    const eventsChanged: Calendar[] = filterUpdatedCalendars({
      app: constructedApp,
      variableMgmt,
      oldCalendars: oldCalendars.startChanged,
      newCalendars: newCalendars.startChanged
    });
    expect(eventsChanged.length).toBe(1);
    expect(eventsChanged[0].events.length).toBe(1);
    expect(Array.isArray(eventsChanged[0].events[0].changed)).toBe(true);
    expect(eventsChanged[0].events[0].changed?.length).toBe(1);
    expect(eventsChanged[0].events[0].changed?.[0].type).toBe(start);
  });

  test("'End' when end has changed", () => {
    const eventsChanged: Calendar[] = filterUpdatedCalendars({
      app: constructedApp,
      variableMgmt,
      oldCalendars: oldCalendars.endChanged,
      newCalendars: newCalendars.endChanged
    });
    expect(eventsChanged.length).toBe(1);
    expect(eventsChanged[0].events.length).toBe(1);
    expect(Array.isArray(eventsChanged[0].events[0].changed)).toBe(true);
    expect(eventsChanged[0].events[0].changed?.length).toBe(1);
    expect(eventsChanged[0].events[0].changed?.[0].type).toBe(end);
  });

  test("'Description' when description has changed", () => {
    const eventsChanged: Calendar[] = filterUpdatedCalendars({
      app: constructedApp,
      variableMgmt,
      oldCalendars: oldCalendars.descriptionChanged,
      newCalendars: newCalendars.descriptionChanged
    });
    expect(eventsChanged.length).toBe(1);
    expect(eventsChanged[0].events.length).toBe(1);
    expect(Array.isArray(eventsChanged[0].events[0].changed)).toBe(true);
    expect(eventsChanged[0].events[0].changed?.length).toBe(1);
    expect(eventsChanged[0].events[0].changed?.[0].type).toBe(description);
  });

  test("'Location' when location has changed", () => {
    const eventsChanged: Calendar[] = filterUpdatedCalendars({
      app: constructedApp,
      variableMgmt,
      oldCalendars: oldCalendars.locationChanged,
      newCalendars: newCalendars.locationChanged
    });
    expect(eventsChanged.length).toBe(1);
    expect(eventsChanged[0].events.length).toBe(1);
    expect(Array.isArray(eventsChanged[0].events[0].changed)).toBe(true);
    expect(eventsChanged[0].events[0].changed?.length).toBe(1);
    expect(eventsChanged[0].events[0].changed?.[0].type).toBe(location);
  });

  test("'Summary' when summary has changed", () => {
    const eventsChanged: Calendar[] = filterUpdatedCalendars({
      app: constructedApp,
      variableMgmt,
      oldCalendars: oldCalendars.summaryChanged,
      newCalendars: newCalendars.summaryChanged
    });
    expect(eventsChanged.length).toBe(1);
    expect(eventsChanged[0].events.length).toBe(1);
    expect(Array.isArray(eventsChanged[0].events[0].changed)).toBe(true);
    expect(eventsChanged[0].events[0].changed?.length).toBe(1);
    expect(eventsChanged[0].events[0].changed?.[0].type).toBe(summary);
  });
});
