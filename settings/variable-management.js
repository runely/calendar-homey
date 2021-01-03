(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.variableMgmt = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
};

},{}]},{},[1])(1)
});
