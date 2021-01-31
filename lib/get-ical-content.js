'use strict'

const ical = require('node-ical')

module.exports = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      ical.async.fromURL(url, options, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    } catch (error) {
      console.error(`get-ical-content: Failed to retrieve content for url '${url}':`, error)
      reject(error)
    }
  })
}
