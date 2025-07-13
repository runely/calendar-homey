/**
 * @typedef {Object} VariableManagement
 * @property {VariableManagementSettings} [setting]
 * @property {SettingHitCount} [hitCount]
 * @property {VariableManagementTokens} [tokens]
 * @property {string|undefined} calendarTokensPreId
 * @property {string|undefined} calendarTokensPostTodayId
 * @property {string|undefined} calendarTokensPostTodayCountId
 * @property {string|undefined} calendarTokensPostTomorrowId
 * @property {string|undefined} calendarTokensPostTomorrowCountId
 * @property {string|undefined} calendarTokensPostNextTitleId
 * @property {string|undefined} calendarTokensPostNextStartDateId
 * @property {string|undefined} calendarTokensPostNextStartTimeId
 * @property {string|undefined} calendarTokensPostNextEndDateId
 * @property {string|undefined} calendarTokensPostNextEndTimeId
 * @property {string|undefined} calendarTokensPostNextDescriptionId
 * @property {string|undefined} nextTokenPostTitleId
 * @property {string|undefined} nextTokenPostStartDateId
 * @property {string|undefined} nextTokenPostStartTimeId
 * @property {string|undefined} nextTokenPostEndDateId
 * @property {string|undefined} nextTokenPostEndTimeId
 * @property {string|undefined} nextTokenPostDescriptionId
 * @property {VariableManagementTokenIds} [calendarTokens]
 * @property {VariableManagementTokenIds} [flowTokens]
 * @property {VariableManagementTokenIds} [nextEventWithTokens]
 * @property {VariableManagementLocalEvents} [localEvents]
 * @property {VariableManagementStorage} [storage]
 * @property {VariableManagementDateTimeFormat} [dateTimeFormat]
 * @property {VariableManagementCalendars} [calendars]
 */

/**
 * @typedef SettingEventLimit
 * @property {string} value
 * @property {string} type
 */

/**
 * @typedef {Object} SettingHitCount
 * @property {string} data
 */

/**
 * @typedef {Object} VariableManagementCalendar
 * @property {string} name
 * @property {VariableManagementCalendarEvents} events
 */

/**
 * @typedef {VariableManagementCalendar[]} VariableManagementCalendars
 */

/**
 * @typedef {Object} VariableManagementCalendarEvent
 * @property {import('moment-timezone').Moment} start
 * @property {import('node-ical').DateType} datetype
 * @property {import('moment-timezone').Moment} end
 * @property {string} uid
 * @property {string} description
 * @property {string} location
 * @property {string} summary
 * @property {import('moment-timezone').Moment|undefined} created
 * @property {boolean} fullDayEvent
 * @property {boolean} skipTZ
 * @property {string} freebusy
 * @property {string} meetingUrl
 * @property {boolean} local
 */

/**
 * @typedef {VariableManagementCalendarEvent[]} VariableManagementCalendarEvents
 */

/**
 * @typedef {Object} VariableManagementDateTimeFormat
 * @property {string} long
 * @property {string} short
 * @property {string} time
 */

/**
 * @typedef {VariableManagementCalendarEvent & {
 *   calendar: string
 * }} VariableManagementLocalEvent
 */

/**
 * @typedef {VariableManagementLocalEvent[]} VariableManagementLocalEvents
 */

/**
 * @typedef {string[]} VariableManagementTokenIds
 */

/**
 * @typedef {Object} VariableManagementSettings
 * @property {string} [icalUris]
 * @property {string} [syncInterval]
 * @property {string|null} [dateFormat]
 * @property {string|null} [dateFormatLong]
 * @property {string|null} [dateFormatShort]
 * @property {string|null} [timeFormat]
 * @property {string} [eventLimit]
 * @property {SettingEventLimit} [eventLimitDefault]
 * @property {string} [nextEventTokensPerCalendar]
 * @property {string} [triggerAllChangedEventTypes]
 * @property {string} [logAllEvents]
 */

/**
 * @typedef {Object} VariableManagementStorage
 * @property {string} [eventUids]
 * @property {string} [localEvents]
 * @property {string} [calendarsMetadata]
 */

/**
 * @typedef {Object} VariableManagementToken
 * @property {string} id
 * @property {'string'|'number'} type
 */

/**
 * @typedef {VariableManagementToken[]} VariableManagementTokens
 */
