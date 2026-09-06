import type Homey from "homey";
import type { Calendar } from "../../types/IcalCalendar.type.js";

type App = {
  getCalendars(): Calendar[];
  getCalendarColors(): Record<string, string>;
  getLanguage(): string;
};

type Req = {
  homey: Homey.App["homey"];
  query: Record<string, string>;
  params: Record<string, string>;
  body: Record<string, unknown>;
};

type ReqNoBody = Omit<Req, "body"> & { body: Record<never, never> };

type CalendarWidgetEvent = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  calendar: string;
  location: string;
  color?: string;
};

const MS_PER_DAY: number = 24 * 60 * 60 * 1000;

export default {
  async getEvents({ homey, query }: ReqNoBody): Promise<CalendarWidgetEvent[]> {
    const app = homey.app as unknown as App;
    const calendars = app.getCalendars();
    if (calendars.length === 0) {
      return [];
    }

    const colors = app.getCalendarColors();

    const daysAhead: number = Math.max(1, Math.min(60, Number(query.daysAhead) || 7));
    const showCalendarName: boolean = query.showCalendarName !== "false";
    const showLocation: boolean = query.showLocation === "true";

    const now: Date = new Date();
    const startOfToday: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const until: Date = new Date(startOfToday.getTime() + daysAhead * MS_PER_DAY);

    const upcoming: CalendarWidgetEvent[] = [];

    for (const calendar of calendars) {
      const color: string | undefined = colors[calendar.name];
      for (const event of calendar.events) {
        const start: Date = event.start.toJSDate();
        const end: Date = event.end.toJSDate();

        if (end < now) {
          continue;
        }

        if (start > until) {
          continue;
        }

        upcoming.push({
          id: event.uid,
          title: event.summary,
          start: event.start.toISO() ?? "",
          end: event.fullDayEvent ? null : (event.end.toISO() ?? null),
          allDay: event.fullDayEvent,
          calendar: showCalendarName ? calendar.name : "",
          location: showLocation ? event.location : "",
          color
        });
      }
    }

    upcoming.sort((a: CalendarWidgetEvent, b: CalendarWidgetEvent) => a.start.localeCompare(b.start));

    return upcoming;
  },

  async getLanguage({ homey }: ReqNoBody): Promise<string> {
    const app = homey.app as unknown as App;
    return app.getLanguage();
  }
};
