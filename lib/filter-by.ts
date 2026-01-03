import { FilterMatcher, FilterProperty } from "../types/IcalCalendar.type";
import { VariableManagementCalendar, VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

export const filterByProperty = (oldCalendars: VariableManagementCalendar[], query: string, prop: FilterProperty, matcher: FilterMatcher = 'contains'): VariableManagementCalendar[] => {
  const calendars: VariableManagementCalendar[] = [];

  oldCalendars.forEach((calendar: VariableManagementCalendar) => {
    calendars.push({
      ...calendar,
      events: calendar.events.filter((event: VariableManagementCalendarEvent) => {
        if (!(prop in event) || !event[prop]) {
          return false;
        }

        if (matcher === 'equal') {
          return event[prop] === query;
        }

        if (matcher === 'contains') {
          return event[prop].toLowerCase().includes(query.toLowerCase());
        }

        if (matcher === 'starts with') {
          return event[prop].toLowerCase().startsWith(query.toLowerCase());
        }

        if (matcher === 'ends with') {
          return event[prop].toLowerCase().endsWith(query.toLowerCase());
        }

        return false;
      })
    });
  });

  return calendars;
}

export const filterByCalendar = (calendars: VariableManagementCalendar[], name: string = ''): VariableManagementCalendar[] => {
  return calendars.filter((calendar: VariableManagementCalendar) => (calendar.name.toLowerCase().includes(name.toLowerCase())));
}

export const filterBySummary = (oldCalendars: VariableManagementCalendar[], query: string, matcher: FilterMatcher = 'contains'): VariableManagementCalendar[] => {
  return filterByProperty(oldCalendars, query, 'summary', matcher);
}

export const filterByDescription = (oldCalendars: VariableManagementCalendar[], query: string, matcher: FilterMatcher = 'contains'): VariableManagementCalendar[] => {
  return filterByProperty(oldCalendars, query, 'description', matcher);
}

export const filterByLocation = (oldCalendars: VariableManagementCalendar[], query: string = '', matcher: FilterMatcher = 'contains'): VariableManagementCalendar[] => {
  return filterByProperty(oldCalendars, query, 'location', matcher);
}

export const filterByUID = (oldCalendars: VariableManagementCalendar[], uid: string): VariableManagementCalendar[] => {
  return filterByProperty(oldCalendars, uid, 'uid', 'equal');
}
