'use strict'

module.exports = {
  error: console.error,
  logError: (...args) => console.error('[ERROR]', ...args),
  log: console.log,
  warn: (...args) => console.log('[WARN]', ...args)
}
