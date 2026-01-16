import { getDateTimeFormat } from "../lib/get-datetime-format.js";
import { varMgmt } from "../lib/variable-management";
import locale from "../locales/en.json";
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
    expect(format.short).toBe("MM/dd");
    expect(format.long).toBe("MM/dd/yy");
  });

  test("Legacy format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatLegacy);
    expect(format.short).toBe("dd.MM");
    expect(format.long).toBe("dd.MM.yyyy");
  });

  test("Format from settings is used, short is undefined", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatShortUndefined);
    expect(format.short).toBe("dd-MM");
    expect(format.long).toBe("dd-MM-yy");
  });

  test("Format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormat);
    expect(format.short).toBe("dd.MM");
    expect(format.long).toBe("dd-MM-yy");
  });
});

describe("Time format is correct when", () => {
  test("Default format is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatUndefined);
    expect(format.time).toBe("HH:mm");
  });

  test("Format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormat);
    expect(format.time).toBe("HH.mm");
  });
});
