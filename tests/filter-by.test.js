'use strict'

const { moment } = require('../lib/moment-datetime')
const { filterByCalendar, filterByProperty, filterByUID } = require('../lib/filter-by')

const calendars = [
  {
    name: 'CalendarOne',
    events: [
      {
        start: moment({ date: '2021-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-05T21:00:00.000Z' }),
        uid: 'cal_one_One',
        description: 'One - 1',
        location: 'One - 1',
        summary: 'One - 1'
      },
      {
        start: moment({ date: '2021-11-06T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-06T21:00:00.000Z' }),
        uid: 'cal_one_Two',
        description: 'Two - 1',
        location: 'Two - 1',
        summary: 'Two - 1'
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
        description: 'One - 2',
        location: 'One - 2',
        summary: 'One - 2'
      },
      {
        start: moment({ date: '2021-11-06T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-06T21:00:00.000Z' }),
        uid: 'cal_two_Two',
        description: 'Two - 2',
        location: 'Two - 2',
        summary: 'Two - 2'
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

  test('Return 0 calendars - when calendars does not exist', () => {
    const result = filterByCalendar(undefined, 'doesNotMatter')
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })

  test('Return 0 calendars - when calendars does not exist and name is not provided', () => {
    const result = filterByCalendar(undefined)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })
})

describe('filterBy', () => {
  describe('summary - fullMatch:false', () => {
    test('Return 2 calendars with 1 event each - summary "One"', () => {
      const result = filterByProperty(calendars, 'One', 'summary')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(1)
      expect(result[0].events[0].summary).toBe('One - 1')
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(1)
      expect(result[1].events[0].summary).toBe('One - 2')
    })

    test('Return 2 calendars with 0 events - summary "Three"', () => {
      const result = filterByProperty(calendars, 'Three', 'summary')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist', () => {
      const result = filterByProperty(undefined, 'doesNotMatter', 'summary')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist and query is not provided', () => {
      const result = filterByProperty(undefined, undefined, 'summary')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })
  })

  describe('summary - fullMatch:true', () => {
    test('Return 2 calendars with 1 event in CalendarOne - summary "One - 1"', () => {
      const result = filterByProperty(calendars, 'One - 1', 'summary', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(1)
      expect(result[0].events[0].summary).toBe('One - 1')
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 2 calendars with 1 event in CalendarTwo - summary "One - 2"', () => {
      const result = filterByProperty(calendars, 'One - 2', 'summary', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(1)
      expect(result[1].events[0].summary).toBe('One - 2')
    })

    test('Return 2 calendars with 0 events - summary "One"', () => {
      const result = filterByProperty(calendars, 'One', 'summary', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist', () => {
      const result = filterByProperty(undefined, 'doesNotMatter', 'summary', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist and query is not provided', () => {
      const result = filterByProperty(undefined, undefined, 'summary', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })
  })

  describe('description - fullMatch:false', () => {
    test('Return 2 calendars with 1 event each - description "One"', () => {
      const result = filterByProperty(calendars, 'One', 'description')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(1)
      expect(result[0].events[0].description).toBe('One - 1')
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(1)
      expect(result[1].events[0].description).toBe('One - 2')
    })

    test('Return 2 calendars with 0 events - description "Three"', () => {
      const result = filterByProperty(calendars, 'Three', 'description')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist', () => {
      const result = filterByProperty(undefined, 'doesNotMatter', 'description')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist and query is not provided', () => {
      const result = filterByProperty(undefined, undefined, 'description')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })
  })

  describe('description - fullMatch:true', () => {
    test('Return 2 calendars with 1 event in CalendarOne - description "One - 1"', () => {
      const result = filterByProperty(calendars, 'One - 1', 'description', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(1)
      expect(result[0].events[0].description).toBe('One - 1')
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 2 calendars with 1 event in CalendarTwo - description "One - 2"', () => {
      const result = filterByProperty(calendars, 'One - 2', 'description', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(1)
      expect(result[1].events[0].description).toBe('One - 2')
    })

    test('Return 2 calendars with 0 events - description "One"', () => {
      const result = filterByProperty(calendars, 'One', 'description', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist', () => {
      const result = filterByProperty(undefined, 'doesNotMatter', 'description', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist and query is not provided', () => {
      const result = filterByProperty(undefined, undefined, 'description', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })
  })

  describe('location - fullMatch:false', () => {
    test('Return 2 calendars with 1 event each - location "One"', () => {
      const result = filterByProperty(calendars, 'One', 'location')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(1)
      expect(result[0].events[0].location).toBe('One - 1')
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(1)
      expect(result[1].events[0].location).toBe('One - 2')
    })

    test('Return 2 calendars with 0 events - location "Three"', () => {
      const result = filterByProperty(calendars, 'Three', 'location')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist', () => {
      const result = filterByProperty(undefined, 'doesNotMatter', 'location')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist and query is not provided', () => {
      const result = filterByProperty(undefined, undefined, 'location')
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })
  })

  describe('location - fullMatch:true', () => {
    test('Return 2 calendars with 1 event in CalendarOne - location "One - 1"', () => {
      const result = filterByProperty(calendars, 'One - 1', 'location', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(1)
      expect(result[0].events[0].location).toBe('One - 1')
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 2 calendars with 1 event in CalendarTwo - location "One - 2"', () => {
      const result = filterByProperty(calendars, 'One - 2', 'location', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(1)
      expect(result[1].events[0].location).toBe('One - 2')
    })

    test('Return 2 calendars with 0 events - location "One"', () => {
      const result = filterByProperty(calendars, 'One', 'location', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('CalendarOne')
      expect(result[0].events.length).toBe(0)
      expect(result[1].name).toBe('CalendarTwo')
      expect(result[1].events.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist', () => {
      const result = filterByProperty(undefined, 'doesNotMatter', 'location', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })

    test('Return 0 calendars - when calendars does not exist and query is not provided', () => {
      const result = filterByProperty(undefined, undefined, 'location', true)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(0)
    })
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

  test('Return 0 calendars - when calendars does not exist', () => {
    const result = filterByUID(undefined)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(0)
  })
})
