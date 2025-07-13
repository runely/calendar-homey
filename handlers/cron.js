'use strict'

const { Cron } = require('croner')

/**
 * @typedef {import('croner').Cron} CronJob
 */

/**
 * @typedef {import('croner').CronOptions} CronJobOptions
 */

/**
 * Create a cron scheduler
 * @param {string} cron - [second] minute hour day(month) month day(week)
 * @param {function} callback - Callback to be executed
 * @param {CronJobOptions} options
 * @returns {CronJob} The created job
 */
module.exports.addJob = (cron, callback, options = {}) => {
  return new Cron(cron, callback, options)
}

/**
 * Check if cron syntax is valid
 * @param {string} cron - [second] minute hour day(month) month day(week)
 * @returns {boolean} - true if cron syntax is valid, otherwise false
 */
module.exports.isValidCron = (cron) => {
  try {
    const crontab = new Cron(cron)
    return crontab.nextRun() instanceof Date
  } catch (ex) {
    return false
  }
}
