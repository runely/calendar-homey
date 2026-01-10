import type { FilterMatcher, FilterProperty } from "../types/IcalCalendar.type";
import type { Calendar, CalendarEvent } from "../types/VariableMgmt.type";

export const filterByProperty = (
  oldCalendars: Calendar[],
  query: string,
  prop: FilterProperty,
  matcher: FilterMatcher = "contains"
): Calendar[] => {
  const calendars: Calendar[] = [];

  oldCalendars.forEach((calendar: Calendar) => {
    calendars.push({
      ...calendar,
      events: calendar.events.filter((event: CalendarEvent) => {
        if (!(prop in event) || !event[prop]) {
          return false;
        }

        if (matcher === "equal") {
          return event[prop] === query;
        }

        if (matcher === "contains") {
          return event[prop].toLowerCase().includes(query.toLowerCase());
        }

        if (matcher === "starts with") {
          return event[prop].toLowerCase().startsWith(query.toLowerCase());
        }

        if (matcher === "ends with") {
          return event[prop].toLowerCase().endsWith(query.toLowerCase());
        }

        return false;
      })
    });
  });

  return calendars;
};

export const filterByCalendar = (calendars: Calendar[], name: string = ""): Calendar[] => {
  return calendars.filter((calendar: Calendar) => calendar.name.toLowerCase().includes(name.toLowerCase()));
};

export const filterBySummary = (
  oldCalendars: Calendar[],
  query: string,
  matcher: FilterMatcher = "contains"
): Calendar[] => {
  return filterByProperty(oldCalendars, query, "summary", matcher);
};

export const filterByDescription = (
  oldCalendars: Calendar[],
  query: string,
  matcher: FilterMatcher = "contains"
): Calendar[] => {
  return filterByProperty(oldCalendars, query, "description", matcher);
};

export const filterByLocation = (
  oldCalendars: Calendar[],
  query: string = "",
  matcher: FilterMatcher = "contains"
): Calendar[] => {
  return filterByProperty(oldCalendars, query, "location", matcher);
};

export const filterByUID = (oldCalendars: Calendar[], uid: string): Calendar[] => {
  return filterByProperty(oldCalendars, uid, "uid", "equal");
};
