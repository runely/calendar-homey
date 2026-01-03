import { Moment } from "moment";
import {VariableManagementCalendarEvent, VariableManagementLocalEvent} from "./VariableMgmt.type";
import {getTokenValue} from "../lib/get-token-value";
import {capitalize} from "../lib/capitalize";

export type BusyStatus = 'FREE' | 'TENTATIVE' | 'BUSY' | 'OOF';

export type CalendarEventUid = {
  calendar: string;
  uid: string;
}

export type CalendarPropertyChanged = {
  type: string;
  previousValue: string;
  newValue: string;
}

export type CalendarMetaData = {
  name: string;
  eventCount: number;
  lastFailedSync?: Moment;
  lastSuccessfullSync?: Moment;
}

export type ConditionCaller = 'condition' | 'changedEvent';

export type EventDuration = {
  /** Humanized duration string */
  duration: string;
  /** Duration in minutes */
  durationMinutes: number;
}

export type FallbackUri = {
  fallbackProtocol: string;
  fallbackUri: string;
  protocol: string;
}

export type FilterMatcher = 'contains' | 'ends with' | 'equal' | 'starts with';

export type FilterProperty = 'description' | 'location' | 'summary' | 'uid';

export type IcalSettingEntry = {
  name: string;
  uri: string;
  failed?: string;
}

export type NextEvent = {
  calendarName: string;
  event: VariableManagementCalendarEvent;
  startsIn: number;
  endsIn: number;
}

export type SyncInterval = {
  auto: boolean;
  cron: string;
  error?: string;
}

export type TriggerChangedCalendarTokens = {
  event_name: string;
  event_calendar_name: string;
  event_type: string;
  event_prev_value: string;
  event_new_value: string;
  event_was_ongoing: boolean;
  event_ongoing: boolean;
  event_start_date: string;
  event_start_time: string;
  event_end_date: string;
  event_end_time: string;
  event_duration_readable: string;
  event_duration: number;
}

export type TriggerEvent = {
  calendarName: string;
  event: VariableManagementCalendarEvent | VariableManagementLocalEvent;
  triggerId: string;
  state?: TriggerState;
}

export type TriggerFlowTokens = {
  event_name: string;
  event_description: string;
  event_location: string;
  event_duration_readable: string;
  event_duration: number;
  event_calendar_name: string;
  event_status: string;
  event_meeting_url: string;

  event_start_date?: string;
  event_start_time?: string;
  event_end_date?: string;
  event_end_time?: string;
  event_weekday_readable?: string;
  event_month_readable?: string;
  event_date_of_month?: number;
}

export type TriggerState = {
  calendarName?: string;
  when?: number;
}

export type TriggerSynchronizationTokens = {
  calendar_name: string;
  calendar_error: string;
  on_calendar_load: boolean;
  on_event_load: boolean;
  event_name: string;
  event_uid: string;
}