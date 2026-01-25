import type { App, FlowToken } from "homey";
import { DateTime } from "luxon";

import { getNextEvent } from "../lib/get-next-event.js";
import { getEventsToday } from "../lib/get-todays-events.js";
import { getTokenDuration } from "../lib/get-token-duration.js";
import { getTokenEvents } from "../lib/get-token-events.js";
import { getEventsTomorrow } from "../lib/get-tomorrows-events.js";
import { getZonedDateTime } from "../lib/luxon-fns";

import type { AppTests, HomeyAppTestsFlowToken, TokenValue } from "../types/Homey.type";
import type { CalendarEventExtended, EventDuration, NextEvent } from "../types/IcalCalendar.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { triggerSynchronizationError } from "./trigger-cards.js";

export const updateToken = async (app: App | AppTests, tokenId: string, value: TokenValue): Promise<void> => {
  try {
    if (value === undefined) {
      app.log(`[WARN] updateToken: Value for token '${tokenId}' is undefined. Setting to empty string.`);
      value = "";
    }

    const token: FlowToken | HomeyAppTestsFlowToken = app.homey.flow.getToken(tokenId);
    if (token) {
      await token.setValue(value);
      return;
    }

    app.log(`[WARN] updateToken: Token with id '${tokenId}' not found`);
  } catch (error) {
    app.error(`[ERROR] updateToken: Failed to update token '${tokenId}' with value: '${value}' ->`, error);
  }
};

const getNextEventByCalendar = (
  app: App,
  variableMgmt: VariableManagement,
  calendarName: string,
  nextEvent: NextEvent | null,
  timezone: string
): NextEvent | null => {
  if (!variableMgmt.calendars) {
    app.error("[ERROR] getNextEventByCalendar: Calendars not set yet.");
    return null;
  }

  if (!nextEvent) {
    // app.log(`getNextEventByCalendar: nextEvent not set. Getting next event for calendar '${calendarName}'`);
    return getNextEvent(timezone, variableMgmt.calendars, calendarName);
  }

  if (nextEvent.calendarName !== calendarName) {
    // app.log(`getNextEventByCalendar: nextEvent already set but for calendar '${nextEvent.calendarName}'. Getting next event for calendar '${calendarName}'`);
    return getNextEvent(timezone, variableMgmt.calendars, calendarName);
  }

  // app.log(`getNextEventByCalendar: nextEvent already set for calendar '${nextEvent.calendarName}' (${calendarName}). Using this one`);
  return nextEvent;
};

export const updateTokens = async (app: App, variableMgmt: VariableManagement, timezone: string): Promise<void> => {
  if (!variableMgmt.calendars) {
    app.error("[ERROR] updateTokens: Calendars not set yet");
    return;
  }

  if (!variableMgmt.dateTimeFormat) {
    app.error("[ERROR] updateTokens: dateTimeFormat not set in variableMgmt");
    return;
  }

  const nextEvent: NextEvent | null = getNextEvent(timezone, variableMgmt.calendars);
  const eventsToday: CalendarEventExtended[] = getEventsToday(timezone, variableMgmt.calendars);
  const eventsTomorrow: CalendarEventExtended[] = getEventsTomorrow(timezone, variableMgmt.calendars);

  let eventDuration: EventDuration | null = null;
  let nextEventStart: string = "";

  if (nextEvent) {
    eventDuration = getTokenDuration(app, nextEvent.event);
    nextEventStart = `Next event happening @ '${nextEvent.event.start}'. `;
  }

  app.log(
    `updateTokens: ${nextEventStart}Updating today tag with ${eventsToday.length} events. Updating tomorrow tag with ${eventsTomorrow.length} events.`
  );

  // loop through flow tokens
  for await (const tokenId of variableMgmt.flowTokens) {
    try {
      if (tokenId === "event_next_title") {
        await updateToken(app, tokenId, nextEvent?.event.summary);
      }

      if (tokenId === "event_next_startdate") {
        await updateToken(app, tokenId, nextEvent?.event.start.toFormat(variableMgmt.dateTimeFormat.long));
      }

      if (tokenId === "event_next_startstamp") {
        if (nextEvent) {
          if (nextEvent.event.dateType === "date-time") {
            await updateToken(app, tokenId, nextEvent.event.start.toFormat(variableMgmt.dateTimeFormat.time));
          }

          if (nextEvent.event.dateType === "date") {
            await updateToken(app, tokenId, "00:00");
          }
        } else {
          await updateToken(app, tokenId, "");
        }
      }

      if (tokenId === "event_next_stopdate") {
        await updateToken(app, tokenId, nextEvent?.event.end.toFormat(variableMgmt.dateTimeFormat.long));
      }

      if (tokenId === "event_next_stopstamp") {
        if (nextEvent) {
          if (nextEvent.event.dateType === "date-time") {
            await updateToken(app, tokenId, nextEvent.event.end.toFormat(variableMgmt.dateTimeFormat.time));
          }

          if (nextEvent.event.dateType === "date") {
            await updateToken(app, tokenId, "00:00");
          }
        } else {
          await updateToken(app, tokenId, "");
        }
      }

      if (tokenId === "event_next_duration") {
        await updateToken(app, tokenId, nextEvent?.event && eventDuration ? eventDuration.duration : "");
      }

      if (tokenId === "event_next_duration_minutes") {
        await updateToken(app, tokenId, nextEvent?.event && eventDuration ? eventDuration.durationMinutes : -1);
      }

      if (tokenId === "event_next_starts_in_minutes") {
        await updateToken(app, tokenId, nextEvent?.event ? nextEvent.startsIn : -1);
      }

      if (tokenId === "event_next_stops_in_minutes") {
        await updateToken(app, tokenId, nextEvent?.event ? nextEvent.endsIn : -1);
      }

      if (tokenId === "event_next_description") {
        await updateToken(app, tokenId, nextEvent?.event.description);
      }

      if (tokenId === "event_next_calendar_name") {
        await updateToken(app, tokenId, nextEvent?.event ? nextEvent.calendarName : "");
      }

      if (tokenId === "events_today_title_stamps") {
        const value: string = getTokenEvents(app, variableMgmt, timezone, eventsToday);
        await updateToken(app, tokenId, value);
      }

      if (tokenId === "events_today_count") {
        await updateToken(app, tokenId, eventsToday.length);
      }

      if (tokenId === "events_tomorrow_title_stamps") {
        const value: string = getTokenEvents(app, variableMgmt, timezone, eventsTomorrow);
        await updateToken(app, tokenId, value);
      }

      if (tokenId === "events_tomorrow_count") {
        await updateToken(app, tokenId, eventsTomorrow.length);
      }

      if (tokenId === "icalcalendar_week_number") {
        await updateToken(app, tokenId, getZonedDateTime(DateTime.now(), timezone).localWeekNumber);
      }
    } catch (error) {
      app.error("[ERROR] updateTokens: Failed to update flow token", tokenId, "->", error);

      triggerSynchronizationError({ app, variableMgmt, calendar: "", error: error as Error | string }).catch(err =>
        app.error("[ERROR] updateTokens: Failed to complete triggerSynchronizationError(...) ->", err)
      );
    }
  }

  // loop through calendar tokens
  let calendarNextEvent: NextEvent | null = null;
  for await (const tokenId of variableMgmt.calendarTokens) {
    try {
      const calendarId: string = tokenId.replace(variableMgmt.calendarTokensPreId, "");
      const calendarName: string = calendarId
        .replace(variableMgmt.calendarTokensPostTodayCountId, "") // this must be replaced before calendarTokensPostTodayId to preserve the whole tag name
        .replace(variableMgmt.calendarTokensPostTodayId, "")
        .replace(variableMgmt.calendarTokensPostTomorrowCountId, "") // this must be replaced before calendarTokensPostTomorrowId to preserve the whole tag name
        .replace(variableMgmt.calendarTokensPostTomorrowId, "")
        .replace(variableMgmt.calendarTokensPostNextTitleId, "")
        .replace(variableMgmt.calendarTokensPostNextStartDateId, "")
        .replace(variableMgmt.calendarTokensPostNextStartTimeId, "")
        .replace(variableMgmt.calendarTokensPostNextEndDateId, "")
        .replace(variableMgmt.calendarTokensPostNextEndTimeId, "")
        .replace(variableMgmt.calendarTokensPostNextDescriptionId, "");
      const calendarType: string = calendarId.replace(`${calendarName}_`, "");
      // app.log(`calendarTokens: Setting token '${calendarType}' for calendar '${calendarName}'`);
      let value: string | number | undefined = "";

      if (calendarType.includes("today")) {
        const calendarEventsToday: CalendarEventExtended[] = getEventsToday(
          timezone,
          variableMgmt.calendars,
          calendarName
        );
        // app.log(`updateTokens: Found '${calendarEventsToday.length}' events for today from calendar '${calendarName}'`);
        if (calendarType === "today") {
          value = getTokenEvents(app, variableMgmt, timezone, calendarEventsToday);
        }

        if (calendarType === "today_count") {
          value = calendarEventsToday.length;
        }
      }

      if (calendarType.includes("tomorrow")) {
        const calendarEventsTomorrow: CalendarEventExtended[] = getEventsTomorrow(
          timezone,
          variableMgmt.calendars,
          calendarName
        );
        // app.log(`updateTokens: Found '${calendarEventsTomorrow.length}' events for tomorrow from calendar '${calendarName}'`);
        if (calendarType === "tomorrow") {
          value = getTokenEvents(app, variableMgmt, timezone, calendarEventsTomorrow);
        }

        if (calendarType === "tomorrow_count") {
          value = calendarEventsTomorrow.length;
        }
      }

      if (
        ["next_title", "next_startdate", "next_starttime", "next_enddate", "next_endtime", "next_description"].includes(
          calendarType
        )
      ) {
        calendarNextEvent = getNextEventByCalendar(app, variableMgmt, calendarName, calendarNextEvent, timezone);

        if (calendarType === "next_title") {
          value = calendarNextEvent?.event ? calendarNextEvent.event.summary : "";
        }

        if (calendarType === "next_startdate") {
          value = calendarNextEvent?.event
            ? calendarNextEvent.event.start.toFormat(variableMgmt.dateTimeFormat.long)
            : "";
        }

        if (calendarType === "next_starttime") {
          if (calendarNextEvent) {
            if (calendarNextEvent.event.dateType === "date-time") {
              value = calendarNextEvent.event.start.toFormat(variableMgmt.dateTimeFormat.time);
            }

            if (calendarNextEvent.event.dateType === "date") {
              value = "00:00";
            }
          } else {
            value = "";
          }
        }

        if (calendarType === "next_enddate") {
          value = calendarNextEvent?.event
            ? calendarNextEvent.event.end.toFormat(variableMgmt.dateTimeFormat.long)
            : "";
        }

        if (calendarType === "next_endtime") {
          if (calendarNextEvent) {
            if (calendarNextEvent.event.dateType === "date-time") {
              value = calendarNextEvent.event.end.toFormat(variableMgmt.dateTimeFormat.time);
            }

            if (calendarNextEvent.event.dateType === "date") {
              value = "00:00";
            }
          } else {
            value = "";
          }
        }

        if (calendarType === "next_description") {
          value = calendarNextEvent?.event.description;
        }
      }

      await updateToken(app, tokenId, value);
    } catch (error) {
      app.error("[ERROR] updateTokens: Failed to update calendar token", tokenId, "->", error);

      triggerSynchronizationError({ app, variableMgmt, calendar: "", error: error as Error | string }).catch(err =>
        app.error("[ERROR] updateTokens: Failed to complete triggerSynchronizationError(...) ->", err)
      );
    }
  }
};

export const updateNextEventWithTokens = async (
  app: App,
  variableMgmt: VariableManagement,
  event: CalendarEventExtended
): Promise<void> => {
  if (!variableMgmt.dateTimeFormat) {
    app.error("[ERROR] updateNextEventWithTokens: dateTimeFormat not set in variableMgmt");
    return;
  }

  try {
    app.log(`updateNextEventWithTokens: Using event: '${event.summary}' - '${event.start}' in '${event.calendarName}'`);

    for await (const tokenId of variableMgmt.nextEventWithTokens) {
      try {
        if (tokenId.endsWith("_title")) {
          await updateToken(app, tokenId, event.summary);
        }

        if (tokenId.endsWith("_startdate")) {
          await updateToken(app, tokenId, event.start.toFormat(variableMgmt.dateTimeFormat.long));
        }

        if (tokenId.endsWith("_starttime")) {
          await updateToken(app, tokenId, event.start.toFormat(variableMgmt.dateTimeFormat.time));
        }

        if (tokenId.endsWith("_enddate")) {
          await updateToken(app, tokenId, event.end.toFormat(variableMgmt.dateTimeFormat.long));
        }

        if (tokenId.endsWith("_endtime")) {
          await updateToken(app, tokenId, event.end.toFormat(variableMgmt.dateTimeFormat.time));
        }

        if (tokenId.endsWith("_description")) {
          await updateToken(app, tokenId, event.description);
        }
      } catch (error) {
        app.error("[ERROR] updateNextEventWithTokens: Failed to update next event with token", tokenId, "->", error);

        triggerSynchronizationError({
          app,
          variableMgmt,
          calendar: event.calendarName,
          error: error as Error | string,
          event
        }).catch(err =>
          app.error(
            "[ERROR] updateTokens/updateNextEventWithTokens: Failed to complete triggerSynchronizationError(...) ->",
            err
          )
        );
      }
    }
  } catch (error) {
    app.error("[ERROR] updateNextEventWithTokens: Failed to update next event with tokens ->", error);
  }
};
