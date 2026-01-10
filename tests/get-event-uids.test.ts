import { getEventUids } from "../lib/get-event-uids.js";
import { getMoment } from "../lib/moment-datetime.js";

import type { CalendarEventUid } from "../types/IcalCalendar.type";
import type { VariableManagementCalendar } from "../types/VariableMgmt.type";

const calendars: VariableManagementCalendar[] = [
  {
    name: "events",
    events: [
      {
        start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8841",
        description: "Desc",
        location: "",
        summary: "Past",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      },
      {
        start: getMoment({ date: "2041-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2041-11-05T21:00:00.000Z" }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      }
    ]
  },
  {
    name: "events2",
    events: [
      {
        start: getMoment({ date: "2040-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2040-11-05T21:00:00.000Z" }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8843",
        description: "Desc",
        location: "",
        summary: "Future2",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      },
      {
        start: getMoment({ date: "2041-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2041-11-05T21:00:00.000Z" }),
        uid: "F7177A32-DBD4-46A9-85C7-669749EA8842",
        description: "Desc",
        location: "",
        summary: "Future",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      }
    ]
  }
];

test("No calendars returns an empty array", () => {
  const result: CalendarEventUid[] = getEventUids([]);
  expect(result.length).toBe(0);
});

test("Will return only unique uids", () => {
  const result: CalendarEventUid[] = getEventUids(calendars);
  expect(result.length).toBe(3);
});
