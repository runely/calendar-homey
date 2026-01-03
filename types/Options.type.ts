import { App } from "homey";

import { CalendarEventUid } from "./IcalCalendar.type";
import { SettingEventLimit, VariableManagement, VariableManagementCalendar, VariableManagementCalendarEvent, VariableManagementLocalJsonEvent } from "./VariableMgmt.type";
import {CalendarResponse} from "node-ical";

export type EventOptions = {
  timezone: string;
  calendars: VariableManagementCalendar[];
}

export type FilterUpdatedCalendarsOptions = {
  app: App;
  variableMgmt: VariableManagement;
  oldCalendars: VariableManagementCalendar[];
  newCalendars: VariableManagementCalendar[];
}

export type GetActiveEventsOptions = {
  app: App;
  timezone: string;
  data: CalendarResponse;
  eventLimit: SettingEventLimit;
  calendarName: string;
  logAllEvents: boolean;
}

export type GetLocalActiveEventsOptions = {
  timezone: string;
  events: VariableManagementLocalJsonEvent[];
  eventLimit: SettingEventLimit;
  app: App;
  logAllEvents: boolean;
}

export type GetNewEventsOptions = {
  timezone: string;
  oldCalendarsUids: CalendarEventUid[];
  newCalendarsUids: CalendarEventUid[];
  calendarsEvents: VariableManagementCalendar[];
  app: App;
}

export type MomentDateTimeOptions = {
  timezone?: string;
  date?: string;
  format?: string;
}

export type NewEventOptions = {
  /** Title of the event */
  event_name: string;
  /** Description of the event */
  event_description: string;
  /** ISOString representing the start datetime */
  event_start: string;
  /** ISOString representing the end datetime */
  event_end: string;
  /** Apply your timezone to start and end datetime */
  apply_timezone: boolean;
  /** Calendar name this event will be added to */
  calendar: string;
}

export type NextEventValueOptions = {
  timezone: string;
  calendars: VariableManagementCalendar[];
  specificCalendarName: string;
  value: string;
  eventType: 'starts' | 'ends';
  type?: string;
}

export type TriggerSynchronizationErrorOptions = {
  app: App;
  variableMgmt: VariableManagement;
  calendar: string;
  error: Error | string;
  event?: VariableManagementCalendarEvent;
}