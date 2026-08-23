import assert from "node:assert/strict";
import { test } from "node:test";

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
  assert.strictEqual(minutes, 10);
});

test("10 hours returns 600", () => {
  const minutes: number = convertToMinutes(10, types.hours);
  assert.strictEqual(minutes, 600);
});

test("10 days returns 14400", () => {
  const minutes: number = convertToMinutes(10, types.days);
  assert.strictEqual(minutes, 14400);
});

test("10 weeks returns 100800", () => {
  const minutes: number = convertToMinutes(10, types.weeks);
  assert.strictEqual(minutes, 100800);
});
