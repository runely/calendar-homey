'use strict'

/**
 * @type {{error: {(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}, logError: (function(...[*]): void), log: {(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}, warn: (function(...[*]): void)}}
 */
module.exports = {
  error: console.error,
  logError: (...args) => console.error('[ERROR]', ...args),
  log: console.log,
  warn: (...args) => console.log('[WARN]', ...args)
}
