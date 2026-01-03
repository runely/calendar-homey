import type { App } from "homey";

import type { VariableManagement, VariableManagementDateTimeFormat } from "../types/VariableMgmt.type";

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

export const getDateTimeFormat = (app: App, variableMgmt: VariableManagement): VariableManagementDateTimeFormat => {
  const time: string =
    app.homey.settings.get(variableMgmt.setting.timeFormat) || app.homey.__("settings.datetime.time.default");
  const long: string =
    app.homey.settings.get(variableMgmt.setting.dateFormatLong) ||
    app.homey.settings.get(variableMgmt.setting.dateFormat) ||
    app.homey.__("settings.datetime.date.default");
  let short: string | null = app.homey.settings.get(variableMgmt.setting.dateFormatShort);

  if (!short) {
    short = getShortDateFormat(long);
    app.homey.settings.set(variableMgmt.setting.timeFormat, time);
    app.homey.settings.set(variableMgmt.setting.dateFormatLong, long);
    app.homey.settings.set(variableMgmt.setting.dateFormatShort, short);
    app.log("getDateTimeFormat: Initial DateTimeFormat saved to settings");
  }

  const format: VariableManagementDateTimeFormat = {
    long,
    short,
    time
  };

  app.log("DateTimeFormat:", format);

  return format;
};
