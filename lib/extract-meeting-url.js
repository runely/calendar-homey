'use strict'

/**
 * @param {Object} event The calendar event to work on
*/
module.exports = event => {
  if (typeof event !== 'object' || typeof event.description !== 'string' || event.description === '') return null

  const match = /https?:\/\/teams.microsoft.com\/l\/meetup-join\/[^>]+|https?:\/\/\S[^\n]+/.exec(event.description)
  return match ? match[0] : null
}
