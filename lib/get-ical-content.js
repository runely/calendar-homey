'use strict'

const ical = require('node-ical')

module.exports = async (url, app, options = {}) => {
  try {
    const data = ical.async.fromURL(url, options)
    return data
  } catch (error) {
    app.error(`get-ical-content: Failed to retrieve content for url '${url}':`, error)
    return error
  }
}
