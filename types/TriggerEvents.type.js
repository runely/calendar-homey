/**
 * @typedef {object} TriggerEvent
 * @property {string} calendarName
 * @property {import('./types/VariableMgmt.type').VariableManagementCalendarEvent|import('./types/VariableMgmt.type').VariableManagementLocalEvent} event
 * @property {string} [triggerId]
 * @property {TriggerState} [state]
 */

/**
 * @typedef {object} TriggerState
 * @property {string} calendarName
 */

/**
 * @typedef {TriggerEvent[]} TriggerEvents
 */
