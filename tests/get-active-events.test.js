const nodeIcal = require('node-ical')
const moment = require('moment')
const getActiveEvents = require('../lib/get-active-events')

const data = nodeIcal.sync.parseFile('./tests/data/calendar.ics')

const eventLimit = {
  value: '3',
  type: 'weeks'
}

const app = {
  log: console.log
}

const activeEvents = getActiveEvents(data, eventLimit, app)
const onceAWeekEvents = activeEvents.filter(event => event.summary === 'OnceAWeek')
const alwaysOngoingEvents = activeEvents.filter(event => event.summary === 'AlwaysOngoing')

describe('getActiveEvents returns', () => {
  test('An array', () => {
    expect(Array.isArray(activeEvents)).toBe(true)
  })

  test('Objects within the array', () => {
    expect(typeof activeEvents[0]).toBe('object')
  })

  test('an array where each object has a start property of instance \'moment\'', () => {
    expect(activeEvents[0].start instanceof moment).toBe(true)
  })

  test('an array where each object has a end property of instance \'moment\'', () => {
    expect(activeEvents[0].end instanceof moment).toBe(true)
  })

  test('an array where each object has a datetype property of type \'string\'', () => {
    expect(typeof activeEvents[0].datetype).toBe('string')
  })

  test('an array where each object has a datetype property with value \'date-time\'', () => {
    expect(activeEvents[0].datetype).toBe('date-time')
  })

  test('an array where each object has a uid property of type \'string\'', () => {
    expect(typeof activeEvents[0].uid).toBe('string')
  })

  test('an array where each object has a description property of type \'string\'', () => {
    expect(typeof activeEvents[0].description).toBe('string')
  })

  test('an array where each object has a location property of type \'string\'', () => {
    expect(typeof activeEvents[0].location).toBe('string')
  })

  test('an array where each object has a summary property of type \'string\'', () => {
    expect(typeof activeEvents[0].summary).toBe('string')
  })
})

describe('getActiveEvents returns an array', () => {
  test('With 2 or 3 \'OnceAWeek\' events (depending on date and time)', () => {
    expect(onceAWeekEvents.length === 2 || onceAWeekEvents.length === 3).toBeTruthy()
  })

  test('With 3 or 4 \'AlwaysOngoing\' events', () => {
    expect(alwaysOngoingEvents.length === 3 || alwaysOngoingEvents.length === 4).toBeTruthy()
  })

  test('Where all \'OnceAWeek\' events has a unique uid', () => {
    expect(onceAWeekEvents.filter(event => event.uid === `hidden_${event.start.toDate().toISOString().slice(0, 10)}`).length).toBe(onceAWeekEvents.length)
  })

  test('Where all \'AlwaysOngoing\' events has a unique uid', () => {
    expect(alwaysOngoingEvents.filter(event => event.uid === `hidden2_${event.start.toDate().toISOString().slice(0, 10)}`).length).toBe(alwaysOngoingEvents.length)
  })
})

describe('Events has correct time', () => {
  test('\'OnceAWeek\' is 17:30:00 in UTC', () => {
    const event = onceAWeekEvents[0]
    const time = event.start.utc().toISOString().split('T')[1].split('.')[0].split(':')
    console.log('OnceAWeek:', time)
    expect(time[0] === '16' || time[0] === '17').toBeTruthy()
    expect(time[1]).toBe('30')
    expect(time[2]).toBe('00')
  })

  test('\'AlwaysOngoing\' is 03:00:00 in UTC', () => {
    const event = alwaysOngoingEvents[0]
    const time = event.start.utc().toISOString().split('T')[1].split('.')[0].split(':')
    console.log('AlwaysOnGoing:', time)
    expect(time[0] === '01' || time[0] === '02' || time[0] === '03').toBeTruthy()
    expect(time[1]).toBe('00')
    expect(time[2]).toBe('00')
  })
})
