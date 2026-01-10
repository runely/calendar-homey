import type { App, FlowCard } from "homey";

import type { AppTests } from "../types/Homey.type";
import type { Calendar, VariableManagement } from "../types/VariableMgmt.type";

import { filterByCalendar } from "./filter-by.js";

export const calendarAutocomplete = (
  app: App | AppTests,
  variableMgmt: VariableManagement,
  query: string | undefined
): FlowCard.ArgumentAutocompleteResults => {
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
