const getDateTimeFormat = require('../lib/get-datetime-format')

jest.mock('homey', () => {
  return {
    __: prop => {
      const { settings: { datetime: { date, time } } } = require('../locales/en.json')
      if (prop.includes('.date.')) return date.default
      if (prop.includes('.time.')) return time.default
      return ''
    },
    ManagerSettings: {
      get: prop => prop || null
    }
  }
})

const formatUndefined = {
  variableMgmt: {
    setting: {
      dateFormat: null,
      timeFormat: null
    }
  }
}

const dateTimeFormat = {
  variableMgmt: {
    setting: {
      dateFormat: 'DD.MM.YYYY',
      timeFormat: 'HH.mm'
    }
  }
}

describe('Date format is correct when', () => {
  test('Default format is used', () => {
    const format = getDateTimeFormat(formatUndefined)
    expect(typeof format).toBe('object')
    expect(typeof format.date).toBe('object')
    expect(typeof format.date.short).toBe('string')
    expect(typeof format.date.long).toBe('string')
    expect(typeof format.date.splitter).toBe('string')
    expect(format.date.short).toBe('MM/DD')
    expect(format.date.long).toBe('MM/DD/YY')
    expect(format.date.splitter).toBe('/')
  })

  test('Format from settings is used', () => {
    const format = getDateTimeFormat(dateTimeFormat)
    expect(typeof format).toBe('object')
    expect(typeof format.date).toBe('object')
    expect(typeof format.date.short).toBe('string')
    expect(typeof format.date.long).toBe('string')
    expect(typeof format.date.splitter).toBe('string')
    expect(format.date.short).toBe('DD.MM')
    expect(format.date.long).toBe('DD.MM.YYYY')
    expect(format.date.splitter).toBe('.')
  })
})

describe('Time format is correct when', () => {
  test('Default format is used', () => {
    const format = getDateTimeFormat(formatUndefined)
    expect(typeof format).toBe('object')
    expect(typeof format.time).toBe('object')
    expect(typeof format.time.time).toBe('string')
    expect(typeof format.time.splitter).toBe('string')
    expect(format.time.time).toBe('HH:mm')
    expect(format.time.splitter).toBe(':')
  })

  test('Format from settings is used', () => {
    const format = getDateTimeFormat(dateTimeFormat)
    expect(typeof format).toBe('object')
    expect(typeof format.time).toBe('object')
    expect(typeof format.time.time).toBe('string')
    expect(typeof format.time.splitter).toBe('string')
    expect(format.time.time).toBe('HH.mm')
    expect(format.time.splitter).toBe('.')
  })
})
