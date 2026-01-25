import { convertToMinutes } from "../lib/convert-to-minutes.js";

import type { ConvertToMinutesType } from "../types/IcalCalendar.type";

type ConvertToMinutesTestTypes = {
  minutes: ConvertToMinutesType;
  hours: ConvertToMinutesType;
  days: ConvertToMinutesType;
  weeks: ConvertToMinutesType;
};

const types: ConvertToMinutesTestTypes = {
  minutes: "1",
  hours: "2",
  days: "3",
  weeks: "4"
};

test("10 minutes returns 10", () => {
  const minutes: number = convertToMinutes(10, types.minutes);
  expect(minutes).toBe(10);
});

test("10 hours returns 600", () => {
  const minutes: number = convertToMinutes(10, types.hours);
  expect(minutes).toBe(600);
});

test("10 days returns 14400", () => {
  const minutes: number = convertToMinutes(10, types.days);
  expect(minutes).toBe(14400);
});

test("10 weeks returns 100800", () => {
  const minutes: number = convertToMinutes(10, types.weeks);
  expect(minutes).toBe(100800);
});
