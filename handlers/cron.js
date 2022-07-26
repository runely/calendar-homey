'use strict'

const { Cron } = require('croner')

/**
 * @typedef {Object} CronOptions - Cron scheduler options
 * @property {boolean} [paused] - Job is paused
 * @property {boolean} [kill] - Job is about to be killed or killed
 * @property {boolean} [catch] - Continue exection even if a unhandled error is thrown by triggered function
 * @property {number} [maxRuns] - Maximum nuber of executions
 * @property {number} [interval] - Minimum interval between executions, in seconds
 * @property {string | Date} [startAt] - When to start running
 * @property {string | Date} [stopAt] - When to stop running
 * @property {string} [timezone] - Timezone in Europe/Stockholm format
 * @property {boolean} [legacyMode] - Combine day-of-month and day-of-week using OR. Default is AND.
 * @property {?} [context] - Used to pass any object to scheduled function
 */

/**
 * Find next runtime, based on supplied date. Strips milliseconds.
 *
 * @typedef {function} next
 * @property {Date|string} [prev] - Date to start from
 * @returns {Date | null} - Next run time
 */

/**
 * Find next n runs, based on supplied date. Strips milliseconds.
 *
 * @typedef {function} enumerate
 * @property {number} n - Number of runs to enumerate
 * @property {Date|string} [previous] - Date to start from
 * @returns {Date[]} - Next n run times
 */

/**
 * @typedef {Object} CronJob
 * @prop {next} next Find next runtime, based on supplied date. Strips milliseconds
 * @prop {enumerate} enumerate Find next n runs, based on supplied date. Strips milliseconds
 * @prop {function} stop Stop execution
 */

/**
 * Create a cron scheduler
 * @param {string} cron [second] minute hour day(month) month day(week)
 * @param {function} callback Callback to be executed
 * @param {CronOptions} options
 * @returns {CronJob} The created job
 */
module.exports.addJob = (cron, callback, options = {}) => {
  return new Cron(cron, callback, options)
}
