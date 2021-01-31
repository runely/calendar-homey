module.exports = {
  crontask: {
    id: {
      updateCalendar: 'no.runely.calendar.cron_updateCalendar',
      triggerEvents: 'no.runely.calendar.cron_triggerEvents'
    },
    schedule: {
      updateCalendar: '*/15 * * * *', // run every full 15 minutes
      triggerEvents: '*/1 * * * *' // run every full minute
    }
  },
  setting: {
    icalUris: 'uris',
    dateFormat: 'dateFormat',
    timeFormat: 'timeFormat',
    eventLimit: 'eventLimit',
    eventLimitDefault: {
      value: '2',
      type: 'months'
    },
    nextEventTokensPerCalendar: 'nextEventTokensPerCalendar'
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
    }
  ],
  calendarTokensPreId: 'ical_calendar_',
  calendarTokensPostTodayId: '_today',
  calendarTokensPostTomorrowId: '_tomorrow',
  calendarTokensPostNextTitleId: '_next_title',
  calendarTokensPostNextStartDateId: '_next_startdate',
  calendarTokensPostNextStartTimeId: '_next_starttime',
  calendarTokensPostNextEndDateId: '_next_enddate',
  calendarTokensPostNextEndTimeId: '_next_endtime',
  calendarTokens: [],
  flowTokens: []
}
