'use strict'

const { schedule } = require('node-cron')

/**
 * @typedef {Object} CronScheduleOptions
 * @prop {boolean} [scheduled] If a scheduled task is ready and running to be performed when the time matches the cron expression. Default is true
 * @prop {string} [timezone] The timezone to execute the task in (IANA)
 */

/**
 * @typedef {Object} ScheduledTask
 * @prop {function} start Start the scheduled task
 * @prop {function} stop Stop the scheduled task
 */

/**
 * Create a cron scheduler
 * @param {string} cron [second] minute hour day(month) month day(week)
 * @param {function} callback Callback to be executed
 * @param {CronScheduleOptions} options
 * @returns {ScheduledTask} The created schedule
 */
module.exports.addSchedule = (cron, callback, options = {}) => {
  return schedule(cron, callback, options)
}
