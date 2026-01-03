import type { Moment } from "moment";

import type { NextEventValueOptions } from "../types/Options.type";
import type {
  ExtCalendarEvent,
  VariableManagementCalendar,
  VariableManagementCalendarEvent
} from "../types/VariableMgmt.type";

import { getMomentNow } from "./moment-datetime.js";

const typeContaining = (type: string, event: VariableManagementCalendarEvent, value: string): boolean => {
  if (!(type in event)) {
    return false;
  }

  const keyIndex: number = Object.keys(event).indexOf(type);
  const eventValue = Object.values(event)[keyIndex];
  if (typeof eventValue !== "string") {
    return false;
  }

  return eventValue.toLowerCase().includes(value.toLowerCase());
};

export const getNextEventValue = (options: NextEventValueOptions): ExtCalendarEvent | null => {
  const { timezone, calendars, specificCalendarName, value, eventType, type } = options;
  const types: string[] = ["summary"];
  const { momentNowRegular, momentNowUtcOffset } = getMomentNow(timezone);
  let minutesUntil: number = 1057885015800000;
  let nextEvent: ExtCalendarEvent | null = null;

  calendars.forEach((calendar: VariableManagementCalendar) => {
    if (specificCalendarName !== calendar.name) {
      return;
    }

    const calendarEvents: VariableManagementCalendarEvent[] = calendar.events.filter(
      (event: VariableManagementCalendarEvent) => {
        if (type) {
          return typeContaining(type, event, value);
        }

        return types.map((t: string) => typeContaining(t, event, value)).includes(true);
      }
    );

    calendarEvents.forEach((event: VariableManagementCalendarEvent) => {
      const now: Moment = event.fullDayEvent || event.skipTZ ? momentNowUtcOffset : momentNowRegular;
      const diff: number = Math.round((eventType === "starts" ? event.start : event.end).diff(now, "minutes", true));

      if (!(diff >= 0 && diff < minutesUntil)) {
        return;
      }

      minutesUntil = diff;
      nextEvent = {
        ...event,
        calendarName: calendar.name
      };
    });
  });

  return nextEvent;
};
