import { App } from "homey";
import { Moment } from "moment";
import { DateType, VEvent } from "node-ical";

import { getMoment } from './moment-datetime.js';

import { extractMeetingUrl } from './extract-meeting-url.js';

import { BusyStatus } from "../types/IcalCalendar.type";
import { NewEventOptions } from "../types/Options.type";
import { VariableManagementCalendarEvent, VariableManagementLocalEvent } from "../types/VariableMgmt.type";

const getFreeBusyStatus = (event: VEvent): BusyStatus | undefined => {
  if ('MICROSOFT-CDO-BUSYSTATUS' in event) {
    return event['MICROSOFT-CDO-BUSYSTATUS'] as BusyStatus;
  }

  if ('X-MICROSOFT-CDO-BUSYSTATUS' in event) {
    return event['X-MICROSOFT-CDO-BUSYSTATUS'] as BusyStatus;
  }

  return undefined;
}

const createNewEvent = (app: App, start: Moment, dateType: DateType, end: Moment, uid: string, description: string, location: string, summary: string, created: Moment | undefined, fullDayEvent: boolean, skipTZ: boolean, freeBusy: BusyStatus | undefined, meetingUrl: string | undefined, local: boolean): VariableManagementCalendarEvent => {
  // set start and end with correct locale (supports only the languages in the locales folder!)
  start.locale(app.homey.__('locale.moment'));
  end.locale(app.homey.__('locale.moment'));

  const newEvent: VariableManagementCalendarEvent = {
    start,
    dateType,
    end,
    uid,
    description,
    location,
    summary,
    fullDayEvent,
    skipTZ, // TODO: this will be removed when Moment is swapped out for luxon
    local
  };

  if (created) {
    newEvent.created = created;
  }

  if (freeBusy) {
    newEvent.freeBusy = freeBusy;
  }

  if (meetingUrl) {
    newEvent.meetingUrl = meetingUrl;
  }

  return newEvent;
}

export const fromEvent = (app: App, start: Moment, end: Moment, timezone: string, event: VEvent): VariableManagementCalendarEvent => {
  const created: Moment | undefined = event.created ? getMoment({ timezone, date: event.created.toISOString() }) : undefined;
  const fullDayEvent: boolean = event.datetype === 'date';
  const skipTZ: boolean = (event as any).skipTZ === true; // TODO: this will be removed when Moment is swapped out for luxon
  const freeBusy: BusyStatus | undefined = getFreeBusyStatus(event);
  const meetingUrl: string | undefined = extractMeetingUrl(event);

  return createNewEvent(app, start, event.datetype, end, event.uid, event.description, event.location, event.summary, created, fullDayEvent, skipTZ, freeBusy, meetingUrl, false);
}

export const newEvent = (app: App, timezone: string, options: NewEventOptions): VariableManagementLocalEvent => {
  const { event_name: title, event_description: description, event_start: start, event_end: end, apply_timezone: applyTimezone, calendar: calendarName } = options;

  const fullDayEvent: boolean = start.includes('00:00:00') && end.includes('00:00:00');
  const skipTZ: boolean = !applyTimezone || fullDayEvent; // TODO: this will be removed when Moment is swapped out for luxon
  const startMoment: Moment = skipTZ ? getMoment({ date: start }) : getMoment({ timezone, date: start });
  const endMoment: Moment = skipTZ ? getMoment({ date: end }) : getMoment({ timezone, date: end });
  const created: Moment = getMoment({ timezone, date: new Date().toISOString() });
  const dateType: DateType = fullDayEvent ? 'date' : 'date-time';

  if (!applyTimezone) {
    app.log('newEvent: Be aware: Since "applyTimezone" is set to false, start and end will not have your timezone applied:', start, startMoment, end, endMoment);
  }

  const newEvent: VariableManagementCalendarEvent = createNewEvent(app, startMoment, dateType, endMoment, `local_${start}`, description, '', title, created, fullDayEvent, skipTZ, undefined, undefined, true);

  return { ...newEvent, calendar: calendarName };
}
