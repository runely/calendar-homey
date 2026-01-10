import { filterByCalendar, filterByProperty, filterByUID } from "../lib/filter-by.js";
import { getMoment } from "../lib/moment-datetime.js";

import type { Calendar } from "../types/VariableMgmt.type";

const calendars: Calendar[] = [
  {
    name: "CalendarOne",
    events: [
      {
        start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
        uid: "cal_one_One",
        description: "One - 1",
        location: "One - 1",
        summary: "One - 1",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      },
      {
        start: getMoment({ date: "2021-11-06T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-06T21:00:00.000Z" }),
        uid: "cal_one_Two",
        description: "Two - 1",
        location: "Two - 1",
        summary: "Two - 1",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      },
      {
        start: getMoment({ date: "2021-11-06T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-06T21:00:00.000Z" }),
        uid: "cal_one_Three",
        description: "",
        location: "",
        summary: "",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      }
    ]
  },
  {
    name: "CalendarTwo",
    events: [
      {
        start: getMoment({ date: "2021-11-05T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-05T21:00:00.000Z" }),
        uid: "cal_two_One",
        description: "One - 2",
        location: "One - 2",
        summary: "One - 2",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      },
      {
        start: getMoment({ date: "2021-11-06T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-06T21:00:00.000Z" }),
        uid: "cal_two_Two",
        description: "Two - 2",
        location: "Two - 2",
        summary: "Two - 2",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      },
      {
        start: getMoment({ date: "2021-11-06T20:00:00.000Z" }),
        dateType: "date-time",
        end: getMoment({ date: "2021-11-06T21:00:00.000Z" }),
        uid: "cal_two_Four",
        description: "",
        location: "",
        summary: "",
        fullDayEvent: false,
        skipTZ: true,
        local: false
      }
    ]
  }
];

describe("filterByCalendar", () => {
  test("Return 1 calendar - name 'CalendarOne'", () => {
    const result: Calendar[] = filterByCalendar(calendars, "CalendarOne");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("CalendarOne");
  });

  test("Return 0 calendars - name 'CalendarThree'", () => {
    const result: Calendar[] = filterByCalendar(calendars, "CalendarThree");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });

  test("Return 0 calendars - when calendars is empty and name is not provided", () => {
    const result: Calendar[] = filterByCalendar([]);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });
});

describe("filterByProperty", () => {
  describe("summary - matcher:contains", () => {
    test("Return 2 calendars with 1 event each - summary 'One'", () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "summary");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].summary).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].summary).toBe("One - 2");
    });

    test("Return 2 calendars with 0 events - summary 'Three'", () => {
      const result: Calendar[] = filterByProperty(calendars, "Three", "summary");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 2 calendars with 1 event in the first calendar and 0 events in the second calendar - summary 'One - 1'", () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 1", "summary");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].summary).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test('Return 2 calendars with 0 events in the first calendar and 1 event in the second calendar - summary "One - 2"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 2", "summary");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].summary).toBe("One - 2");
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "summary");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("summary - matcher:equal", () => {
    test('Return 2 calendars with 1 event in CalendarOne - summary "One - 1"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 1", "summary", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].summary).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test('Return 2 calendars with 1 event in CalendarTwo - summary "One - 2"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 2", "summary", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].summary).toBe("One - 2");
    });

    test('Return 2 calendars with 0 events - summary "One"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "summary", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "summary", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("summary - matcher:starts with", () => {
    test('Return 2 calendars with 1 event in each - summary "One"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "summary", "starts with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].summary).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].summary).toBe("One - 2");
    });

    test('Return 2 calendars with 1 event in CalendarTwo - summary "One - 2"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 2", "summary", "starts with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].summary).toBe("One - 2");
    });

    test('Return 2 calendars with 0 events - summary "1"', () => {
      const result: Calendar[] = filterByProperty(calendars, "1", "summary", "starts with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "summary", "starts with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("summary - matcher:ends with", () => {
    test('Return 2 calendars with 2 events in CalendarOne - summary "1"', () => {
      const result: Calendar[] = filterByProperty(calendars, "1", "summary", "ends with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(2);
      expect(result[0].events[0].summary).toBe("One - 1");
      expect(result[0].events[1].summary).toBe("Two - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test('Return 2 calendars with 2 events in CalendarTwo - summary "2"', () => {
      const result: Calendar[] = filterByProperty(calendars, "2", "summary", "ends with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(2);
      expect(result[1].events[0].summary).toBe("One - 2");
      expect(result[1].events[1].summary).toBe("Two - 2");
    });

    test('Return 2 calendars with 0 events - summary "Two"', () => {
      const result: Calendar[] = filterByProperty(calendars, "Two", "summary", "ends with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "summary", "ends with");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("description - matcher:contains", () => {
    test('Return 2 calendars with 1 event each - description "One"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "description");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].description).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].description).toBe("One - 2");
    });

    test('Return 2 calendars with 0 events - description "Three"', () => {
      const result: Calendar[] = filterByProperty(calendars, "Three", "description");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "description");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("description - matcher:equal", () => {
    test('Return 2 calendars with 1 event in CalendarOne - description "One - 1"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 1", "description", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].description).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test('Return 2 calendars with 1 event in CalendarTwo - description "One - 2"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 2", "description", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].description).toBe("One - 2");
    });

    test('Return 2 calendars with 0 events - description "One"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "description", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "description", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("location - matcher:contains", () => {
    test('Return 2 calendars with 1 event each - location "One"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "location");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].location).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].location).toBe("One - 2");
    });

    test('Return 2 calendars with 0 events - location "Three"', () => {
      const result: Calendar[] = filterByProperty(calendars, "Three", "location");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "location");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });

  describe("location - matcher:equal", () => {
    test('Return 2 calendars with 1 event in CalendarOne - location "One - 1"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 1", "location", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(1);
      expect(result[0].events[0].location).toBe("One - 1");
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test('Return 2 calendars with 1 event in CalendarTwo - location "One - 2"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One - 2", "location", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(1);
      expect(result[1].events[0].location).toBe("One - 2");
    });

    test('Return 2 calendars with 0 events - location "One"', () => {
      const result: Calendar[] = filterByProperty(calendars, "One", "location", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("CalendarOne");
      expect(result[0].events.length).toBe(0);
      expect(result[1].name).toBe("CalendarTwo");
      expect(result[1].events.length).toBe(0);
    });

    test("Return 0 calendars - when calendars is empty", () => {
      const result: Calendar[] = filterByProperty([], "doesNotMatter", "location", "equal");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });
  });
});

describe("filterByUID", () => {
  test('Return 2 calendars, 1 with 1 event, and 1 with 0 events - uid "cal_one_One"', () => {
    const result: Calendar[] = filterByUID(calendars, "cal_one_One");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("CalendarOne");
    expect(result[0].events[0].uid).toBe("cal_one_One");
    expect(result[1].name).toBe("CalendarTwo");
    expect(result[1].events.length).toBe(0);
  });

  test('Return 2 calendars with 0 events - uid "cal_three_One"', () => {
    const result: Calendar[] = filterByUID(calendars, "cal_three_One");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("CalendarOne");
    expect(result[0].events.length).toBe(0);
    expect(result[1].name).toBe("CalendarTwo");
    expect(result[1].events.length).toBe(0);
  });

  test("Return 0 calendars - when calendars is empty", () => {
    const result: Calendar[] = filterByUID([], "noesNotMatter");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });
});
