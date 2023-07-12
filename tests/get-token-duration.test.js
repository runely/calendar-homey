'use strict'

const { moment } = require('../lib/moment-datetime')
const getTokenDuration = require('../lib/get-token-duration')
const { locale: { humanize }, humanize: { conjunction } } = require('../locales/en.json')

const app = {
  homey: {
    __: prop => {
      if (prop.includes('locale.humanize')) return humanize
      if (prop.includes('humanize.conjunction')) return conjunction
      return ''
    }
  }
}

const event = {
  start: moment(),
  datetype: 'date-time',
  end: moment().add(1, 'hours'),
  uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841',
  description: 'Desc',
  location: '',
  summary: 'startNow'
}

const eventLong = {
  start: moment(),
  datetype: 'date-time',
  end: moment().add(15789, 'minutes'),
  uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841',
  description: 'Desc',
  location: '',
  summary: 'startNow'
}

describe('getTokenDuration', () => {
  test('Returns an object', () => {
    const result = getTokenDuration(app, event)
    expect(result).toBeTruthy()
  })

  test('Returns an object with 2 properties: "duration" and "durationMinutes"', () => {
    const result = getTokenDuration(app, event)
    expect(Object.getOwnPropertyNames(result).length).toBe(2)
  })

  test('Returns an object where "duration" is of type "string" and is "1 hour"', () => {
    const result = getTokenDuration(app, event)
    expect(typeof result.duration).toBe('string')
    expect(result.duration).toBe('1 hour')
  })

  test('Returns an object where "duration" is of type "string" and is "1 week, 3 days and 23 hours"', () => {
    const result = getTokenDuration(app, eventLong)
    expect(typeof result.duration).toBe('string')
    expect(result.duration).toBe('1 week, 3 days and 23 hours')
  })

  test('Returns an object where "durationMinutes" is of type "number" and is 60', () => {
    const result = getTokenDuration(app, event)
    expect(typeof result.durationMinutes).toBe('number')
    expect(result.durationMinutes).toBe(60)
  })
})
