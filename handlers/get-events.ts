import type { App, FlowToken } from "homey";
import { DateTime } from "luxon";
import iCal, { type CalendarResponse } from "node-ical";

import { filterUpdatedCalendars } from "../lib/filter-updated-calendars.js";
import {
  generateNextEventTokens,
  generatePerCalendarTokens,
  generateTokens
} from "../lib/generate-token-configuration.js";
import { getActiveEvents } from "../lib/get-active-events.js";
import { getEventUids } from "../lib/get-event-uids.js";
import { getFallbackUri } from "../lib/get-fallback-uri.js";
import { getNewEvents } from "../lib/get-new-events.js";
import { getLocalActiveEvents, getLocalEvents, saveLocalEvents } from "../lib/local-events.js";
import { getZonedDateTime } from "../lib/luxon-fns";
import { sortCalendarsEvents } from "../lib/sort-calendars.js";

import type {
  Calendar,
  CalendarEvent,
  CalendarEventExtended,
  CalendarEventUid,
  CalendarMetaData,
  IcalSettingEntry,
  LocalEvent,
  LocalJsonEvent
} from "../types/IcalCalendar.type";
import type { SettingEventLimit, VariableManagement } from "../types/VariableMgmt.type";

import { triggerChangedCalendars, triggerEvents, triggerSynchronizationError } from "./trigger-cards.js";

const getWorkTime = (start: Date, end: Date): string => {
  const seconds: number = (end.getTime() - start.getTime()) / 1000;
  if (seconds > 60) {
    return `${seconds / 60} minutes`;
  }

  return `${seconds} seconds`;
};

export const getEvents = async (
  app: App,
  variableMgmt: VariableManagement,
  reregisterCalendarTokens: boolean = false
): Promise<string[]> => {
  if (!variableMgmt) {
    app.error("[ERROR] getEvents: Variable management initialization failed. App halted!");
    throw new Error("Variable management initialization failed");
  }

  variableMgmt.gettingEventsRunning = true;

  // errors to return
  const errors: string[] = [];
  // get URI from settings
  const calendars: IcalSettingEntry[] = app.homey.settings.get(variableMgmt.setting.icalUris) as IcalSettingEntry[];

  // calendars not entered in settings page yet
  if (!calendars || calendars.length === 0) {
    app.log("[WARN] getEvents: Calendars has not been set in Settings yet");
    variableMgmt.gettingEventsRunning = false;
    variableMgmt.gettingEventsLastRun = new Date();

    if (variableMgmt.jobs.update) {
      app.log(`getEvents: Next update in UTC: ${variableMgmt.jobs.update.nextRun()}`);
    }

    return [];
  }

  // is debug logAllEvents activated
  const logAllEvents: boolean = (app.homey.settings.get(variableMgmt.setting.logAllEvents) as boolean) ?? false;
  // get event limit from settings or use the default
  const eventLimit: SettingEventLimit =
    (app.homey.settings.get(variableMgmt.setting.eventLimit) as SettingEventLimit) ||
    variableMgmt.setting.eventLimitDefault;
  const oldCalendarsUidsStorage: string | null =
    (app.homey.settings.get(variableMgmt.storage.eventUids) as string) || null;
  const oldCalendarsUids: CalendarEventUid[] =
    oldCalendarsUidsStorage && oldCalendarsUidsStorage.length > 0
      ? (JSON.parse(oldCalendarsUidsStorage) as CalendarEventUid[])
      : [];
  app.log("getEvents: oldCalendarsUids --", oldCalendarsUids.length);
  const calendarsEvents: Calendar[] = [];
  const calendarsMetadata: CalendarMetaData[] = [];

  // get ical events
  app.log(`getEvents: Getting ${calendars.length} calendars in timezone '${app.homey.clock.getTimezone()}'`);
  if (logAllEvents) {
    app.log("getEvents: Debug - logAllEvents active");
  }
  const retrieveCalendarsStart: Date = new Date();

  for (let i: number = 0; i < calendars.length; i++) {
    const { name } = calendars[i];
    let { uri } = calendars[i];
    if (uri === "") {
      app.log(`[WARN] getEvents: Calendar '${name}' has empty uri. Skipping...`);
      continue;
    }

    if (!/(http|https|webcal):\/\/.+/gi.exec(uri)) {
      app.log(`[WARN] getEvents: Uri for calendar '${name}' is invalid. Skipping...`);
      const failed: string = `Uri for calendar '${name}' is invalid. Missing "http://", "https://" or "webcal://"`;
      calendars[i] = {
        name,
        uri,
        failed
      };
      errors.push(failed);
      app.homey.settings.set(variableMgmt.setting.icalUris, calendars);
      app.log(`[WARN] getEvents: Added 'error' setting value to calendar '${name}' : ${failed}`);
      try {
        await triggerSynchronizationError({ app, variableMgmt, calendar: name, error: calendars[i].failed as string });
      } catch (error) {
        app.error(`[ERROR] getEvents: Failed to trigger synchronization error for calendar '${name}' ->`, error);
      }
      continue;
    }

    if (/webcal:\/\//gi.exec(uri)) {
      uri = uri.replace(/webcal:\/\//gi, "https://");
      app.log(`getEvents: Calendar '${name}': webcal:// found and replaced with https://`);
      calendars[i] = {
        name,
        uri
      };
      app.homey.settings.set(variableMgmt.setting.icalUris, calendars);
    }

    app.log(`getEvents: Getting events (${eventLimit.value} ${eventLimit.type} ahead) for calendar`, name, uri);
    const retrieveCalendarStart: Date = new Date();

    let data: CalendarResponse | null = null;
    try {
      data = await iCal.fromURL(uri);
    } catch (error) {
      const { fallbackUri } = getFallbackUri(app, uri);
      const errorString: string | undefined = error instanceof Error ? `${error.message} -> ${error.stack}` : undefined;
      app.error(`[ERROR] getEvents: Failed to get events for calendar '${name}' with uri '${uri}' ->`, error);
      try {
        app.log(
          `[WARN] getEvents: Getting events (${eventLimit.value} ${eventLimit.type} ahead) for calendar`,
          name,
          "with fallback uri",
          fallbackUri
        );
        data = await iCal.fromURL(uri);
      } catch (innerError) {
        const fallbackErrorString: string | undefined =
          innerError instanceof Error ? `${innerError.message} -> ${innerError.stack}` : undefined;
        app.error(
          `[ERROR] getEvents: Failed to get events for calendar '${name}' with fallback uri '${fallbackUri}' ->`,
          innerError
        );

        errors.push(
          `Failed to get events for calendar '${name}' with uri '${uri}' (${errorString}) and '${fallbackUri}' (${fallbackErrorString})`
        );
        try {
          await triggerSynchronizationError({ app, variableMgmt, calendar: name, error: innerError as Error | string });
        } catch (triggerError) {
          app.error(
            `[ERROR] getEvents: Failed to trigger synchronization error for calendar '${name}' ->`,
            triggerError
          );
        }
        calendarsMetadata.push({
          name,
          eventCount: 0,
          lastFailedSync: getZonedDateTime(DateTime.now(), app.homey.clock.getTimezone()).toISO()
        });

        // set a failed setting value to show an error message on settings page
        calendars[i] = {
          name,
          uri,
          failed: fallbackErrorString
        };
        app.homey.settings.set(variableMgmt.setting.icalUris, calendars);
        app.log(`[WARN] getEvents: Added 'error' setting value to calendar '${name}'`);
      }
    }

    if (data) {
      // remove failed setting if it exists for calendar
      if (calendars[i].failed) {
        calendars[i] = {
          name,
          uri
        };
        app.homey.settings.set(variableMgmt.setting.icalUris, calendars);
        app.log(`getEvents: Removed 'error' setting value from calendar '${name}'`);
      }

      const retrieveCalendarEnd: Date = new Date();
      try {
        app.log(
          `getEvents: Events for calendar '${name}' retrieved. Total entry count for calendar: ${Object.keys(data).length}. Time used: ${getWorkTime(retrieveCalendarStart, retrieveCalendarEnd)}`
        );
        const activeEvents: CalendarEvent[] = await getActiveEvents({
          app,
          variableMgmt,
          timezone: app.homey.clock.getTimezone(),
          data,
          eventLimit,
          calendarName: name,
          logAllEvents
        });
        app.log(
          `getEvents: Active events for calendar '${name}' updated. Event count: ${activeEvents.length}. Time used: ${getWorkTime(retrieveCalendarEnd, new Date())}`
        );
        calendarsEvents.push({ name, events: activeEvents });
        calendarsMetadata.push({
          name,
          eventCount: activeEvents.length,
          lastSuccessfullSync: getZonedDateTime(DateTime.now(), app.homey.clock.getTimezone()).toISO()
        });
      } catch (error) {
        const errorString: string | undefined =
          error instanceof Error ? `${error.message} -> ${error.stack}` : undefined;
        app.error(
          `[ERROR] getEvents: Failed to get active events for calendar '${name}'. Time used: ${getWorkTime(retrieveCalendarEnd, new Date())} ->`,
          error
        );
        errors.push(`Failed to get active events for calendar '${name}' : ${errorString})`);
        try {
          await triggerSynchronizationError({ app, variableMgmt, calendar: name, error: error as Error | string });
        } catch (triggerError) {
          app.error(
            `[ERROR] getEvents: Failed to trigger synchronization error for calendar '${name}' ->`,
            triggerError
          );
        }
        calendarsMetadata.push({
          name,
          eventCount: 0,
          lastFailedSync: getZonedDateTime(DateTime.now(), app.homey.clock.getTimezone()).toISO()
        });

        // set a failed setting value to show an error message on settings page
        calendars[i] = {
          name,
          uri,
          failed: errorString
        };
        app.homey.settings.set(variableMgmt.setting.icalUris, calendars);
        app.log(`[WARN] getEvents: Added 'error' setting value to calendar '${name}'`);
      }
    } else {
      app.log(
        `[WARN] getEvents: Calendar '${name}' not reachable! Giving up... Time used: ${getWorkTime(retrieveCalendarStart, new Date())}`
      );
    }
  }

  try {
    if (variableMgmt.calendars && variableMgmt.calendars.length > 0 && calendarsEvents.length > 0) {
      const updatedCalendars: Calendar[] = filterUpdatedCalendars({
        app,
        variableMgmt,
        oldCalendars: variableMgmt.calendars,
        newCalendars: calendarsEvents
      });
      await triggerChangedCalendars(app, variableMgmt, updatedCalendars);
    }
  } catch (error) {
    app.error("[ERROR] getEvents: Failed to filter/trigger changed calendars ->", error);

    try {
      await triggerSynchronizationError({
        app,
        variableMgmt,
        calendar: "Changed calendars",
        error: error as Error | string
      });
    } catch (triggerError) {
      app.error("[ERROR] getEvents: Failed to trigger synchronization error for changed calendars ->", triggerError);
    }
  }

  const newCalendarsUids: CalendarEventUid[] = getEventUids(calendarsEvents);
  app.log("getEvents: newCalendarsUids --", newCalendarsUids.length);
  const newlyAddedEvents: CalendarEventExtended[] = getNewEvents({
    timezone: app.homey.clock.getTimezone(),
    oldCalendarsUids,
    newCalendarsUids,
    calendarsEvents,
    app
  });
  app.log("getEvents: newlyAddedEvents --", newlyAddedEvents.length);
  for await (const event of newlyAddedEvents) {
    await triggerEvents(app, variableMgmt, app.homey.clock.getTimezone(), {
      calendarName: event.calendarName,
      event,
      triggerId: "event_added"
    });
    await triggerEvents(app, variableMgmt, app.homey.clock.getTimezone(), {
      calendarName: event.calendarName,
      event,
      triggerId: "event_added_calendar",
      state: { calendarName: event.calendarName }
    });
  }
  app.homey.settings.set(variableMgmt.storage.eventUids, JSON.stringify(newCalendarsUids));

  // get local events (only the ones that are not started yet or is ongoing)
  const localEventsJSON: string | null = app.homey.settings.get(variableMgmt.storage.localEvents);
  const localEvents: LocalJsonEvent[] = getLocalEvents(
    app,
    localEventsJSON,
    app.homey.clock.getTimezone(),
    logAllEvents
  );
  variableMgmt.localEvents = getLocalActiveEvents({
    timezone: app.homey.clock.getTimezone(),
    events: localEvents,
    eventLimit,
    app,
    logAllEvents
  });

  // save local events returned
  saveLocalEvents(app, variableMgmt, variableMgmt.localEvents);

  // add local events to the correct calendar
  variableMgmt.localEvents.forEach((event: LocalEvent) => {
    const calendar: Calendar | undefined = calendarsEvents.find((c: Calendar) => c.name === event.calendar);
    const calendarEvent: CalendarEvent = event;
    if (calendar) {
      calendar.events.push(calendarEvent);
    }
  });

  variableMgmt.calendars = calendarsEvents;
  variableMgmt.calendars = sortCalendarsEvents(variableMgmt.calendars);
  const allEventCount: number = variableMgmt.calendars.reduce((curr: number, acu: Calendar) => {
    curr += acu.events.length;
    return curr;
  }, 0);
  app.log(
    `getEvents: All events count: ${allEventCount}. Time used: ${getWorkTime(retrieveCalendarsStart, new Date())}`
  );
  app.homey.settings.set(variableMgmt.storage.calendarsMetadata, JSON.stringify(calendarsMetadata));

  if (reregisterCalendarTokens) {
    // unregister calendar tokens
    if (variableMgmt.calendarTokens.length > 0) {
      app.log("getEvents: Calendar tokens starting to flush");
      await Promise.all(
        variableMgmt.calendarTokens.map(async (tokenId: string) => {
          try {
            const token: FlowToken = app.homey.flow.getToken(tokenId);
            if (token) {
              app.log(`getEvents: Calendar token '${token.id}' starting to flush`);
              return token.unregister();
            }

            app.log(`[WARN] getEvents: Calendar token '${tokenId}' not found`);
            return Promise.resolve();
          } catch (ex) {
            app.error(`[ERROR] getEvents: Failed to get calendar token '${tokenId}' ->`, ex);
          }
        })
      );
      variableMgmt.calendarTokens = [];
      app.log("getEvents: Calendar tokens flushed");
    }

    // unregister next event with tokens
    if (variableMgmt.nextEventWithTokens.length > 0) {
      app.log("getEvents: Next event with tokens starting to flush");
      await Promise.all(
        variableMgmt.nextEventWithTokens.map(async (tokenId: string) => {
          try {
            const token: FlowToken = app.homey.flow.getToken(tokenId);
            if (token) {
              app.log(`getEvents: Next event with token '${tokenId}' starting to flush`);
              return token.unregister();
            }

            app.log(`[WARN] getEvents: Next event with token '${tokenId}' not found`);
            return Promise.resolve();
          } catch (ex) {
            app.error(`[ERROR] getEvents: Failed to get next event with token '${tokenId}' ->`, ex);
          }
        })
      );
      variableMgmt.nextEventWithTokens = [];
      app.log("getEvents: Next event with tokens flushed");
    }

    // get settings for adding extra tokens
    const nextEventTokensPerCalendar: boolean =
      (app.homey.settings.get(variableMgmt.setting.nextEventTokensPerCalendar) as boolean) || false;

    // register calendar tokens
    if (variableMgmt.calendars && variableMgmt.calendars.length > 0) {
      await Promise.all(
        variableMgmt.calendars.map(async (calendar: Calendar) => {
          if (!variableMgmt) {
            app.error(
              `[ERROR] getEvents: Variable management initialization failed. Calendar '${calendar.name}' won't be used!`
            );
            return Promise.resolve();
          }

          // register today's and tomorrow's events pr calendar
          generateTokens(app, variableMgmt, calendar.name).map(
            async ({ id, type, title }: { id: string; type: string; title: string }) => {
              try {
                if (!variableMgmt) {
                  app.error(
                    `[ERROR] getEvents: Variable management initialization failed. Calendar token '${id}' won't be created!`
                  );
                  return Promise.resolve();
                }

                const token: FlowToken = await app.homey.flow.createToken(id, { type, title, value: "" });
                if (token) {
                  variableMgmt.calendarTokens.push(id);
                  app.log(`getEvents: Created calendar token '${id}'`);
                  return Promise.resolve();
                }

                app.log(`[WARN] getEvents: Calendar token '${id}' not created`);
              } catch (ex) {
                app.error(`[ERROR] getEvents: Failed to create calendar token '${id}' ->`, ex);
              }
              return Promise.resolve();
            }
          );

          // register next event title, next event start, next event start time, next event end date and next event end time pr calendar
          if (nextEventTokensPerCalendar) {
            generatePerCalendarTokens(app, variableMgmt, calendar.name).map(
              async ({ id, type, title }: { id: string; type: string; title: string }) => {
                try {
                  if (!variableMgmt) {
                    app.error(
                      `[ERROR] getEvents: Variable management initialization failed. Per calendar token '${id}' won't be created!`
                    );
                    return Promise.resolve();
                  }

                  const token: FlowToken = await app.homey.flow.createToken(id, { type, title, value: "" });
                  if (token) {
                    variableMgmt.calendarTokens.push(id);
                    app.log(`getEvents: Created per calendar token '${id}'`);
                    return Promise.resolve();
                  }

                  app.log(`[WARN] getEvents: Per calendar token '${id}' not created`);
                } catch (ex) {
                  app.error(`[ERROR] getEvents: Failed to create per calendar token '${id}' ->`, ex);
                }
                return Promise.resolve();
              }
            );
          }
        })
      );

      // register next event with text tokens
      variableMgmt.nextEventWithTokens = [];
      for await (const { id, type, title } of generateNextEventTokens(app, variableMgmt)) {
        try {
          const token: FlowToken = await app.homey.flow.createToken(id, { type, title, value: "" });
          if (token) {
            variableMgmt.nextEventWithTokens.push(id);
            app.log(`getEvents: Created next event with token '${id}'`);
            continue;
          }

          app.log(`[WARN] getEvents: Next event with token '${id}' not created`);
        } catch (ex) {
          app.error(`[ERROR] getEvents: Failed to create next event with token '${id}' ->`, ex);
        }
      }
    }
  }

  variableMgmt.gettingEventsRunning = false;
  variableMgmt.gettingEventsLastRun = new Date();

  if (variableMgmt.jobs.update) {
    app.log(`getEvents: Next update in UTC: ${variableMgmt.jobs.update.nextRun()}`);
  }

  return errors;
};
