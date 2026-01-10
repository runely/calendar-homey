import type { FlowCard } from "homey";

import { calendarAutocomplete } from "../lib/autocomplete.js";
import { varMgmt } from "../lib/variable-management.js";
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
    const result: FlowCard.ArgumentAutocompleteResults = calendarAutocomplete(constructedApp, varMgmt, "");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });

  test("Returns an empty list when 'variableMgmt.calendars' is empty", () => {
    const result: FlowCard.ArgumentAutocompleteResults = calendarAutocomplete(
      constructedApp,
      { ...varMgmt, calendars: [] },
      ""
    );
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });

  test("Returns an empty list when query isn't a calendar name present", () => {
    const result: FlowCard.ArgumentAutocompleteResults = calendarAutocomplete(constructedApp, variableMgmt, "Three");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });

  test("Returns 1 calendar when query is 'One'", () => {
    const result: FlowCard.ArgumentAutocompleteResults = calendarAutocomplete(constructedApp, variableMgmt, "One");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("One");
    expect(result[0].name).toBe("One");
  });

  test("Returns 1 calendar when query is 'Two'", () => {
    const result: FlowCard.ArgumentAutocompleteResults = calendarAutocomplete(constructedApp, variableMgmt, "Two");
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("Two");
    expect(result[0].name).toBe("Two");
  });

  test("Returns 2 calendars when query isn't present", () => {
    const result: FlowCard.ArgumentAutocompleteResults = calendarAutocomplete(constructedApp, variableMgmt, undefined);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(2);
    expect(result[0].id).toBe("One");
    expect(result[0].name).toBe("One");
    expect(result[1].id).toBe("Two");
    expect(result[1].name).toBe("Two");
  });
});
