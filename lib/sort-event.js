'use strict'

/**
 * @param {Object} a - Event
 * @param {Object} b - Event
 * @returns {number}
 */
module.exports = (a, b) => {
  return a.start - b.start
}
