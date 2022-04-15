'use strict'

/**
 * @typedef {Object} GenerateTokensOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Object} variableMgmt Variable management object
 * @prop {String} calendarName Calendar name
 */

/**
 * @param {GenerateTokensOptions} options
 */
module.exports.generateTokens = options => {
  const { app, variableMgmt, calendarName } = options
  return [
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostTodayId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.events_today_calendar_title_stamps')} ${calendarName}`
    },
    {
      id: `${variableMgmt.calendarTokensPreId}${calendarName}${variableMgmt.calendarTokensPostTomorrowId}`,
      type: 'string',
      title: `${app.homey.__('calendarTokens.events_tomorrow_calendar_title_stamps')} ${calendarName}`
    }
  ]
}

/**
 * @typedef {Object} GeneratePerCalendarTokensOptions
 * @prop {Homey.App} app App class inited by Homey
 * @prop {Object} variableMgmt Variable management object
 * @prop {String} calendarName Calendar name
 */

/**
 * @param {GeneratePerCalendarTokensOptions} options
 */
module.exports.generatePerCalendarTokens = options => {
  const { app, variableMgmt, calendarName } = options
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
    }
  ]
}
