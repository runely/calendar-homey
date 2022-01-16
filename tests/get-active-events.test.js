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
  test('Where all \'OnceAWeek\' events has a unique uid', () => {
    expect(onceAWeekEvents.filter(event => event.uid === `hidden_${event.start.toDate().toISOString().slice(0, 10)}`).length).toBe(onceAWeekEvents.length)
  })

  test('Where all \'AlwaysOngoing\' events has a unique uid', () => {
    expect(alwaysOngoingEvents.filter(event => event.uid === `hidden2_${event.start.toDate().toISOString().slice(0, 10)}`).length).toBe(alwaysOngoingEvents.length)
  })
})

describe('getActiveEvents throws an error', () => {
  test('When "DTSTART" is missing', () => {
    const dataNoStart = nodeIcal.sync.parseFile('./tests/data/calendar-missing-start.ics')
    expect(() => getActiveEvents(dataNoStart, eventLimit, app)).toThrow()
  })
})

describe('When "DTEND" is missing', () => {
  test('"DTEND" is set to "DTSTART"', () => {
    const dataNoEnd = nodeIcal.sync.parseFile('./tests/data/calendar-missing-end.ics')
    const { start, end } = dataNoEnd.noEnd
    expect(start.toISOString()).toBe(end.toISOString())
  })
})

describe('When "SUMMARY" is missing', () => {
  test('"SUMMARY" is undefined', () => {
    const dataNoSummary = nodeIcal.sync.parseFile('./tests/data/calendar-missing-summary.ics')
    const { summary } = dataNoSummary.noSummary
    expect(summary).toBe(undefined)
  })
})
