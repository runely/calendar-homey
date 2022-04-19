'use strict'

const moment = require('../lib/moment-datetime')
const { filterByCalendar, filterBySummary, filterByUID } = require('../lib/filter-by')

const calendars = [
  {
    name: 'CalendarOne',
    events: [
      {
        start: moment({ date: '2021-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-05T21:00:00.000Z' }),
        uid: 'cal_one_One',
        description: 'One',
        location: '',
        summary: 'One'
      },
      {
        start: moment({ date: '2021-11-06T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-06T21:00:00.000Z' }),
        uid: 'cal_one_Two',
        description: 'Two',
        location: '',
        summary: 'Two'
      }
    ]
  },
  {
    name: 'CalendarTwo',
    events: [
      {
        start: moment({ date: '2021-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-05T21:00:00.000Z' }),
        uid: 'cal_two_One',
        description: 'One',
        location: '',
        summary: 'One'
      },
      {
        start: moment({ date: '2021-11-06T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-06T21:00:00.000Z' }),
        uid: 'cal_two_Two',
        description: 'Two',
        location: '',
        summary: 'Two'
      }
    ]
  }
]

describe('filterByCalendar', () => {
  test('Return 1 calendar - name "CalendarOne"', () => {
    const result = filterByCalendar(calendars, 'CalendarOne')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('CalendarOne')
  })

  test('Return 0 calendars - name "CalendarThree"', () => {
    const result = filterByCalendar(calendars, 'CalendarThree')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })
})

describe('filterBySummary', () => {
  test('Return 2 calendars with 1 event each - summary "One"', () => {
    const result = filterBySummary(calendars, 'One')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('CalendarOne')
    expect(result[0].events[0].summary).toBe('One')
    expect(result[1].name).toBe('CalendarTwo')
    expect(result[1].events[0].summary).toBe('One')
  })

  test('Return 2 calendars with 0 events - summary "Three"', () => {
    const result = filterBySummary(calendars, 'Three')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('CalendarOne')
    expect(result[0].events.length).toBe(0)
    expect(result[1].name).toBe('CalendarTwo')
    expect(result[1].events.length).toBe(0)
  })
})

describe('filterByUID', () => {
  test('Return 2 calendars, 1 with 1 event, and 1 with 0 events - uid "cal_one_One"', () => {
    const result = filterByUID(calendars, 'cal_one_One')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('CalendarOne')
    expect(result[0].events[0].uid).toBe('cal_one_One')
    expect(result[1].name).toBe('CalendarTwo')
    expect(result[1].events.length).toBe(0)
  })

  test('Return 2 calendars with 0 events - uid "cal_three_One"', () => {
    const result = filterByUID(calendars, 'cal_three_One')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('CalendarOne')
    expect(result[0].events.length).toBe(0)
    expect(result[1].name).toBe('CalendarTwo')
    expect(result[1].events.length).toBe(0)
  })
})
