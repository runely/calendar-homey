/**
 * @typedef {import('moment-timezone').Moment} MomentTimezone
 */

/**
 * @typedef {import('node-ical').VEvent & {
 *   skipTZ: boolean,
 *   start: MomentTimezone,
 *   end: MomentTimezone
 * }} ExtNodeIcalVEvent
 */
