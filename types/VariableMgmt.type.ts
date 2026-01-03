import type { DurationInputArg2, Moment } from "moment";
import type { DateType } from "node-ical";

import type { Jobs } from "./Cron.type";
import type { BusyStatus, CalendarPropertyChanged } from "./IcalCalendar.type";

export type ExtCalendarEvent = VariableManagementCalendarEvent & {
  calendarName: string;
};

export type SettingEventLimit = {
  value: string;
  type: DurationInputArg2;
};

export type SettingHitCount = {
  data: string;
};

export type VariableManagementCalendarEvent = {
  start: Moment;
  dateType: DateType;
  end: Moment;
  uid: string;
  description: string;
  location: string;
  summary: string;
  created?: Moment;
  fullDayEvent: boolean;
  skipTZ: boolean; // TODO: this will be removed when Moment is swapped out for luxon
  freeBusy?: BusyStatus;
  meetingUrl?: string;
  local: boolean;
  changed?: CalendarPropertyChanged[];
  oldEvent?: VariableManagementCalendarEvent;
};

export type VariableManagementCalendar = {
  name: string;
  events: VariableManagementCalendarEvent[];
};

export type VariableManagementDateTimeFormat = {
  long: string;
  short: string;
  time: string;
};

export type VariableManagementLocalEvent = VariableManagementCalendarEvent & {
  calendar: string;
};

export type VariableManagementLocalJsonEvent = {
  start: string;
  // TODO: will this cause problems for already stored events?
  dateType: string;
  end: string;
  uid: string;
  description: string;
  location: string;
  summary: string;
  created?: string;
  fullDayEvent: boolean;
  skipTZ: boolean; // TODO: this will be removed when Moment is swapped out for luxon
  // TODO: will this cause problems for already stored events?
  freeBusy: string;
  meetingUrl: string;
  local: boolean;
  calendar: string;
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
  localEvents: VariableManagementLocalEvent[];
  storage: VariableManagementStorage;
  gettingEventsRunning: boolean;
  gettingEventsLastRun: Date | null;
  jobs: Jobs;
  dateTimeFormat?: VariableManagementDateTimeFormat;
  calendars?: VariableManagementCalendar[];
};
