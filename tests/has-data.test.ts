import { hasData } from "../lib/has-data.js";

import type { HasDataFalsyType, HasDataTruthyType } from "../types/IcalCalendar.type";

const falsy: HasDataFalsyType[] = [undefined, null, [], {}];

const truthy: HasDataTruthyType[] = [true, 0, 1, false, [1], { hey: "" }, "", "hey"];

describe("Return false", () => {
  falsy.forEach((value: HasDataFalsyType) => {
    test(`When data is ${JSON.stringify(value)}`, () => {
      const result: boolean = hasData(value);
      expect(result).toBeFalsy();
    });
  });
});

describe("Return true", () => {
  truthy.forEach((value: HasDataTruthyType) => {
    test(`When data is ${JSON.stringify(value)}`, () => {
      const result: boolean = hasData(value);
      expect(result).toBeTruthy();
    });
  });
});
