import { App, FlowCard, FlowCardTrigger } from "homey";

import { convertToMinutes } from '../lib/convert-to-minutes.js';
import { filterByCalendar } from '../lib/filter-by.js';
import { updateHitCount, setupHitCount } from '../lib/hit-count.js';

import {VariableManagement, VariableManagementCalendar} from "../types/VariableMgmt.type";

export const setupTriggers = (app: App, variableMgmt: VariableManagement): void => {
  // add minutes in trigger listeners
  for (const triggerId of ['event_starts_in', 'event_stops_in']) {
    app.homey.flow.getTriggerCard(triggerId).registerRunListener((args, state) => {
      const minutes: number = convertToMinutes(args.when, args.type);
      const willTrigger: boolean = minutes === state.when;
      if (willTrigger) {
        app.log(`Triggered '${triggerId}'. With minutes: ${minutes}. With state: ${state}. With args: ${args}`);
        updateHitCount(app, variableMgmt, triggerId, args);
      }
      return willTrigger;
    });
  }

  // add calendar trigger listeners
  for (const triggerId of ['event_starts_calendar', 'event_stops_calendar', 'event_added_calendar', 'event_changed_calendar']) {
    const eventCalendar: FlowCardTrigger = app.homey.flow.getTriggerCard(triggerId);
    eventCalendar.registerRunListener((args, state) => {
      const willTrigger: boolean = args.calendar.name === state.calendarName;
      if (willTrigger) {
        app.log(`Triggered '${triggerId}'. With state: ${state}. With args: ${args}`);
        updateHitCount(app, variableMgmt, triggerId, { calendar: args.calendar.name });
      }
      return willTrigger;
    });

    eventCalendar.registerArgumentAutocompleteListener('calendar', (query: string, _): FlowCard.ArgumentAutocompleteResults => {
      if (!variableMgmt.calendars) {
        app.log(`[WARN] ${triggerId}.onAutocompleteListener: Calendars not set yet. Nothing to show...`);
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
    });
  }

  setupHitCount(app, variableMgmt);
}
