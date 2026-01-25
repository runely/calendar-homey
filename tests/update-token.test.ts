import { updateToken } from "../handlers/update-tokens.js";

import type { TokenValue } from "../types/Homey.type";

import { constructedApp } from "./lib/construct-app.js";

type ValueTest = {
  value: TokenValue;
  expected: TokenValue;
};

const values: ValueTest[] = [
  {
    value: "string value",
    expected: "string value"
  },
  {
    value: "",
    expected: ""
  },
  {
    value: 42,
    expected: 42
  },
  {
    value: -1,
    expected: -1
  },
  {
    value: 0,
    expected: 0
  },
  {
    value: false,
    expected: false
  },
  {
    value: true,
    expected: true
  },
  {
    value: undefined,
    expected: ""
  }
];

let updatedTokenValue: TokenValue;

constructedApp.homey.flow.getToken = (_id: string) => {
  return {
    setValue: async (value: TokenValue) => {
      updatedTokenValue = value;
    }
  };
};

describe("updateToken", () => {
  values.forEach(({ value, expected }: ValueTest) => {
    test(`successfully updates token with value: '${value} as '${expected}'`, async () => {
      try {
        await updateToken(constructedApp, "test_token", value);
      } catch {
        // NOTE: just to let the test fail in the catch block
        expect(true).toBe(false);
      }

      expect(updatedTokenValue).toBe(expected);
    });
  });
});
