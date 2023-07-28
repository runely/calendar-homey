'use strict'

const constructedApp = require('./lib/construct-app')
const getDateTimeFormat = require('../lib/get-datetime-format')
const { settings: { datetime: { date, time } } } = require('../locales/en.json')

const app = {
  ...constructedApp,
  homey: {
    __: (prop) => {
      if (prop.includes('.date.')) return date.default
      if (prop.includes('.time.')) return time.default
      return ''
    },
    settings: {
      get: (prop) => prop || null,
      set: (prop, value) => console.log('Setting', prop, 'to', value)
    }
  }
}

const appFormatUndefined = {
  ...app,
  variableMgmt: {
    setting: {
      dateFormat: null,
      dateFormatLong: null,
      dateFormatShort: null,
      timeFormat: null
    }
  }
}

const appDateTimeFormatLegacy = {
  ...app,
  variableMgmt: {
    setting: {
      dateFormat: 'DD.MM.YYYY',
      dateFormatLong: null,
      dateFormatShort: null,
      timeFormat: 'HH.mm'
    }
  }
}

const appDateTimeFormatShortUndefined = {
  ...app,
  variableMgmt: {
    setting: {
      dateFormat: 'DD.MM.YYYY',
      dateFormatLong: 'DD-MM-YY',
      timeFormat: 'HH.mm'
    }
  }
}

const appDateTimeFormat = {
  ...app,
  variableMgmt: {
    setting: {
      dateFormat: 'DD.MM.YYYY',
      dateFormatLong: 'DD-MM-YY',
      dateFormatShort: 'DD.MM',
      timeFormat: 'HH.mm'
    }
  }
}

describe('Date format is correct when', () => {
  test('Default format is used', () => {
    const format = getDateTimeFormat(appFormatUndefined)
    expect(typeof format).toBe('object')
    expect(typeof format.short).toBe('string')
    expect(typeof format.long).toBe('string')
    expect(format.short).toBe('MM/DD')
    expect(format.long).toBe('MM/DD/YY')
  })

  test('Legacy format from settings is used', () => {
    const format = getDateTimeFormat(appDateTimeFormatLegacy)
    expect(typeof format).toBe('object')
    expect(typeof format.short).toBe('string')
    expect(typeof format.long).toBe('string')
    expect(format.short).toBe('DD.MM')
    expect(format.long).toBe('DD.MM.YYYY')
  })

  test('Format from settings is used, short is undefined', () => {
    const format = getDateTimeFormat(appDateTimeFormatShortUndefined)
    expect(typeof format).toBe('object')
    expect(typeof format.short).toBe('string')
    expect(typeof format.long).toBe('string')
    expect(format.short).toBe('DD-MM')
    expect(format.long).toBe('DD-MM-YY')
  })

  test('Format from settings is used', () => {
    const format = getDateTimeFormat(appDateTimeFormat)
    expect(typeof format).toBe('object')
    expect(typeof format.short).toBe('string')
    expect(typeof format.long).toBe('string')
    expect(format.short).toBe('DD.MM')
    expect(format.long).toBe('DD-MM-YY')
  })
})

describe('Time format is correct when', () => {
  test('Default format is used', () => {
    const format = getDateTimeFormat(appFormatUndefined)
    expect(typeof format).toBe('object')
    expect(typeof format.time).toBe('string')
    expect(format.time).toBe('HH:mm')
  })

  test('Format from settings is used', () => {
    const format = getDateTimeFormat(appDateTimeFormat)
    expect(typeof format).toBe('object')
    expect(typeof format.time).toBe('string')
    expect(format.time).toBe('HH.mm')
  })
})
