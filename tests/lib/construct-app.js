'use strict'

module.exports = {
  error: console.error,
  log: console.log,
  warn: (...args) => console.log('[WARN]', ...args)
}
