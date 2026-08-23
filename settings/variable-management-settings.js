"use strict";
var VariableMgmt = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // lib/variable-management.ts
  var variable_management_exports = {};
  __export(variable_management_exports, {
    varMgmt: () => varMgmt
  });
  var varMgmt = {
    setting: {
      icalUris: "uris",
      syncInterval: "syncInterval",
      dateFormat: "dateFormat",
      dateFormatLong: "dateFormatLong",
      dateFormatShort: "dateFormatShort",
      timeFormat: "timeFormat",
      eventLimit: "eventLimit",
      eventLimitDefault: {
        value: "2",
        type: "months"
      },
      nextEventTokensPerCalendar: "nextEventTokensPerCalendar",
      triggerAllChangedEventTypes: "triggerAllChangedEventTypes",
      logAllEvents: "logAllEvents"
    },
    hitCount: {
      data: "hitCountData"
    },
    tokens: [
      {
        id: "event_next_title",
        type: "string"
      },
      {
        id: "event_next_startdate",
        type: "string"
      },
      {
        id: "event_next_startstamp",
        type: "string"
      },
      {
        id: "event_next_stopdate",
        type: "string"
      },
      {
        id: "event_next_stopstamp",
        type: "string"
      },
      {
        id: "event_next_duration",
        type: "string"
      },
      {
        id: "event_next_duration_minutes",
        type: "number"
      },
      {
        id: "event_next_starts_in_minutes",
        type: "number"
      },
      {
        id: "event_next_stops_in_minutes",
        type: "number"
      },
      {
        id: "event_next_description",
        type: "string"
      },
      {
        id: "event_next_calendar_name",
        type: "string"
      },
      {
        id: "events_today_title_stamps",
        type: "string"
      },
      {
        id: "events_today_count",
        type: "number"
      },
      {
        id: "events_tomorrow_title_stamps",
        type: "string"
      },
      {
        id: "events_tomorrow_count",
        type: "number"
      },
      {
        id: "icalcalendar_week_number",
        type: "number"
      }
    ],
    calendarTokensPreId: "ical_calendar_",
    calendarTokensPostTodayId: "_today",
    calendarTokensPostTodayCountId: "_today_count",
    calendarTokensPostTomorrowId: "_tomorrow",
    calendarTokensPostTomorrowCountId: "_tomorrow_count",
    calendarTokensPostNextTitleId: "_next_title",
    calendarTokensPostNextStartDateId: "_next_startdate",
    calendarTokensPostNextStartTimeId: "_next_starttime",
    calendarTokensPostNextEndDateId: "_next_enddate",
    calendarTokensPostNextEndTimeId: "_next_endtime",
    calendarTokensPostNextDescriptionId: "_next_description",
    nextTokenPostTitleId: "_title",
    nextTokenPostStartDateId: "_startdate",
    nextTokenPostStartTimeId: "_starttime",
    nextTokenPostEndDateId: "_enddate",
    nextTokenPostEndTimeId: "_endtime",
    nextTokenPostDescriptionId: "_description",
    calendarTokens: [],
    flowTokens: [],
    nextEventWithTokens: [],
    localEvents: [],
    storage: {
      eventUids: "eventUids",
      localEvents: "localEvents",
      calendarsMetadata: "calendarsMetadata"
    },
    gettingEventsRunning: false,
    gettingEventsLastRun: null,
    jobs: {}
  };
  return __toCommonJS(variable_management_exports);
})();
