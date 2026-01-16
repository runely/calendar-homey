import deepClone from "lodash.clonedeep";

import { getHitCountData, resetTodayHitCount, setupHitCount, updateHitCount } from "../lib/hit-count.js";
import { varMgmt } from "../lib/variable-management";

import type { HitCount, HitCountVariant } from "../types/HitCount.type";
import type { AppTests } from "../types/Homey.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import data from "./data/hit-count-data.json";
import { constructedApp } from "./lib/construct-app.js";

const dataAsText: string = JSON.stringify(data);

let runtimeData: HitCount[] = JSON.parse(dataAsText);

const app: AppTests = deepClone(constructedApp);
app.homey.__ = (prop: string): string => {
  if (prop === "locale.luxon") {
    return "en";
  }

  return prop;
};
app.homey.i18n.getLanguage = (): string => "no";
app.homey.settings.get = (path: string): string => {
  console.debug("GET : path", path);
  return JSON.stringify(runtimeData);
};
app.homey.settings.set = (path: string, data: string): void => {
  console.debug("SET : path", path, "-- data", data);
  runtimeData = JSON.parse(data);
};

const appVariableMgmt: VariableManagement = deepClone(varMgmt);
appVariableMgmt.dateTimeFormat = {
  long: "ccc dd.MM.yy",
  short: "dd.MM",
  time: "HH:mm"
};
appVariableMgmt.hitCount = {
  data: "path"
};

const appWithoutData: AppTests = deepClone(constructedApp);
appWithoutData.homey.i18n.getLanguage = (): string => "no";
appWithoutData.homey.settings.get = (path: string): undefined => {
  console.debug("GET : path", path);
  return undefined;
};
appWithoutData.homey.settings.set = (path: string, data: string): void => {
  console.debug("SET : path", path, "-- data", data);
  runtimeData = JSON.parse(data);
};

const getIdsWithTodayNotZero = (data: HitCount[] | undefined): string[] => {
  if (!data) {
    return [];
  }

  const ids: string[] = [];
  data.forEach((t: HitCount) => {
    if (t.variants.filter((v: HitCountVariant) => v.today > 0).length > 0) {
      ids.push(t.id);
    }
  });

  return ids;
};

describe("getHitCountData", () => {
  test("Should return parsed JSON when data is present", () => {
    const data: HitCount[] | undefined = getHitCountData(app, appVariableMgmt);

    expect(Array.isArray(data)).toBeTruthy();
    expect(data?.length).toBe(11);
    expect(data?.[0].id).toBe("event_added");
    expect(getIdsWithTodayNotZero(data).length).toBeGreaterThan(0);
  });

  test("Should return undefined when data is not present", () => {
    const data: HitCount[] | undefined = getHitCountData(appWithoutData, varMgmt);

    expect(Array.isArray(data)).toBeFalsy();
    expect(data).toBe(undefined);
  });
});

describe("resetTodayHitCount", () => {
  beforeEach(() => {
    runtimeData = JSON.parse(dataAsText);
  });

  test("today on all trigger variants should be set to zero when data is present", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBeGreaterThan(0);

    resetTodayHitCount(app, appVariableMgmt);
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
  });

  test("reset should not do anything when data is not present", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBeGreaterThan(0);

    resetTodayHitCount(appWithoutData, varMgmt);
    expect(getIdsWithTodayNotZero(runtimeData).length).toBeGreaterThan(0);
  });
});

describe("setupHitCount", () => {
  beforeEach(() => {
    runtimeData = JSON.parse(dataAsText);
  });

  test("Should create a skeleton for hit count data if data is not present", () => {
    setupHitCount(appWithoutData, varMgmt);

    expect(runtimeData.length).toBe(11);
    expect(runtimeData.filter((t: HitCount) => t.variants.length > 0).length).toBe(0);
  });

  test('Should add missing trigger when data is present and missing "synchronization_error"', () => {
    runtimeData = runtimeData.filter((t: HitCount) => t.id !== "synchronization_error");

    expect(runtimeData.length).toBe(10);

    setupHitCount(app, appVariableMgmt);
    expect(runtimeData.length).toBe(11);
    expect(runtimeData[10].id).toBe("synchronization_error");
    expect(runtimeData[10].variants.length).toBe(0);
  });
});

describe("updateHitCount", () => {
  beforeEach(() => {
    resetTodayHitCount(app, appVariableMgmt);
  });

  test("Should not do anything when data is not present", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);

    updateHitCount(appWithoutData, varMgmt, "synchronization_error");
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
  });

  test("Should not do anything when triggerId not found", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);

    updateHitCount(appWithoutData, varMgmt, "non_existing_trigger");
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
  });

  test("Should update only given triggerId with no arguments", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
    expect(runtimeData.find((t: HitCount) => t.id === "synchronization_error")?.variants.length).toBe(0);

    updateHitCount(app, appVariableMgmt, "synchronization_error");
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    expect(updatedIds.length).toBe(1);
    expect(updatedIds[0]).toBe("synchronization_error");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "synchronization_error");

    expect(trigger).toBeTruthy();
    expect(trigger?.variants.length).toBe(1);
    expect(trigger?.variants[0].total).toBe(1);
    expect(trigger?.variants[0].today).toBe(1);
  });

  // test update with one argument
  test("Should update only given triggerId with one argument", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
    expect(runtimeData.find((t: HitCount) => t.id === "event_changed_calendar")?.variants.length).toBe(1);

    const calendar: string = "Test";
    updateHitCount(app, appVariableMgmt, "event_changed_calendar", { calendar });
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    expect(updatedIds.length).toBe(1);
    expect(updatedIds[0]).toBe("event_changed_calendar");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "event_changed_calendar");

    expect(trigger).toBeTruthy();
    expect(trigger?.variants.length).toBe(1);
    expect(trigger?.variants[0].calendar).toBe(calendar);
    expect(trigger?.variants[0].total).toBe(1);
    expect(trigger?.variants[0].today).toBe(1);
  });

  // test update with two arguments
  test("Should update only given triggerId with two arguments", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
    expect(runtimeData.find((t: HitCount) => t.id === "event_starts_in")?.variants.length).toBe(2);

    const when: number = 5;
    const type: string = "1";
    updateHitCount(app, appVariableMgmt, "event_starts_in", { when, type });
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    expect(updatedIds.length).toBe(1);
    expect(updatedIds[0]).toBe("event_starts_in");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "event_starts_in");

    expect(trigger).toBeTruthy();
    expect(trigger?.variants.length).toBe(2);
    expect(trigger?.variants[0].lastTriggered).toBe(undefined);
    expect(trigger?.variants[0].when).toBe(25);
    expect(trigger?.variants[0].type).toBe(type);
    expect(trigger?.variants[0].total).toBe(0);
    expect(trigger?.variants[0].today).toBe(0);
    expect(trigger?.variants[1].when).toBe(when);
    expect(trigger?.variants[1].type).toBe(type);
    expect(trigger?.variants[1].total).toBe(1); // this should be 1 because no other tests have updated this triggerId yet
    expect(trigger?.variants[1].today).toBe(1);
  });

  // test update with two arguments (switched order)
  test("Should update only given triggerId with two arguments (switched order)", () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0);
    expect(runtimeData.find((t: HitCount) => t.id === "event_starts_in")?.variants.length).toBe(2);

    const when: number = 5;
    const type: string = "1";
    updateHitCount(app, appVariableMgmt, "event_starts_in", { type, when });
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    expect(updatedIds.length).toBe(1);
    expect(updatedIds[0]).toBe("event_starts_in");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "event_starts_in");

    expect(trigger).toBeTruthy();
    expect(trigger?.variants.length).toBe(2);
    expect(trigger?.variants[0].lastTriggered).toBe(undefined);
    expect(trigger?.variants[0].when).toBe(25);
    expect(trigger?.variants[0].type).toBe(type);
    expect(trigger?.variants[0].total).toBe(0);
    expect(trigger?.variants[0].today).toBe(0);
    expect(trigger?.variants[1].when).toBe(when);
    expect(trigger?.variants[1].type).toBe(type);
    expect(trigger?.variants[1].total).toBe(2); // this should be 2 because the previous test updated this triggerId as well
    expect(trigger?.variants[1].today).toBe(1); // this should be 1 because the beforeEach reset it
  });
});
