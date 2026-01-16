import type { App } from "homey";
import type { CalendarResponse, VEvent } from "node-ical";

import type { AppTests } from "./Homey.type";
import type { Calendar, CalendarEvent, CalendarEventUid, LocalJsonEvent } from "./IcalCalendar.type";
import type { SettingEventLimit, VariableManagement } from "./VariableMgmt.type";

export type FilterUpdatedCalendarsOptions = {
  app: App | AppTests;
  variableMgmt: VariableManagement;
  oldCalendars: Calendar[];
  newCalendars: Calendar[];
};

export type GetActiveEventsOptions = {
  app: App | AppTests;
  variableMgmt: VariableManagement;
  timezone: string;
  data: CalendarResponse;
  eventLimit: SettingEventLimit;
  calendarName: string;
  logAllEvents: boolean;
};

export type GetLocalActiveEventsOptions = {
  timezone: string;
  events: LocalJsonEvent[];
  eventLimit: SettingEventLimit;
  app: App | AppTests;
  logAllEvents: boolean;
};

export type GetNewEventsOptions = {
  timezone: string;
  oldCalendarsUids: CalendarEventUid[];
  newCalendarsUids: CalendarEventUid[];
  calendarsEvents: Calendar[];
  app: App | AppTests;
};

export type MomentDateTimeOptions = {
  timezone?: string;
  date?: string;
  format?: string;
};

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
};

export type NextEventValueOptions = {
  timezone: string;
  calendars: Calendar[];
  specificCalendarName: string;
  value: string;
  eventType: "starts" | "ends";
  type?: string;
};

export type TriggerSynchronizationErrorOptions = {
  app: App | AppTests;
  variableMgmt: VariableManagement;
  calendar: string;
  error: Error | string;
  event?: CalendarEvent | VEvent;
};
