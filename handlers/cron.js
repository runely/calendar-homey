'use strict'

const { Cron } = require('croner')

/**
 * @typedef {Object} CronOptions - Cron scheduler options
 * @property {boolean} [catch] - Continue exection even if a unhandled error is thrown by triggered function
 * @property {?} [context] - Used to pass any object to scheduled function
 * @property {number} [interval] - Minimum interval between executions, in seconds
 * @property {boolean} [kill] - Job is about to be killed or killed
 * @property {boolean} [legacyMode] - Combine day-of-month and day-of-week using true = OR, false = AND. Default is true = OR.
 * @property {number} [maxRuns] - Maximum nuber of executions
 * @property {string} [name] - Returns the name of the function. Function names are read-only and can not be changed. (Name of a job)
 * @property {boolean} [paused] - Job is paused
 * @property {boolean} [protect] - Skip current run if job is already running
 * @property {string | Date} [startAt] - When to start running
 * @property {string | Date} [stopAt] - When to stop running
 * @property {string} [timezone] - Timezone in Europe/Stockholm format
 * @property {boolean} [unref] - Abort job instantly if nothing else keeps the event loop running
 * @property {number} [utcOffset] - Offset from UTC in minutes
 */

/**
 * Find next runtime, based on supplied date. Strips milliseconds.
 *
 * @typedef {function} nextRun
 * @property {Date|string} [prev] - Date to start from
 * @returns {Date | null} - Next run time
 */

/**
 * Find next n runs, based on supplied date. Strips milliseconds.
 *
 * @typedef {function} nextRuns
 * @property {number} n - Number of runs to enumerate
 * @property {Date|string} [previous] - Date to start from
 * @returns {Date[]} - Next n run times
 */

/**
 * @typedef {Object} CronJob
 * @prop {nextRun} nextRun Find next runtime, based on supplied date. Strips milliseconds
 * @prop {nextRuns} nextRuns Find next n runs, based on supplied date. Strips milliseconds
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
