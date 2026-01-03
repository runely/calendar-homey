import { App } from "homey";

import { Token } from "../types/Homey.type";
import { VariableManagement } from "../types/VariableMgmt.type";

export const generateTokens = (app: App, variableMgmt: VariableManagement, calendarName: string): Token[] => {
  return [
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostTodayId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.events_today_calendar_title_stamps')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostTodayCountId}`,
      type: 'number',
      title: `${app.homey.__('calendarTokens.events_today_calendar_count')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostTomorrowId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.events_tomorrow_calendar_title_stamps')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostTomorrowCountId}`,
      type: 'number',
      title: `${app.homey.__('calendarTokens.events_tomorrow_calendar_count')} ${calendarName}`
    }
  ]
}

export const generatePerCalendarTokens = (app: App, variableMgmt: VariableManagement, calendarName: string): Token[] => {
  return [
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostNextTitleId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.event_next_title_calendar')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostNextStartDateId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.event_next_startdate_calendar')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostNextStartTimeId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.event_next_startstamp_calendar')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostNextEndDateId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.event_next_enddate_calendar')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostNextEndTimeId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.event_next_endstamp_calendar')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostNextDescriptionId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.event_next_description_calendar')} ${calendarName}`
    }
  ];
}

export const generateNextEventTokens = (app: App, variableMgmt: VariableManagement): Token[] => {
  return [
    {
      id: `${variableMgmt.calendarTokensPreId}next_with${variableMgmt.nextTokenPostTitleId}`,
      type: 'string',
      title: app.homey.__('nextEventWithToken.event_next_title')
    },
    {
      id: `${variableMgmt.calendarTokensPreId}next_with${variableMgmt.nextTokenPostStartDateId}`,
      type: 'string',
      title: app.homey.__('nextEventWithToken.event_next_startdate')
    },
    {
      id: `${variableMgmt.calendarTokensPreId}next_with${variableMgmt.nextTokenPostStartTimeId}`,
      type: 'string',
      title: app.homey.__('nextEventWithToken.event_next_startstamp')
    },
    {
      id: `${variableMgmt.calendarTokensPreId}next_with${variableMgmt.nextTokenPostEndDateId}`,
      type: 'string',
      title: app.homey.__('nextEventWithToken.event_next_stopdate')
    },
    {
      id: `${variableMgmt.calendarTokensPreId}next_with${variableMgmt.nextTokenPostEndTimeId}`,
      type: 'string',
      title: app.homey.__('nextEventWithToken.event_next_stopstamp')
    },
    {
      id: `${variableMgmt.calendarTokensPreId}next_with${variableMgmt.nextTokenPostDescriptionId}`,
      type: 'string',
      title: app.homey.__('nextEventWithToken.event_next_description')
    }
  ];
}
