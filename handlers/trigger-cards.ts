import type { App } from "homey";

import { capitalize } from "../lib/capitalize.js";
import { getEventsToTrigger } from "../lib/get-events-to-trigger.js";
import { getTokenDuration } from "../lib/get-token-duration.js";
import { getTokenValue } from "../lib/get-token-value.js";
import { updateHitCount } from "../lib/hit-count.js";

import type {
  Calendar,
  EventDuration,
  TriggerChangedCalendarTokens,
  TriggerEvent,
  TriggerFlowTokens,
  TriggerState,
  TriggerSynchronizationTokens
} from "../types/IcalCalendar.type";
import type { TriggerSynchronizationErrorOptions } from "../types/Options.type";
import type { VariableManagement } from "../types/VariableMgmt.type";

import { isEventOngoing } from "./conditions.js";

const getErrorMessage = (error: Error | string): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: error
  };

  /*if (typeof error === 'string') {
    return { message: error }
  }
  if (error.data && typeof error.data === 'string') {
    if (error.stack) {
      return { message: error.data, stack: error.stack }
    }
    return { message: error.data }
  }
  if (error.data && error.data.message && typeof error.data.message === 'string') {
    if (error.data.stack) {
      return { message: error.data.message, stack: error.data.stack }
    }
    return { message: error.data.message }
  }
  if (error.message && typeof error.message === 'string') {
    if (error.stack) {
      return { message: error.message, stack: error.stack }
    }
    return { message: error.message }
  }

  app.log('getErrorMessage: Error is of type', typeof error)
  return { message: error }*/
};

export const triggerSynchronizationError = async (options: TriggerSynchronizationErrorOptions): Promise<void> => {
  const { app, variableMgmt, calendar, error, event } = options;

  try {
    const { message, stack } = getErrorMessage(error);
    app.log(
      `triggerSynchronizationError: Triggering on '${calendar}' ${event ? `for event '${event.summary}' (${event.uid})` : "on load"}`,
      "-",
      message,
      `${stack ? `-> ${stack}` : ""}`
    );

    const tokens: TriggerSynchronizationTokens = {
      calendar_name: calendar,
      calendar_error: message,
      on_calendar_load: event === undefined || event === null,
      on_event_load: event !== undefined && event !== null,
      event_name: event?.summary ?? "",
      event_uid: event?.uid ?? ""
    };
    app.log("triggerSynchronizationError: Triggering 'synchronization_error' with tokens :", tokens);

    await app.homey.flow.getTriggerCard("synchronization_error").trigger(tokens);
    app.log("triggerSynchronizationError: Triggered 'synchronization_error'");

    updateHitCount(app, variableMgmt, "synchronization_error");
  } catch (err) {
    app.error('[ERROR] triggerSynchronizationError: Failed to trigger "synchronization_error" :', err);
  }
};

export const triggerChangedCalendars = async (
  app: App,
  variableMgmt: VariableManagement,
  calendars: Calendar[]
): Promise<void> => {
  const triggerAllValues: boolean = app.homey.settings.get(variableMgmt.setting.triggerAllChangedEventTypes);

  if (!triggerAllValues) {
    app.log(`triggerChangedCalendars: ${triggerAllValues} -- Only triggering first change of a changed event`);
  } else {
    app.log(`triggerChangedCalendars: ${triggerAllValues} -- Triggering all changes of a changed event`);
  }

  if (!variableMgmt.dateTimeFormat) {
    app.error(
      "[ERROR] triggerChangedCalendars: dateTimeFormat is not set in variableMgmt. Aborting triggering changed calendar events."
    );
    return;
  }

  try {
    for await (const calendar of calendars) {
      for await (const event of calendar.events) {
        if (!event.changed) {
          app.error(
            `[ERROR] triggerChangedCalendars: Event '${event.uid}' in calendar '${calendar.name}' has no 'changed' properties. Skipping event`
          );
          continue;
        }

        const eventDuration: EventDuration = getTokenDuration(app, event);

        for await (const changed of event.changed) {
          const tokens: TriggerChangedCalendarTokens = {
            event_name: getTokenValue(event.summary),
            event_calendar_name: calendar.name,
            event_type: changed.type,
            event_prev_value: getTokenValue(changed.previousValue),
            event_new_value: getTokenValue(changed.newValue),
            event_was_ongoing: event.oldEvent
              ? isEventOngoing(app, app.homey.clock.getTimezone(), [event.oldEvent], "changedEvent")
              : false,
            event_ongoing: isEventOngoing(app, app.homey.clock.getTimezone(), [event], "changedEvent"),
            event_start_date: event.start.format(variableMgmt.dateTimeFormat.long),
            event_start_time: event.start.format(variableMgmt.dateTimeFormat.time),
            event_end_date: event.end.format(variableMgmt.dateTimeFormat.long),
            event_end_time: event.end.format(variableMgmt.dateTimeFormat.time),
            event_duration_readable: eventDuration.duration,
            event_duration: eventDuration.durationMinutes
          };

          const changedCalendarTriggerCards: { id: string; useState: boolean }[] = [
            {
              id: "event_changed",
              useState: false
            },
            {
              id: "event_changed_calendar",
              useState: true
            }
          ];

          for await (const changedCalendarTriggerCard of changedCalendarTriggerCards) {
            const state: TriggerState = { calendarName: calendar.name };

            try {
              if (!changedCalendarTriggerCard.useState) {
                await app.homey.flow.getTriggerCard(changedCalendarTriggerCard.id).trigger(tokens);
                app.log(`Triggered '${changedCalendarTriggerCard.id}' on '${event.uid}' for type ${changed.type}`);
                updateHitCount(app, variableMgmt, changedCalendarTriggerCard.id);
                continue;
              }

              // NOTE: hitCount is updated in the listeners for triggers with state
              await app.homey.flow.getTriggerCard(changedCalendarTriggerCard.id).trigger(tokens, state);
            } catch (error) {
              if (changedCalendarTriggerCard.useState) {
                app.error(
                  `[ERROR] triggerChangedCalendars: '${changedCalendarTriggerCard.id}' failed to trigger on '${event.uid}' for type ${changed.type} with state`,
                  state,
                  ":",
                  error
                );
              } else {
                app.error(
                  `[ERROR] triggerChangedCalendars: '${changedCalendarTriggerCard.id}' failed to trigger on '${event.uid}' for type ${changed.type} :`,
                  error
                );
              }

              await triggerSynchronizationError({
                app,
                variableMgmt,
                calendar: calendar.name,
                error: error as Error | string,
                event
              });
            }
          }

          if (!triggerAllValues) {
            break;
          }
        }
      }
    }
  } catch (err) {
    app.error("[ERROR] triggerChangedCalendars: Failed to trigger changed calendar events :", err);
  }
};

export const triggerEvents = async (
  app: App,
  variableMgmt: VariableManagement,
  timezone: string,
  event?: TriggerEvent
): Promise<void> => {
  if (!variableMgmt.calendars) {
    app.error("[ERROR] triggerEvents: variableMgmt.calendars is not set. Aborting triggering events.");
    return;
  }

  const events: TriggerEvent[] = event ? [event] : getEventsToTrigger(app, variableMgmt.calendars, timezone);

  for await (const eventTrigger of events) {
    const { calendarName, event, triggerId, state } = eventTrigger;

    try {
      // add tokens for event
      const eventDuration: EventDuration = getTokenDuration(app, event);
      const tokens: TriggerFlowTokens = {
        event_name: getTokenValue(event.summary),
        event_description: getTokenValue(event.description),
        event_location: getTokenValue(event.location),
        event_duration_readable: eventDuration.duration,
        event_duration: eventDuration.durationMinutes,
        event_calendar_name: calendarName,
        event_status: event.freeBusy || "",
        event_meeting_url: event.meetingUrl || ""
      };

      if (["event_added", "event_added_calendar"].includes(triggerId)) {
        if (!variableMgmt.dateTimeFormat) {
          app.error(
            "[ERROR] triggerEvents: dateTimeFormat is not set in variableMgmt. Aborting triggering added event."
          );
          return;
        }

        tokens.event_start_date = event.start.format(variableMgmt.dateTimeFormat.long);
        tokens.event_start_time = event.start.format(variableMgmt.dateTimeFormat.time);
        tokens.event_end_date = event.end.format(variableMgmt.dateTimeFormat.long);
        tokens.event_end_time = event.end.format(variableMgmt.dateTimeFormat.time);
        tokens.event_weekday_readable = capitalize(event.start.format("dddd"));
        tokens.event_month_readable = capitalize(event.start.format("MMMM"));
        tokens.event_date_of_month = event.start.get("date");
      }

      // trigger flow card
      if (!state) {
        try {
          await app.homey.flow.getTriggerCard(triggerId).trigger(tokens);
          app.log(`triggerEvents: Triggered '${triggerId}' without state on '${event.uid}'`);
          updateHitCount(app, variableMgmt, triggerId);
        } catch (error) {
          app.error(`[ERROR] triggerEvents: '${triggerId}' without state failed to trigger on '${event.uid}':`, error);

          await triggerSynchronizationError({
            app,
            variableMgmt,
            calendar: calendarName,
            error: error as Error | string,
            event
          });
        }

        continue;
      }

      try {
        // NOTE: hitCount is updated in the listeners for triggers with state
        await app.homey.flow.getTriggerCard(triggerId).trigger(tokens, state);
      } catch (error) {
        app.error(
          `[ERROR] triggerEvents: '${triggerId}' with state`,
          state,
          `failed to trigger on '${event.uid}':`,
          error
        );

        await triggerSynchronizationError({
          app,
          variableMgmt,
          calendar: calendarName,
          error: error as Error | string,
          event
        });
      }
    } catch (err) {
      app.error(`[ERROR] triggerEvents: Failed to trigger event '${event.uid}' from '${calendarName}':`, err);
    }
  }
};
