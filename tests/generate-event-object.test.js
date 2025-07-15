'use strict'

const constructedApp = require('./lib/construct-app')
const { moment } = require('../lib/moment-datetime')
const { fromEvent, newEvent } = require('../lib/generate-event-object')

const timezone = 'Europe/Oslo'

const utcEvent = {
  start: moment({ date: '2021-11-05T20:00:00.000Z' }),
  datetype: 'date-time',
  end: moment({ date: '2021-11-05T21:00:00.000Z' }),
  uid: 'cal_one_One',
  description: 'OneDesc',
  location: '',
  summary: 'One',
  created: new Date('2021-11-05T18:00:00.000Z'),
  skipTZ: true,
  'MICROSOFT-CDO-BUSYSTATUS': 'WORKINGELSEWHERE'
}

const tzEvent = {
  start: moment({ timezone, date: '2021-11-05T20:00:00.000Z' }),
  datetype: 'date-time',
  end: moment({ timezone, date: '2021-11-05T21:00:00.000Z' }),
  uid: 'cal_one_One',
  description: 'OneDesc',
  location: '',
  summary: 'One',
  created: new Date('2021-11-05T18:00:00.000Z'),
  skipTZ: false,
  'X-MICROSOFT-CDO-BUSYSTATUS': 'BUSY'
}

/**
 * @type {import('../types/AppTests.type').AppTests}
 */
const app = {
  ...constructedApp,
  homey: {
    __: jest.fn()
  }
}

describe('fromEvent', () => {
  test('Returns correct object when event is UTC', () => {
    const result = fromEvent(app, timezone, utcEvent)
    expect(Object.keys(result).length).toBe(13)
    expect(result.start).toBeTruthy()
    expect(result.datetype).toBeTruthy()
    expect(result.end).toBeTruthy()
    expect(result.uid).toBeTruthy()
    expect(result.description).toBeTruthy()
    expect(result.location).toBe('')
    expect(result.summary).toBeTruthy()
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeTruthy()
    expect(result.freebusy).toBe('WORKINGELSEWHERE')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeFalsy()
  })

  test('Returns correct object when event has TZ', () => {
    const result = fromEvent(app, timezone, tzEvent)
    expect(Object.keys(result).length).toBe(13)
    expect(result.start).toBeTruthy()
    expect(result.datetype).toBeTruthy()
    expect(result.end).toBeTruthy()
    expect(result.uid).toBeTruthy()
    expect(result.description).toBeTruthy()
    expect(result.location).toBe('')
    expect(result.summary).toBeTruthy()
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeFalsy()
    expect(result.freebusy).toBe('BUSY')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeFalsy()
  })
})

describe('newEvent', () => {
  test("Returns correct object when 'applyTimezone' is false", () => {
    const title = 'Test1'
    const description = 'TestDesc'
    const start = '2023-04-06T12:00:00Z'
    const end = '2023-04-06T14:00:00Z'
    const applyTimezone = false
    const calendarName = { id: 'TestCal', name: 'TestCal' }
    const result = newEvent(app, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar: calendarName
    })
    expect(Object.keys(result).length).toBe(14)
    expect(result.start).toBeTruthy()
    expect(result.start.get('hours')).toBe(12)
    expect(result.datetype).toBeTruthy()
    expect(result.end.get('hours')).toBe(14)
    expect(result.uid).toBe(`local_${start}`)
    expect(result.description).toBe(description)
    expect(result.location).toBe('')
    expect(result.summary).toBe(title)
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeTruthy()
    expect(result.freebusy).toBe('')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeTruthy()
    expect(result.calendar).toBe(calendarName.name)
  })

  test("Returns correct object when 'applyTimezone' is true", () => {
    const title = 'Test2'
    const description = 'Test2Desc'
    const start = '2023-04-06T12:00:00'
    const end = '2023-04-06T14:00:00'
    const applyTimezone = true
    const calendarName = { id: 'TestCal', name: 'TestCal' }
    const result = newEvent(app, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar: calendarName
    })
    expect(Object.keys(result).length).toBe(14)
    expect(result.start).toBeTruthy()
    expect(result.start.get('hours')).toBe(14)
    expect(result.datetype).toBeTruthy()
    expect(result.end.get('hours')).toBe(16)
    expect(result.uid).toBe(`local_${start}`)
    expect(result.description).toBe(description)
    expect(result.location).toBe('')
    expect(result.summary).toBe(title)
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeFalsy()
    expect(result.freebusy).toBe('')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeTruthy()
    expect(result.calendar).toBe(calendarName.name)
  })

  test("Returns correct object when 'description' is null", () => {
    const title = 'Test2'
    const description = null
    const start = '2023-04-06T12:00:00'
    const end = '2023-04-06T14:00:00'
    const applyTimezone = true
    const calendarName = { id: 'TestCal', name: 'TestCal' }
    const result = newEvent(app, timezone, {
      event_name: title,
      event_description: description,
      event_start: start,
      event_end: end,
      apply_timezone: applyTimezone,
      calendar: calendarName
    })
    expect(Object.keys(result).length).toBe(14)
    expect(result.start).toBeTruthy()
    expect(result.start.get('hours')).toBe(14)
    expect(result.datetype).toBeTruthy()
    expect(result.end.get('hours')).toBe(16)
    expect(result.uid).toBe(`local_${start}`)
    expect(result.description).toBe('')
    expect(result.location).toBe('')
    expect(result.summary).toBe(title)
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeFalsy()
    expect(result.freebusy).toBe('')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeTruthy()
    expect(result.calendar).toBe(calendarName.name)
  })
})
