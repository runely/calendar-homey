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
dateTimeFormatLegacy.setting.dateFormat = "DD.MM.YYYY";
dateTimeFormatLegacy.setting.timeFormat = "HH.mm";

const dateTimeFormatShortUndefined: VariableManagement = JSON.parse(JSON.stringify(varMgmt));
dateTimeFormatShortUndefined.setting.dateFormat = "DD.MM.YYYY";
dateTimeFormatShortUndefined.setting.dateFormatLong = "DD-MM-YY";
dateTimeFormatShortUndefined.setting.timeFormat = "HH.mm";

const dateTimeFormat: VariableManagement = JSON.parse(JSON.stringify(varMgmt));
dateTimeFormat.setting.dateFormat = "DD.MM.YYYY";
dateTimeFormat.setting.dateFormatLong = "DD-MM-YY";
dateTimeFormat.setting.dateFormatShort = "DD.MM";
dateTimeFormat.setting.timeFormat = "HH.mm";

describe("Date format is correct when", () => {
  test("Default format is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatUndefined);
    expect(format.short).toBe("MM/DD");
    expect(format.long).toBe("MM/DD/YY");
  });

  test("Legacy format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatLegacy);
    expect(format.short).toBe("DD.MM");
    expect(format.long).toBe("DD.MM.YYYY");
  });

  test("Format from settings is used, short is undefined", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormatShortUndefined);
    expect(format.short).toBe("DD-MM");
    expect(format.long).toBe("DD-MM-YY");
  });

  test("Format from settings is used", () => {
    const format: DateTimeFormat = getDateTimeFormat(constructedApp, dateTimeFormat);
    expect(format.short).toBe("DD.MM");
    expect(format.long).toBe("DD-MM-YY");
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
