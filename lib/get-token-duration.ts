import { App } from "homey";
import humanize from 'humanize-duration';

import { EventDuration } from "../types/IcalCalendar.type";
import { VariableManagementCalendarEvent } from "../types/VariableMgmt.type";

export const getTokenDuration = (app: App, event: VariableManagementCalendarEvent): EventDuration => {
  const durationMS: number = event.end.diff(event.start, 'milliseconds');
  const durationMinutes: number = event.end.diff(event.start, 'minutes');

  return {
    duration: humanize(durationMS, {
      language: app.homey.__('locale.humanize'),
      largest: 3,
      units: ['y', 'mo', 'w', 'd', 'h', 'm'],
      round: true,
      conjunction: app.homey.__('humanize.conjunction'),
      serialComma: false
    }),
    durationMinutes
  };
}
