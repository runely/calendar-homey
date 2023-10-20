'use strict'

const { getHitCountData, resetTodayHitCount, setupHitCount, updateHitCount } = require('../lib/hit-count')
const dataAsText = JSON.stringify(require('./data/hit-count-data.json'))

let runtimeData = JSON.parse(dataAsText)

const app = {
  getTimezone: () => 'Europe/Oslo',
  homey: {
    i18n: {
      getLanguage: () => 'no'
    },
    settings: {
      get: (path) => JSON.stringify(runtimeData),
      set: (path, data) => {
        runtimeData = JSON.parse(data)
      }
    }
  },
  log: console.log,
  warn: console.warn,
  variableMgmt: {
    dateTimeFormat: {
      long: 'ddd DD.MM.YY',
      time: 'HH:mm'
    },
    hitCount: {
      data: 'path'
    }
  }
}

const appWithoutData = {
  ...app,
  homey: {
    i18n: {
      getLanguage: () => 'no'
    },
    settings: {
      get: (path) => undefined,
      set: (path, data) => {
        runtimeData = JSON.parse(data)
      }
    }
  }
}

const getIdsWithTodayNotZero = (data) => {
  const ids = []
  data.forEach((t) => {
    if (t.variants.filter((v) => Number.isInteger(v.today) && v.today > 0).length > 0) {
      ids.push(t.id)
    }
  })

  return ids
}

describe('getHitCountData', () => {
  test('Should return parsed JSON when data is present', () => {
    const data = getHitCountData(app)
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBe(11)
    expect(data[0].id).toBe('event_added')
    expect(getIdsWithTodayNotZero(data).length).toBeGreaterThan(0)
  })

  test('Should return undefined when data is not present', () => {
    const data = getHitCountData(appWithoutData)
    expect(Array.isArray(data)).toBeFalsy()
    expect(data).toBe(undefined)
  })
})

describe('resetTodayHitCount', () => {
  beforeEach(() => {
    runtimeData = JSON.parse(dataAsText)
  })

  test('today on all trigger variants should be set to zero when data is present', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBeGreaterThan(0)

    resetTodayHitCount(app)
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
  })

  test('reset should not do anything when data is not present', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBeGreaterThan(0)
    resetTodayHitCount(appWithoutData)
    expect(getIdsWithTodayNotZero(runtimeData).length).toBeGreaterThan(0)
  })
})

describe('setupHitCount', () => {
  beforeEach(() => {
    runtimeData = JSON.parse(dataAsText)
  })

  test('Should create a sceleton for hit count data if data is not present', () => {
    setupHitCount(appWithoutData)
    expect(runtimeData.length).toBe(11)
    expect(runtimeData.filter((t) => t.variants.length > 0).length).toBe(0)
  })

  test('Should add missing trigger when data is present and missing "synchronization_error"', () => {
    runtimeData = runtimeData.filter((t) => t.id !== 'synchronization_error')
    expect(runtimeData.length).toBe(10)
    setupHitCount(app)
    expect(runtimeData.length).toBe(11)
    expect(runtimeData[10].id).toBe('synchronization_error')
    expect(runtimeData[10].variants.length).toBe(0)
  })
})

describe('updateHitCount', () => {
  beforeEach(() => {
    resetTodayHitCount(app)
  })

  test('Should not do anything when data is not present', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)

    updateHitCount(appWithoutData, 'synchronization_error')
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
  })

  test('Should not do anything when triggerId not found', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)

    updateHitCount(appWithoutData, 'non_existing_trigger')
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
  })

  test('Should update only given triggerId with no arguments', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
    expect(runtimeData.find((t) => t.id === 'synchronization_error').variants.length).toBe(0)

    updateHitCount(app, 'synchronization_error')
    const updatedIds = getIdsWithTodayNotZero(runtimeData)
    expect(updatedIds.length).toBe(1)
    expect(updatedIds[0]).toBe('synchronization_error')

    const trigger = runtimeData.find((t) => t.id === 'synchronization_error')
    expect(trigger).toBeTruthy()
    expect(trigger.variants.length).toBe(1)
    expect(typeof trigger.variants[0].lastTriggered).toBe('string')
    expect(trigger.variants[0].total).toBe(1)
    expect(trigger.variants[0].today).toBe(1)
  })

  // test update with one argument
  test('Should update only given triggerId with one argument', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
    expect(runtimeData.find((t) => t.id === 'event_changed_calendar').variants.length).toBe(1)

    const calendar = 'Test'
    updateHitCount(app, 'event_changed_calendar', { calendar })
    const updatedIds = getIdsWithTodayNotZero(runtimeData)
    expect(updatedIds.length).toBe(1)
    expect(updatedIds[0]).toBe('event_changed_calendar')

    const trigger = runtimeData.find((t) => t.id === 'event_changed_calendar')
    expect(trigger).toBeTruthy()
    expect(trigger.variants.length).toBe(1)
    expect(typeof trigger.variants[0].lastTriggered).toBe('string')
    expect(trigger.variants[0].calendar).toBe(calendar)
    expect(trigger.variants[0].total).toBe(1)
    expect(trigger.variants[0].today).toBe(1)
  })

  // test update with two arguments
  test('Should update only given triggerId with two arguments', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
    expect(runtimeData.find((t) => t.id === 'event_starts_in').variants.length).toBe(2)

    const when = 5
    const type = '1'
    updateHitCount(app, 'event_starts_in', { when, type })
    const updatedIds = getIdsWithTodayNotZero(runtimeData)
    expect(updatedIds.length).toBe(1)
    expect(updatedIds[0]).toBe('event_starts_in')

    const trigger = runtimeData.find((t) => t.id === 'event_starts_in')
    expect(trigger).toBeTruthy()
    expect(trigger.variants.length).toBe(2)
    expect(trigger.variants[0].lastTriggered).toBe(undefined)
    expect(trigger.variants[0].when).toBe(25)
    expect(trigger.variants[0].type).toBe(type)
    expect(trigger.variants[0].total).toBe(0)
    expect(trigger.variants[0].today).toBe(0)
    expect(typeof trigger.variants[1].lastTriggered).toBe('string')
    expect(trigger.variants[1].when).toBe(when)
    expect(trigger.variants[1].type).toBe(type)
    expect(trigger.variants[1].total).toBe(1) // this should be 1 because no other tests have updated this triggerId yet
    expect(trigger.variants[1].today).toBe(1)
  })

  // test update with two arguments (switched order)
  test('Should update only given triggerId with two arguments (switched order)', () => {
    expect(getIdsWithTodayNotZero(runtimeData).length).toBe(0)
    expect(runtimeData.find((t) => t.id === 'event_starts_in').variants.length).toBe(2)

    const when = 5
    const type = '1'
    updateHitCount(app, 'event_starts_in', { type, when })
    const updatedIds = getIdsWithTodayNotZero(runtimeData)
    expect(updatedIds.length).toBe(1)
    expect(updatedIds[0]).toBe('event_starts_in')

    const trigger = runtimeData.find((t) => t.id === 'event_starts_in')
    expect(trigger).toBeTruthy()
    expect(trigger.variants.length).toBe(2)
    expect(trigger.variants[0].lastTriggered).toBe(undefined)
    expect(trigger.variants[0].when).toBe(25)
    expect(trigger.variants[0].type).toBe(type)
    expect(trigger.variants[0].total).toBe(0)
    expect(trigger.variants[0].today).toBe(0)
    expect(typeof trigger.variants[1].lastTriggered).toBe('string')
    expect(trigger.variants[1].when).toBe(when)
    expect(trigger.variants[1].type).toBe(type)
    expect(trigger.variants[1].total).toBe(2) // this should be 2 because the previous test updated this triggerId aswell
    expect(trigger.variants[1].today).toBe(1) // this should be 1 because the beforeEach reset it
  })
})
