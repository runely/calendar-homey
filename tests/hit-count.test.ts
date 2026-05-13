import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

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

    assert.ok(Array.isArray(data));
    assert.strictEqual(data?.length, 11);
    assert.strictEqual(data?.[0].id, "event_added");
    assert.ok(getIdsWithTodayNotZero(data).length > 0);
  });

  test("Should return undefined when data is not present", () => {
    const data: HitCount[] | undefined = getHitCountData(appWithoutData, varMgmt);

    assert.ok(!Array.isArray(data));
    assert.strictEqual(data, undefined);
  });
});

describe("resetTodayHitCount", () => {
  beforeEach(() => {
    runtimeData = JSON.parse(dataAsText);
  });

  test("today on all trigger variants should be set to zero when data is present", () => {
    assert.ok(getIdsWithTodayNotZero(runtimeData).length > 0);

    resetTodayHitCount(app, appVariableMgmt);
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
  });

  test("reset should not do anything when data is not present", () => {
    assert.ok(getIdsWithTodayNotZero(runtimeData).length > 0);

    resetTodayHitCount(appWithoutData, varMgmt);
    assert.ok(getIdsWithTodayNotZero(runtimeData).length > 0);
  });
});

describe("setupHitCount", () => {
  beforeEach(() => {
    runtimeData = JSON.parse(dataAsText);
  });

  test("Should create a skeleton for hit count data if data is not present", () => {
    setupHitCount(appWithoutData, varMgmt);

    assert.strictEqual(runtimeData.length, 11);
    assert.strictEqual(runtimeData.filter((t: HitCount) => t.variants.length > 0).length, 0);
  });

  test('Should add missing trigger when data is present and missing "synchronization_error"', () => {
    runtimeData = runtimeData.filter((t: HitCount) => t.id !== "synchronization_error");

    assert.strictEqual(runtimeData.length, 10);

    setupHitCount(app, appVariableMgmt);
    assert.strictEqual(runtimeData.length, 11);
    assert.strictEqual(runtimeData[10].id, "synchronization_error");
    assert.strictEqual(runtimeData[10].variants.length, 0);
  });
});

describe("updateHitCount", () => {
  beforeEach(() => {
    resetTodayHitCount(app, appVariableMgmt);
  });

  test("Should not do anything when data is not present", () => {
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);

    updateHitCount(appWithoutData, varMgmt, "synchronization_error");
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
  });

  test("Should not do anything when triggerId not found", () => {
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);

    updateHitCount(appWithoutData, varMgmt, "non_existing_trigger");
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
  });

  test("Should update only given triggerId with no arguments", () => {
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
    assert.strictEqual(runtimeData.find((t: HitCount) => t.id === "synchronization_error")?.variants.length, 0);

    updateHitCount(app, appVariableMgmt, "synchronization_error");
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    assert.strictEqual(updatedIds.length, 1);
    assert.strictEqual(updatedIds[0], "synchronization_error");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "synchronization_error");

    assert.ok(trigger);
    assert.strictEqual(trigger?.variants.length, 1);
    assert.strictEqual(trigger?.variants[0].total, 1);
    assert.strictEqual(trigger?.variants[0].today, 1);
  });

  // test update with one argument
  test("Should update only given triggerId with one argument", () => {
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
    assert.strictEqual(runtimeData.find((t: HitCount) => t.id === "event_changed_calendar")?.variants.length, 1);

    const calendar: string = "Test";
    updateHitCount(app, appVariableMgmt, "event_changed_calendar", { calendar });
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    assert.strictEqual(updatedIds.length, 1);
    assert.strictEqual(updatedIds[0], "event_changed_calendar");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "event_changed_calendar");

    assert.ok(trigger);
    assert.strictEqual(trigger?.variants.length, 1);
    assert.strictEqual(trigger?.variants[0].calendar, calendar);
    assert.strictEqual(trigger?.variants[0].total, 1);
    assert.strictEqual(trigger?.variants[0].today, 1);
  });

  // test update with two arguments
  test("Should update only given triggerId with two arguments", () => {
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
    assert.strictEqual(runtimeData.find((t: HitCount) => t.id === "event_starts_in")?.variants.length, 2);

    const when: number = 5;
    const type: string = "1";
    updateHitCount(app, appVariableMgmt, "event_starts_in", { when, type });
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    assert.strictEqual(updatedIds.length, 1);
    assert.strictEqual(updatedIds[0], "event_starts_in");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "event_starts_in");

    assert.ok(trigger);
    assert.strictEqual(trigger?.variants.length, 2);
    assert.strictEqual(trigger?.variants[0].lastTriggered, undefined);
    assert.strictEqual(trigger?.variants[0].when, 25);
    assert.strictEqual(trigger?.variants[0].type, type);
    assert.strictEqual(trigger?.variants[0].total, 0);
    assert.strictEqual(trigger?.variants[0].today, 0);
    assert.strictEqual(trigger?.variants[1].when, when);
    assert.strictEqual(trigger?.variants[1].type, type);
    assert.strictEqual(trigger?.variants[1].total, 1); // this should be 1 because no other tests have updated this triggerId yet
    assert.strictEqual(trigger?.variants[1].today, 1);
  });

  // test update with two arguments (switched order)
  test("Should update only given triggerId with two arguments (switched order)", () => {
    assert.strictEqual(getIdsWithTodayNotZero(runtimeData).length, 0);
    assert.strictEqual(runtimeData.find((t: HitCount) => t.id === "event_starts_in")?.variants.length, 2);

    const when: number = 5;
    const type: string = "1";
    updateHitCount(app, appVariableMgmt, "event_starts_in", { type, when });
    const updatedIds: string[] = getIdsWithTodayNotZero(runtimeData);

    assert.strictEqual(updatedIds.length, 1);
    assert.strictEqual(updatedIds[0], "event_starts_in");

    const trigger: HitCount | undefined = runtimeData.find((t: HitCount) => t.id === "event_starts_in");

    assert.ok(trigger);
    assert.strictEqual(trigger?.variants.length, 2);
    assert.strictEqual(trigger?.variants[0].lastTriggered, undefined);
    assert.strictEqual(trigger?.variants[0].when, 25);
    assert.strictEqual(trigger?.variants[0].type, type);
    assert.strictEqual(trigger?.variants[0].total, 0);
    assert.strictEqual(trigger?.variants[0].today, 0);
    assert.strictEqual(trigger?.variants[1].when, when);
    assert.strictEqual(trigger?.variants[1].type, type);
    assert.strictEqual(trigger?.variants[1].total, 2); // this should be 2 because the previous test updated this triggerId as well
    assert.strictEqual(trigger?.variants[1].today, 1); // this should be 1 because the beforeEach reset it
  });
});
