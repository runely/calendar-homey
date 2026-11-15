import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { calendarAutocomplete } from "../lib/autocomplete.js";
import { varMgmt } from "../lib/variable-management.js";
import type { ArgumentAutoCompleteResult } from "../types/Homey.type.js";
import type { VariableManagement } from "../types/VariableMgmt.type";
import { constructedApp } from "./lib/construct-app.js";

const variableMgmt: VariableManagement = {
  ...varMgmt,
  calendars: [
    {
      name: "One",
      events: []
    },
    {
      name: "Two",
      events: []
    }
  ]
};

describe("calendarAutocomplete", () => {
  test("Returns an empty list when 'variableMgmt.calendars' doesn't exist", () => {
    const result: ArgumentAutoCompleteResult[] = calendarAutocomplete(constructedApp, varMgmt, "");
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });

  test("Returns an empty list when 'variableMgmt.calendars' is empty", () => {
    const result: ArgumentAutoCompleteResult[] = calendarAutocomplete(
      constructedApp,
      { ...varMgmt, calendars: [] },
      ""
    );
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });

  test("Returns an empty list when query isn't a calendar name present", () => {
    const result: ArgumentAutoCompleteResult[] = calendarAutocomplete(constructedApp, variableMgmt, "Three");
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });

  test("Returns 1 calendar when query is 'One'", () => {
    const result: ArgumentAutoCompleteResult[] = calendarAutocomplete(constructedApp, variableMgmt, "One");
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, "One");
    assert.strictEqual(result[0].name, "One");
  });

  test("Returns 1 calendar when query is 'Two'", () => {
    const result: ArgumentAutoCompleteResult[] = calendarAutocomplete(constructedApp, variableMgmt, "Two");
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, "Two");
    assert.strictEqual(result[0].name, "Two");
  });

  test("Returns 2 calendars when query isn't present", () => {
    const result: ArgumentAutoCompleteResult[] = calendarAutocomplete(constructedApp, variableMgmt, undefined);
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].id, "One");
    assert.strictEqual(result[0].name, "One");
    assert.strictEqual(result[1].id, "Two");
    assert.strictEqual(result[1].name, "Two");
  });
});
