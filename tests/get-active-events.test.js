'use strict'

const nodeIcal = require('node-ical')
const moment = require('moment-timezone')
const getActiveEvents = require('../lib/get-active-events')

const data = nodeIcal.sync.parseFile('./tests/data/calendar.ics')
const invalidTimezone = nodeIcal.sync.parseFile('./tests/data/calendar-ivalid-timezone.ics')

const eventLimit = {
  value: '3',
  type: 'weeks'
}

const eventLimitInvalidTimezone = {
  value: '10',
  type: 'years'
}

const app = {
  log: console.log,
  sentry: {
    captureException: err => console.log('app.sentry.captureException called with', err)
  },
  homey: {
    flow: {
      getTriggerCard: id => {
        return {
          trigger: tokens => console.log('triggerCard', id, 'called with tokens:', tokens)
        }
      }
    }
  }
}

const activeEvents = getActiveEvents({ data, eventLimit, app })
const onceAWeekEvents = activeEvents.filter(event => event.summary === 'OnceAWeek')
const alwaysOngoingEvents = activeEvents.filter(event => event.summary === 'AlwaysOngoing')
const invalidTimezoneData = getActiveEvents({ data: invalidTimezone, eventLimit: eventLimitInvalidTimezone, app })

describe('getActiveEvents returns', () => {
  test('an array', () => {
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

  test('an array where each object should NOT have property skipTZ when all timezones are valid', () => {
    expect(activeEvents[0].skipTZ).toBeFalsy()
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
    expect(() => getActiveEvents({ data: dataNoStart, eventLimit, app })).toThrow()
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

describe('Invalid timezone', () => {
  invalidTimezoneData.forEach(event => {
    test(`"${event.summary}" should have property "skipTZ" set to "true"`, () => {
      expect(event.skipTZ).toBe(true)
    })
  })
})
