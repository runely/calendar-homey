import { App, FlowCard } from "homey";

import { filterByCalendar } from './filter-by.js';

import { VariableManagement, VariableManagementCalendar } from "../types/VariableMgmt.type";

export const calendarAutocomplete = (app: App, variableMgmt: VariableManagement, query: string): FlowCard.ArgumentAutocompleteResults => {
  if (!variableMgmt.calendars || variableMgmt.calendars.length === 0) {
    app.log('[WARN] calendarAutocomplete: Calendars not set yet. Nothing to show...');
    return [];
  }

  if (query) {
    const filteredCalendar: VariableManagementCalendar[] = filterByCalendar(variableMgmt.calendars, query) || [];
    return filteredCalendar.map((calendar: VariableManagementCalendar) => {
      return { id: calendar.name, name: calendar.name };
    });
  }

  return variableMgmt.calendars.map((calendar: VariableManagementCalendar) => {
    return { id: calendar.name, name: calendar.name };
  });
}
