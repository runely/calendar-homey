'use strict'

/**
 * @param {Object} event The calendar event to work on
*/
module.exports = event => {
  if (typeof event !== 'object' || typeof event.description !== 'string' || event.description === '') return null

  const patterns = [
    'https?://teams.microsoft.com/l/meetup-join/[^>]+', // Microsoft Teams
    // eslint-disable-next-line no-useless-escape
    'https?://\S[^\\n]+', // General description meeting url
    'https?://facetime.apple.com/join#[^\\n]+', // Apple FaceTime
    'https?://meet.google.com/[^\\n]+' // Google Meet
  ]

  for (let i = 0; i < patterns.length; i++) {
    const match = new RegExp(patterns[i]).exec(event.description)
    if (match) {
      return match[0].replace('---===---', '')
    }
  }

  return null
}
