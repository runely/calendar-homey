'use strict'

const { moment } = require('../lib/moment-datetime')
const getEventsToTrigger = require('../lib/get-events-to-trigger')

const app = {
  log: (...args) => console.log(...args)
}

const calendars = [
  {
    name: 'events',
    events: [
      {
        start: moment(),
        datetype: 'date-time',
        end: moment().add(1, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841',
        description: 'Desc',
        location: '',
        summary: 'startNow'
      },
      {
        start: moment().subtract(1, 'hour'),
        datetype: 'date-time',
        end: moment(),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
        description: 'Desc',
        location: '',
        summary: 'stopNow'
      }
    ]
  },
  {
    name: 'events2',
    events: [
      {
        start: moment().add(2, 'hours'),
        datetype: 'date-time',
        end: moment().add(3, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8843',
        description: 'Desc',
        location: '',
        summary: 'Future2'
      },
      {
        start: moment().subtract(2, 'hours'),
        datetype: 'date-time',
        end: moment().subtract(1, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844',
        description: 'Desc',
        location: '',
        summary: 'Future'
      }
    ]
  }
]

const calendarResult = getEventsToTrigger({ app, calendars })

test('No calendars will return an empty array', () => {
  const result = getEventsToTrigger({ app, calendars: [] })
  expect(result.length).toBe(0)
})

test('When start is now - Will return 3 events', () => {
  const result = calendarResult.filter((res) => res.event.uid === 'F7177A32-DBD4-46A9-85C7-669749EA8841')
  expect(result.length).toBe(3)
  expect(result[0].triggerId).toBe('event_starts')
  expect(result[0].state).toBeFalsy()
  expect(result[1].triggerId).toBe('event_starts_calendar')
  expect(result[1].state.calendarName).toBe('events')
  expect(result[2].triggerId).toBe('event_stops_in')
  expect(result[2].state.when).toBe(60)
})

test('When end is now - Will return 2 events', () => {
  const result = calendarResult.filter((res) => res.event.uid === 'F7177A32-DBD4-46A9-85C7-669749EA8842')
  expect(result.length).toBe(2)
  expect(result[0].triggerId).toBe('event_stops')
  expect(result[0].state).toBeFalsy()
  expect(result[1].triggerId).toBe('event_stops_calendar')
  expect(result[1].state.calendarName).toBe('events')
})

test('When start is in 2 hours - Will return 2 events', () => {
  const result = calendarResult.filter((res) => res.event.uid === 'F7177A32-DBD4-46A9-85C7-669749EA8843')
  expect(result.length).toBe(2)
  expect(result[0].triggerId).toBe('event_starts_in')
  expect(result[0].state.when).toBe(120)
  expect(result[1].triggerId).toBe('event_stops_in')
  expect(result[1].state.when).toBe(180)
})

test('When start and end has past - Will return 0 events', () => {
  const result = calendarResult.filter((res) => res.event.uid === 'F7177A32-DBD4-46A9-85C7-669749EA8844')
  expect(result.length).toBe(0)
})
