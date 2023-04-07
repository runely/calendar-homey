'use strict'

const { moment } = require('../lib//moment-datetime')
const { fromEvent, newEvent } = require('../lib/generate-event-object')

const timezone = 'Europe/Oslo'

const utcEvent = {
  start: moment({ date: '2021-11-05T20:00:00.000Z' }),
  datetype: 'date-time',
  end: moment({ date: '2021-11-05T21:00:00.000Z' }),
  uid: 'cal_one_One',
  description: 'One',
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
  description: 'One',
  location: '',
  summary: 'One',
  created: new Date('2021-11-05T18:00:00.000Z'),
  skipTZ: false,
  'X-MICROSOFT-CDO-BUSYSTATUS': 'BUSY'
}

const app = {
  homey: {
    __: jest.fn()
  },
  log: console.log
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
    const start = '2023-04-06T12:00:00Z'
    const end = '2023-04-06T14:00:00Z'
    const applyTimezone = false
    const calendarName = 'TestCal'
    const result = newEvent(app, timezone, title, start, end, applyTimezone, calendarName)
    expect(Object.keys(result).length).toBe(14)
    expect(result.start).toBeTruthy()
    expect(result.start.get('hours')).toBe(12)
    expect(result.datetype).toBeTruthy()
    expect(result.end.get('hours')).toBe(14)
    expect(result.uid).toBe(`local_${start}`)
    expect(result.description).toBe(title)
    expect(result.location).toBe('')
    expect(result.summary).toBe(title)
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeTruthy()
    expect(result.freebusy).toBe('')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeTruthy()
    expect(result.calendar).toBe(calendarName)
  })

  test("Returns correct object when 'applyTimezone' is true", () => {
    const title = 'Test2'
    const start = '2023-04-06T12:00:00'
    const end = '2023-04-06T14:00:00'
    const applyTimezone = true
    const calendarName = 'TestCal'
    const result = newEvent(app, timezone, title, start, end, applyTimezone, calendarName)
    expect(Object.keys(result).length).toBe(14)
    expect(result.start).toBeTruthy()
    expect(result.start.get('hours')).toBe(14)
    expect(result.datetype).toBeTruthy()
    expect(result.end.get('hours')).toBe(16)
    expect(result.uid).toBe(`local_${start}`)
    expect(result.description).toBe(title)
    expect(result.location).toBe('')
    expect(result.summary).toBe(title)
    expect(result.created).toBeTruthy()
    expect(result.fullDayEvent).toBeFalsy()
    expect(result.skipTZ).toBeFalsy()
    expect(result.freebusy).toBe('')
    expect(result.meetingUrl).toBe('')
    expect(result.local).toBeTruthy()
    expect(result.calendar).toBe(calendarName)
  })
})
