import assert from "node:assert/strict";
import { describe, test } from "node:test";

import deepClone from "lodash.clonedeep";

import { getDateTimeFormat } from "../lib/get-datetime-format.js";
import { varMgmt } from "../lib/variable-management";
import locale from "../locales/en.json";

import type { AppTests } from "../types/Homey.type";
import type { DateTimeFormat, VariableManagement } from "../types/VariableMgmt.type";

import { constructedApp } from "./lib/construct-app";

const {
  settings: {
    datetime: { date, time }
  }
} = locale;

constructedApp.homey.__ = (prop: string): string => {
  if (prop.includes(".date.")) return date.default;
  if (prop.includes(".time.")) return time.default;
  return "";
};
constructedApp.homey.settings.get = (prop: string): string | undefined =>
  prop.includes(".") || prop.includes("-") ? prop : undefined;
constructedApp.homey.settings.set = (prop: string, value: string): void => console.log("Setting", prop, "to", value);

const dateTimeFormatUndefined: VariableManagement = JSON.parse(JSON.stringify(varMgmt));

const dateTimeFormatLegacy: VariableManagement = JSON.parse(JSON.stringify(varMgmt));
dateTimeFormatLegacy.setting.dateFormat = "dd.MM.yyyy";
dateTimeFormatLegacy.setting.timeFormat = "HH.mm";

const dateTimeFormatShortUndefined: VariableManagement = JSON.parse(JSON.stringify(varMgmt));
dateTimeFormatShortUndefined.setting.dateFormat = "dd.MM.yyyy";
dateTimeFormatShortUndefined.setting.dateFormatLong = "dd-MM-yy";
dateTimeFormatShortUndefined.setting.timeFormat = "HH.mm";

const dateTimeFormat: VariableManagement = JSON.parse(JSON.stringify(varMgmt));
dateTimeFormat.setting.dateFormat = "dd.MM.yyyy";
dateTimeFormat.setting.dateFormatLong = "dd-MM-yy";
dateTimeFormat.setting.dateFormatShort = "dd.MM";
dateTimeFormat.setting.timeFormat = "HH.mm";

describe("Date format is correct when", () => {
  test("Default format is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatUndefined);
    assert.strictEqual(format.short, "MM/dd");
    assert.strictEqual(format.long, "MM/dd/yy");
  });

  test("Legacy format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatLegacy);
    assert.strictEqual(format.short, "dd.MM");
    assert.strictEqual(format.long, "dd.MM.yyyy");
  });

  test("Format from settings is used, short is undefined", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatShortUndefined);
    assert.strictEqual(format.short, "dd-MM");
    assert.strictEqual(format.long, "dd-MM-yy");
  });

  test("Format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormat);
    assert.strictEqual(format.short, "dd.MM");
    assert.strictEqual(format.long, "dd-MM-yy");
  });

  test("Previous moment format : TimeFormat: HH:mm, LongDateFormat: dddd DD/MM/YYYY, ShortDateFormat: DD/MM : Converted correctly to luxon format", () => {
    const momentConstructedApp: AppTests = deepClone(constructedApp);
    momentConstructedApp.homey.settings.get = (prop: string): string | undefined => {
      if (prop === varMgmt.setting.dateFormatLong) {
        return "dddd DD/MM/YYYY";
      }

      if (prop === varMgmt.setting.timeFormat) {
        return "HH:mm";
      }

      if (prop === varMgmt.setting.dateFormatShort) {
        return "DD/MM";
      }
    };

    const format: DateTimeFormat = getDateTimeFormat(momentConstructedApp, varMgmt);

    assert.strictEqual(format.time, "HH:mm");
    assert.strictEqual(format.long, "cccc dd/MM/yyyy");
    assert.strictEqual(format.short, "dd/MM");
  });
});

describe("Time format is correct when", () => {
  test("Default format is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatUndefined);
    assert.strictEqual(format.time, "HH:mm");
  });

  test("Format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormat);
    assert.strictEqual(format.time, "HH.mm");
  });
});
