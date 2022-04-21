'use strict'

const moment = require('../lib/moment-datetime')
const getEventUids = require('../lib/get-event-uids')

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
        start: moment({ date: '2041-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2041-11-05T21:00:00.000Z' }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
        description: 'Desc',
        location: '',
        summary: 'Future'
      }
    ]
  }
]

test('No calendars returns an empty array', () => {
  const result = getEventUids([])
  expect(result.length).toBe(0)
})

test('Will return only unique uids', () => {
  const result = getEventUids(calendars)
  expect(result.length).toBe(3)
})

test('Returned array will be objects with a "calendar" and "uid" property', () => {
  const result = getEventUids(calendars)
  expect(result[0].calendar).toBe('events')
  expect(result[0].uid).toBe(calendars[0].events[0].uid)
})
