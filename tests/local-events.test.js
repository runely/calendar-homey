'use strict'

const constructedApp = require('./lib/construct-app')
const { moment } = require('../lib/moment-datetime')
const { getLocalActiveEvents, saveLocalEvents } = require('../lib/local-events')

/**
 * @type {import('../types/AppTests.type').AppTests}
 */
const app = {
  ...constructedApp,
  homey: {
    __: jest.fn(),
    settings: {
      set: jest.fn((storageString, jsonString) => console.log('Save', jsonString, 'to', storageString))
    }
  },
  variableMgmt: {
    storage: {
      localEvents: 'localEvents'
    }
  }
}

const events = [
  {
    start: moment({ date: '2021-11-05T20:00:00.000Z' }),
    datetype: 'date-time',
    end: moment({ date: '2021-11-05T21:00:00.000Z' }),
    uid: 'cal_one_One',
    description: 'One',
    location: '',
    summary: 'One',
    created: undefined,
    fullDayEvent: false,
    skipTZ: true,
    freebusy: '',
    meetingUrl: '',
    local: false
  },
  {
    start: moment({ date: '2021-11-06T20:00:00.000Z' }),
    datetype: 'date-time',
    end: moment({ date: '2021-11-06T21:00:00.000Z' }),
    uid: 'cal_one_Two',
    description: 'Two',
    location: '',
    summary: 'Two',
    created: undefined,
    fullDayEvent: false,
    skipTZ: true,
    freebusy: '',
    meetingUrl: '',
    local: false
  }
]

const localEvents = [
  {
    start: '2021-11-05T20:00:00.000Z',
    datetype: 'date-time',
    end: '2021-11-05T21:00:00.000Z',
    uid: 'cal_one_One',
    description: 'One',
    location: '',
    summary: 'One',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: false
  },
  {
    start: '2021-11-06T20:00:00.000Z',
    datetype: 'date-time',
    end: '2021-11-06T21:00:00.000Z',
    uid: 'cal_one_Two',
    description: 'Two',
    location: '',
    summary: 'Two',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: false
  },
  {
    start: moment().add(7, 'days').toISOString(),
    datetype: 'date-time',
    end: moment().add(7, 'days').add(2, 'hours').toISOString(),
    uid: 'cal_one_Three',
    description: 'Three',
    location: '',
    summary: 'Three',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: true
  },
  {
    start: moment({ timezone: 'Europe/Oslo' }).add(7, 'days').toISOString(),
    datetype: 'date-time',
    end: moment({ timezone: 'Europe/Oslo' }).add(7, 'days').add(2, 'hours').toISOString(),
    uid: 'cal_one_Four',
    description: 'Four',
    location: '',
    summary: 'Four',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: false
  },
  {
    start: moment().add(365, 'days').toISOString(),
    datetype: 'date-time',
    end: moment().add(365, 'days').add(2, 'hours').toISOString(),
    uid: 'cal_one_Five',
    description: 'Five',
    location: '',
    summary: 'Five',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: true
  }
]

const ongoingEvents = [
  {
    start: moment({ timezone: 'Europe/Oslo' }).subtract(1, 'days').toISOString(),
    datetype: 'date-time',
    end: moment({ timezone: 'Europe/Oslo' }).add(2, 'days').add(2, 'hours').toISOString(),
    uid: 'cal_one_One',
    description: 'One',
    location: '',
    summary: 'One',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: false
  },
  {
    start: moment({ timezone: 'Europe/Oslo' }).subtract(2, 'days').toISOString(),
    datetype: 'date-time',
    end: moment({ timezone: 'Europe/Oslo' }).add(7, 'days').add(2, 'hours').toISOString(),
    uid: 'cal_one_Two',
    description: 'Two',
    location: '',
    summary: 'Two',
    created: '2021-11-05T18:00:00.000Z',
    skipTZ: false
  }
]

const options = {
  timezone: 'Europe/Oslo',
  events: localEvents,
  eventLimit: {
    value: '3',
    type: 'weeks'
  },
  app,
  logAllEvents: true
}

describe('saveLocalEvents', () => {
  test("Does not save when 'events' isn't an array", () => {
    saveLocalEvents(app, '')
    expect(app.homey.settings.set.mock.calls).toHaveLength(0)
  })

  test("Does save when 'events' is an array", () => {
    saveLocalEvents(app, events)
    expect(app.homey.settings.set.mock.calls).toHaveLength(1)
  })
})

describe('getLocalActiveEvents', () => {
  test('Returns 2 events', () => {
    const result = getLocalActiveEvents(options)
    const three = result.find((r) => r.summary === 'Three')
    const four = result.find((r) => r.summary === 'Four')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(three).toBeTruthy()
    expect(three.start.isUtcOffset()).toBeFalsy()
    expect(four).toBeTruthy()
    expect(four.start.isUtcOffset()).toBeTruthy()
  })

  test('Returns 2 events when events passed in is ongoing', () => {
    console.log('ongoingEvents:', ongoingEvents)
    const result = getLocalActiveEvents({ ...options, events: ongoingEvents })
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
  })

  test('Returns empty array when no events passed in', () => {
    const result = getLocalActiveEvents({ ...options, events: [] })
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })

  test("Returns empty array when events passed in isn't within eventLimit", () => {
    const result = getLocalActiveEvents({ ...options, eventLimit: { value: '2', type: 'days' } })
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })
})
