import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { DateTime } from "luxon";

import { createDateWithTimeZone } from "../lib/create-date-with-timezone.js";
import { hasData } from "../lib/has-data.js";

import type { HasDataFalsyType, HasDataTruthyType } from "../types/IcalCalendar.type";

const falsy: HasDataFalsyType[] = [undefined, null, [], {}];

const truthy: HasDataTruthyType[] = [
  true,
  0,
  1,
  false,
  [1],
  { hey: "" },
  "",
  "hey",
  DateTime.now(),
  createDateWithTimeZone(new Date(), undefined)
];

describe("Return false", () => {
  falsy.forEach((value: HasDataFalsyType) => {
    test(`When data is ${JSON.stringify(value)}`, () => {
      const result: boolean = hasData(value);
      assert.ok(!result);
    });
  });
});

describe("Return true", () => {
  truthy.forEach((value: HasDataTruthyType) => {
    test(`When data is ${JSON.stringify(value)}`, () => {
      const result: boolean = hasData(value);
      assert.ok(result);
    });
  });
});
