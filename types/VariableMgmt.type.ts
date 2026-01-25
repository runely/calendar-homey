import type { Jobs } from "./Cron.type";
import type { Calendar, LocalEvent } from "./IcalCalendar.type";

export type DateTimeFormat = {
  long: string;
  short: string;
  time: string;
};

export type SettingEventLimit = {
  value: string;
  type: SettingEventLimitType;
};

export type SettingEventLimitType =
  | "year"
  | "years"
  | "quarter"
  | "quarters"
  | "month"
  | "months"
  | "week"
  | "weeks"
  | "day"
  | "days"
  | "hour"
  | "hours"
  | "minute"
  | "minutes"
  | "second"
  | "seconds"
  | "millisecond"
  | "milliseconds";

export type SettingHitCount = {
  data: string;
};

export type VariableManagementSettings = {
  icalUris: string;
  syncInterval: string;
  dateFormat: string;
  dateFormatLong: string;
  dateFormatShort: string;
  timeFormat: string;
  eventLimit: string;
  eventLimitDefault: SettingEventLimit;
  nextEventTokensPerCalendar: string;
  triggerAllChangedEventTypes: string;
  logAllEvents: string;
};

export type VariableManagementStorage = {
  eventUids: string;
  localEvents: string;
  calendarsMetadata: string;
};

export type VariableManagementToken = {
  id: string;
  type: "string" | "number";
};

export type VariableManagement = {
  setting: VariableManagementSettings;
  hitCount: SettingHitCount;
  tokens: VariableManagementToken[];
  calendarTokensPreId: string;
  calendarTokensPostTodayId: string;
  calendarTokensPostTodayCountId: string;
  calendarTokensPostTomorrowId: string;
  calendarTokensPostTomorrowCountId: string;
  calendarTokensPostNextTitleId: string;
  calendarTokensPostNextStartDateId: string;
  calendarTokensPostNextStartTimeId: string;
  calendarTokensPostNextEndDateId: string;
  calendarTokensPostNextEndTimeId: string;
  calendarTokensPostNextDescriptionId: string;
  nextTokenPostTitleId: string;
  nextTokenPostStartDateId: string;
  nextTokenPostStartTimeId: string;
  nextTokenPostEndDateId: string;
  nextTokenPostEndTimeId: string;
  nextTokenPostDescriptionId: string;
  calendarTokens: string[];
  flowTokens: string[];
  nextEventWithTokens: string[];
  localEvents: LocalEvent[];
  storage: VariableManagementStorage;
  gettingEventsRunning: boolean;
  gettingEventsLastRun: Date | null;
  jobs: Jobs;
  dateTimeFormat?: DateTimeFormat;
  calendars?: Calendar[];
};
