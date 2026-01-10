import { getMoment } from "../lib/moment-datetime.js";
import { sortCalendarsEvents } from "../lib/sort-calendars.js";

import type { VariableManagementCalendar } from "../types/VariableMgmt.type";

const calendars: VariableManagementCalendar[] = [
  {
    name: "CalendarOne",
    events: [
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
        local: false
      },
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
        local: false
      }
    ]
  },
  {
    name: "CalendarTwo",
    events: [
      {
        start: getMoment({ date: "2021-11-06T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-06T21:00:00.000Z" }),
        uid: "cal_two_Two",
        description: "Two",
        location: "",
        summary: "Two",
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: undefined,
        meetingUrl: undefined,
        local: false
      },
      {
        start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
        uid: "cal_two_One",
        description: "One",
        location: "",
        summary: "One",
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

test('Calendar events are sorted after "start" datetime', () => {
  const result: VariableManagementCalendar[] = sortCalendarsEvents(calendars);

  expect(result.length).toBe(2);
  expect(result[0].name).toBe("CalendarOne");
  expect(result[0].events.length).toBe(2);
  expect(result[0].events[0].uid).toBe("cal_one_One");
  expect(result[0].events[1].uid).toBe("cal_one_Two");
  expect(result[1].name).toBe("CalendarTwo");
  expect(result[1].events.length).toBe(2);
  expect(result[1].events[0].uid).toBe("cal_two_One");
  expect(result[1].events[1].uid).toBe("cal_two_Two");
});
