import type { App } from "homey";

import type { AppTests, ArgumentAutoCompleteResult } from "../types/Homey.type";
import type { Calendar } from "../types/IcalCalendar.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { filterByCalendar } from "./filter-by.js";

export const calendarAutocomplete = (
  app: App | AppTests,
  variableMgmt: VariableManagement,
  query: string | undefined
): ArgumentAutoCompleteResult[] => {
  if (!variableMgmt.calendars || variableMgmt.calendars.length === 0) {
    app.log("[WARN] calendarAutocomplete: Calendars not set yet. Nothing to show...");
    return [];
  }

  if (query) {
    const filteredCalendar: Calendar[] = filterByCalendar(variableMgmt.calendars, query) || [];
    return filteredCalendar.map((calendar: Calendar) => {
      return { id: calendar.name, name: calendar.name };
    });
  }

  return variableMgmt.calendars.map((calendar: Calendar) => {
    return { id: calendar.name, name: calendar.name };
  });
};
