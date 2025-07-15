'use strict'

const { calendarAutocomplete } = require('../lib/autocomplete')
const constructedApp = require('./lib/construct-app')

/**
 * @type {import('../types/AppTests.type').AppTests}
 */
const app = {
  ...constructedApp,
  variableMgmt: {
    calendars: [
      {
        name: 'One',
        events: []
      },
      {
        name: 'Two',
        events: []
      }
    ]
  }
}

describe('calendarAutocomplete', () => {
  test('Returns an empty list when \'app.variableMgmt.calendars\' doesn\'t exist', () => {
    const result = calendarAutocomplete({ ...constructedApp, variableMgmt: { tokens: [] } }, '')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })

  test('Returns an empty list when \'app.variableMgmt.calendars\' is empty', () => {
    const result = calendarAutocomplete({ ...constructedApp, variableMgmt: { calendars: [] } }, '')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })

  test('Returns an empty list when query isn\'t a calendar name present', () => {
    const result = calendarAutocomplete(app, 'Three')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })

  test("Returns 1 calendar when query is 'One'", () => {
    const result = calendarAutocomplete(app, 'One')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('One')
    expect(result[0].name).toBe('One')
  })

  test("Returns 1 calendar when query is 'Two'", () => {
    const result = calendarAutocomplete(app, 'Two')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('Two')
    expect(result[0].name).toBe('Two')
  })

  test('Returns 2 calendars when query isn\'t present', () => {
    const result = calendarAutocomplete(app, undefined)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0].id).toBe('One')
    expect(result[0].name).toBe('One')
    expect(result[1].id).toBe('Two')
    expect(result[1].name).toBe('Two')
  })
})
