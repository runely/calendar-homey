'use strict'

const extractMeetingUrl = require('../lib/extract-meeting-url')

const microsoftTeams = {
  description: 'Hello!\n\nHeres the meeting url you asked for.\n________________________________________________________________________________\nMicrosoft Teams meeting\nJoin from computer, mobile app or room device\nClick here to join<https://teams.microsoft.com/l/meetup-join/19%3ameeting_12345678909876543212345678909876543212345678909%40thread.v2/0?context=%4c%33gas%22%3a%3456789012-1234-1234-1234-13f7b567788c9%22%2c%22Oid%22%3a%6554321678-1234-5678-9012-123456789012%22%7d>\nMøte-ID: 111 111 111 111\nPassord: 5bygmt\nLast nedTeams<https://www.microsoft.com/en-us/microsoft-teams/download-app> | Join on the web<https://www.microsoft.com/microsoft-teams/join-a-meeting>\nFinn ut mer<https://aka.ms/JoinTeamsMeeting> | Møtealternativer<https://teams.microsoft.com/meetingOptions/?organizerId=12345678-1234-1234-1234-123456789098&tenantId=12345678-1234-1234-1234-123456789098&threadId=45_meeting_dfgkYmMertQtYytreMi00MTertgLThiYmItZGZtghydfgfgJiMWQ4@thread.v2&messageId=0&language=nb-NO>\n________________________________________________________________________________\n\n',
  url: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_12345678909876543212345678909876543212345678909%40thread.v2/0?context=%4c%33gas%22%3a%3456789012-1234-1234-1234-13f7b567788c9%22%2c%22Oid%22%3a%6554321678-1234-5678-9012-123456789012%22%7d'
}
const appleFaceTime = {
  description: '----( Videoanrop )----\n[FaceTime]\nhttps://facetime.apple.com/join#v=1&p=12345678909+1234567890&k=1234567890987654321234567890987654321234567\n---===---',
  url: 'https://facetime.apple.com/join#v=1&p=12345678909+1234567890&k=1234567890987654321234567890987654321234567'
}
const googleMeet = {
  description: '----( Videogesprek )----\nhttp://meet.google.com/123-4567-890\n---===---',
  url: 'http://meet.google.com/123-4567-890'
}

describe('"null" is returned when', () => {
  test('nothing is passed in', () => {
    const result = extractMeetingUrl()
    expect(result).toBeNull()
  })

  test('a string is passed in', () => {
    const result = extractMeetingUrl('string')
    expect(result).toBeNull()
  })

  test('an empty object is passed in', () => {
    const result = extractMeetingUrl({})
    expect(result).toBeNull()
  })

  test('an object with "description" as empty string is passed in', () => {
    const result = extractMeetingUrl({ description: '' })
    expect(result).toBeNull()
  })

  test('an object with "description" as a string without a meeting url is passed in', () => {
    const result = extractMeetingUrl({ description: 'string' })
    expect(result).toBeNull()
  })
})

describe('meeting url found when', () => {
  test('string with Microsoft Teams url is present', () => {
    const { description, url } = microsoftTeams
    const result = extractMeetingUrl({ description })
    expect(result).toBe(url)
  })

  test('string with Apple FaceTime url is present', () => {
    const { description, url } = appleFaceTime
    const result = extractMeetingUrl({ description })
    expect(result).toBe(url)
  })

  test('string with Google Meet url is present', () => {
    const { description, url } = googleMeet
    const result = extractMeetingUrl({ description })
    expect(result).toBe(url)
  })
})
