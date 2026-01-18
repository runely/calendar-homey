import type { App } from "homey";

import type { AppTests } from "../types/Homey.type";
import type { DateTimeFormat, VariableManagement } from "../types/VariableMgmt.type";

type UpdateFormat = {
  format: string;
  converted: boolean;
};

const updateFormat = (format: string): UpdateFormat => {
  const newFormat: string = format
    .replace(/dddd/g, "cccc")
    .replace(/ddd/g, "ccc")
    .replace(/DD/g, "dd")
    .replace(/D/g, "d")
    .replace(/YYYY/g, "yyyy")
    .replace(/YY/g, "yy");

  return {
    format: newFormat,
    converted: newFormat !== format
  };
};

const getShortDateFormat = (longDateFormat: string): string => {
  let dateFormat: string = longDateFormat;
  let dateLong: string = dateFormat;
  const legacyPatternResult: RegExpExecArray | null =
    /[d \-.,/:]{0,7}([DM]{1,2}[/.-][DM]{1,2}[/.-]Y{2,4})|[d \-.,/:]{0,7}(Y{2,4}[/.-][DM]{1,2}[/.-][DM]{1,2})/.exec(
      dateFormat
    );
  if (legacyPatternResult && legacyPatternResult.length > 0) {
    dateFormat = legacyPatternResult[0]; // use dateFormat parsed from settings
    dateLong = legacyPatternResult[1] || legacyPatternResult[2]; // use dateLong parsed from settings
  }
  const dateFormatSplit: string[] = dateLong.split(/[./-]/);

  let dateSplitter: string = ".";
  if (dateFormat.includes(".")) {
    dateSplitter = ".";
  } else if (dateFormat.includes("/")) {
    dateSplitter = "/";
  } else if (dateFormat.includes("-")) {
    dateSplitter = "-";
  }

  return !dateLong.toLowerCase().startsWith("y")
    ? `${dateFormatSplit[0]}${dateSplitter}${dateFormatSplit[1]}`
    : `${dateFormatSplit[1]}${dateSplitter}${dateFormatSplit[2]}`;
};

export const getDateTimeFormat = (app: App | AppTests, variableMgmt: VariableManagement): DateTimeFormat => {
  const time: UpdateFormat = updateFormat(
    app.homey.settings.get(variableMgmt.setting.timeFormat) || app.homey.__("settings.datetime.time.default")
  );

  const long: UpdateFormat = updateFormat(
    app.homey.settings.get(variableMgmt.setting.dateFormatLong) ||
      app.homey.settings.get(variableMgmt.setting.dateFormat) ||
      app.homey.__("settings.datetime.date.default")
  );

  const shortSetting: string | null = app.homey.settings.get(variableMgmt.setting.dateFormatShort);
  const short: UpdateFormat = shortSetting ? updateFormat(shortSetting) : updateFormat(getShortDateFormat(long.format));

  if (!shortSetting) {
    app.homey.settings.set(variableMgmt.setting.timeFormat, time.format);
    time.converted = false;

    app.homey.settings.set(variableMgmt.setting.dateFormatLong, long.format);
    long.converted = false;

    app.homey.settings.set(variableMgmt.setting.dateFormatShort, short.format);
    short.converted = false;

    app.log("getDateTimeFormat: Initial DateTimeFormat saved to settings");
  }

  if (time.converted) {
    app.homey.settings.set(variableMgmt.setting.timeFormat, time.format);
    app.log(`getDateTimeFormat: Time format converted and saved to settings: ${time.format}`);
  }

  if (long.converted) {
    app.homey.settings.set(variableMgmt.setting.dateFormatLong, long.format);
    app.log(`getDateTimeFormat: Long date format converted and saved to settings: ${long.format}`);
  }

  if (short.converted) {
    app.homey.settings.set(variableMgmt.setting.dateFormatShort, short.format);
    app.log(`getDateTimeFormat: Short date format converted and saved to settings: ${short.format}`);
  }

  const format: DateTimeFormat = {
    long: long.format,
    short: short?.format || "",
    time: time.format
  };

  app.log("DateTimeFormat:", format);

  return format;
};
