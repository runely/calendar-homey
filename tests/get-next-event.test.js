'use strict'

const momentInstance = require('moment-timezone')
const { moment } = require('../lib/moment-datetime')
const getNextEvent = require('../lib/get-next-event')

const addHours = hour => moment().add(hour, 'hours').toISOString()

const expectedStart = addHours(1)
const expectedEnd = addHours(2)

const calendars = [
  {
    name: 'events',
    events: [
      {
        start: moment({ date: '2021-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-05T21:00:00.000Z' }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841',
        description: 'Desc',
        location: '',
        summary: 'Past'
      },
      {
        start: moment({ date: '2041-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2041-11-05T21:00:00.000Z' }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
        description: 'Desc',
        location: '',
        summary: 'Future'
      }
    ]
  },
  {
    name: 'events2',
    events: [
      {
        start: moment({ date: '2040-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2040-11-05T21:00:00.000Z' }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8843',
        description: 'Desc',
        location: '',
        summary: 'Future2'
      },
      {
        start: moment({ date: expectedStart }),
        datetype: 'date-time',
        end: moment({ date: expectedEnd }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844',
        description: 'Desc',
        location: '',
        summary: 'next'
      }
    ]
  }
]

describe('Next event has', () => {
  test('expectedStart and expectedEnd when \'specificCalendarName\' is NOT given', () => {
    const nextEvent = getNextEvent({ calendars })
    expect(typeof nextEvent).toBe('object')
    expect(typeof nextEvent.event).toBe('object')
    expect(nextEvent.event.start instanceof momentInstance).toBe(true)
    expect(nextEvent.event.end instanceof momentInstance).toBe(true)
    expect(typeof nextEvent.calendarName).toBe('string')
    expect(nextEvent.event.start.toISOString()).toBe(expectedStart)
    expect(nextEvent.event.end.toISOString()).toBe(expectedEnd)
    expect(nextEvent.calendarName).toBe('events2')
  })

  test('start and end in year 2041 when \'specificCalendarName\' IS given', () => {
    const nextEvent = getNextEvent({ calendars, specificCalendarName: 'events' })
    expect(typeof nextEvent).toBe('object')
    expect(typeof nextEvent.event).toBe('object')
    expect(nextEvent.event.start instanceof momentInstance).toBe(true)
    expect(nextEvent.event.end instanceof momentInstance).toBe(true)
    expect(typeof nextEvent.calendarName).toBe('string')
    expect(nextEvent.event.start.toISOString()).toBe('2041-11-05T20:00:00.000Z')
    expect(nextEvent.event.end.toISOString()).toBe('2041-11-05T21:00:00.000Z')
    expect(nextEvent.calendarName).toBe('events')
  })
})
