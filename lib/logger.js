'use strict';

const Homey = require('homey');

const noLogging = () => { console.warn('Required "app" reference not present. No logging will be done...'); }
const logToFile = (app, type, msg, additional) => {
    let log = Homey.ManagerSettings.get(app.variableMgmt.setting.logging.logId);
    if (!log) {
        log = [];
    }

    log.push({
        date: new Date().toISOString(),
        type,
        message: msg,
        additional
    });
    Homey.ManagerSettings.set(app.variableMgmt.setting.logging.logId, log);
}

/** @function
 * Log a info message to console
 * @param {object} app - Reference to the app running
 * @param {string} msg - Message to be logged
 * @param {any} additional - Any number of additional info to log
 */
module.exports.info = (app, msg, ...additional) => {
    if (!app) {
        noLogging();
        return;
    }

    // log to Homey
    if (additional !== null && additional !== undefined && additional.length > 0) {
        app.log(msg, additional);
    }
    else {
        app.log(msg);
    }

    // log to file
    if (app.logToFile) logToFile(app, 'info', msg, additional);
}
  
/** @function
 * Log a warning message to console
 * @param {object} app - Reference to the app running
 * @param {string} msg - Message to be logged
 * @param {any} additional - Any number of additional warnings to log
 */
module.exports.warn = (app, msg, ...additional) => {
    if (!app) {
        noLogging();
        return;
    }

    // log to Homey
    if (additional !== null && additional !== undefined && additional.length > 0) {
        app.log(msg, additional);
    }
    else {
        app.log(msg);
    }

    // log to file
    if (app.logToFile) logToFile(app, 'warn', msg, additional);
}

/** @function
 * Log a error message to console
 * @param {object} app - Reference to the app running
 * @param {string} msg - Message to be logged
 * @param {any} additional - Any number of additional errors to log
 */
module.exports.error = (app, msg, ...additional) => {
    if (!app) {
        noLogging();
        return;
    }

    // log to Homey
    if (additional !== null && additional !== undefined && additional.length > 0) {
        app.log(msg, additional);
    }
    else {
        app.log(msg);
    }

    // log to file
    if (app.logToFile) logToFile(app, 'error', msg, additional);
}