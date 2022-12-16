'use strict'

module.exports = {
  setting: {
    icalUris: 'uris',
    dateFormat: 'dateFormat',
    dateFormatLong: 'dateFormatLong',
    dateFormatShort: 'dateFormatShort',
    timeFormat: 'timeFormat',
    eventLimit: 'eventLimit',
    eventLimitDefault: {
      value: '2',
      type: 'months'
    },
    nextEventTokensPerCalendar: 'nextEventTokensPerCalendar',
    logAllEvents: 'logAllEvents'
  },
  tokens: [
    {
      id: 'event_next_title',
      type: 'string'
    },
    {
      id: 'event_next_startdate',
      type: 'string'
    },
    {
      id: 'event_next_startstamp',
      type: 'string'
    },
    {
      id: 'event_next_stopdate',
      type: 'string'
    },
    {
      id: 'event_next_stopstamp',
      type: 'string'
    },
    {
      id: 'event_next_duration',
      type: 'string'
    },
    {
      id: 'event_next_duration_minutes',
      type: 'number'
    },
    {
      id: 'event_next_starts_in_minutes',
      type: 'number'
    },
    {
      id: 'event_next_stops_in_minutes',
      type: 'number'
    },
    {
      id: 'event_next_calendar_name',
      type: 'string'
    },
    {
      id: 'events_today_title_stamps',
      type: 'string'
    },
    {
      id: 'events_today_count',
      type: 'number'
    },
    {
      id: 'events_tomorrow_title_stamps',
      type: 'string'
    },
    {
      id: 'events_tomorrow_count',
      type: 'number'
    },
    {
      id: 'icalcalendar_week_number',
      type: 'number'
    }
  ],
  calendarTokensPreId: 'ical_calendar_',
  calendarTokensPostTodayId: '_today',
  calendarTokensPostTodayCountId: '_today_count',
  calendarTokensPostTomorrowId: '_tomorrow',
  calendarTokensPostTomorrowCountId: '_tomorrow_count',
  calendarTokensPostNextTitleId: '_next_title',
  calendarTokensPostNextStartDateId: '_next_startdate',
  calendarTokensPostNextStartTimeId: '_next_starttime',
  calendarTokensPostNextEndDateId: '_next_enddate',
  calendarTokensPostNextEndTimeId: '_next_endtime',
  nextTokenPostTitleId: '_title',
  nextTokenPostStartDateId: '_startdate',
  nextTokenPostStartTimeId: '_starttime',
  nextTokenPostEndDateId: '_enddate',
  nextTokenPostEndTimeId: '_endtime',
  calendarTokens: [],
  flowTokens: [],
  nextEventWithTokens: [],
  storage: {
    eventUids: 'eventUids'
  }
}
