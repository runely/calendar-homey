'use strict'

const momentInstance = require('moment-timezone')
const moment = require('../lib/moment-datetime')
const findEnd = require('../lib/find-regular-event-end')

const events = [
  {
    start: '2021-11-02T06:45:00.000Z',
    datetype: 'date-time',
    end: '2021-11-02T07:15:00.000Z',
    uid: '11E28AB2-B778-40D2-A303-A62A43234321',
    description: '',
    location: '',
    summary: 'Event with end returns end'
  },
  {
    start: '2021-11-02T06:45:00.000Z',
    datetype: 'date-time',
    uid: '11E28AB2-B778-40D2-A303-A62A43234321',
    description: '',
    location: '',
    summary: 'Event without end and duration will return start IF dateype is date-time'
  },
  {
    start: '2021-11-02T00:00:00.000Z',
    datetype: 'date',
    uid: '11E28AB2-B778-40D2-A303-A62A43234321',
    description: '',
    location: '',
    summary: 'Event without end and duration will return (start + 1 day) IF dateype is date'
  },
  {
    start: '2021-11-02T00:00:00.000Z',
    datetype: 'date-time',
    duration: 'P15DT5H0M20S',
    uid: '11E28AB2-B778-40D2-A303-A62A43234321',
    description: '',
    location: '',
    summary: 'Event without end but duration will return start IF datetype is date-time'
  },
  {
    start: '2021-11-02T00:00:00.000Z',
    datetype: 'date',
    duration: 'P15DT5H0M20S',
    uid: '11E28AB2-B778-40D2-A303-A62A43234321',
    description: '',
    location: '',
    summary: 'Event without end but duration will return (start + duration) IF datetype is date'
  }
]

test('Event with end returns end', () => {
  const event = events.find(e => e.summary === 'Event with end returns end')
  const end = findEnd({ event })
  expect(end instanceof momentInstance).toBe(true)
  expect(end.toISOString()).toBe(event.end)
})

test('Event without end and duration will return start IF dateype is date-time', () => {
  const event = events.find(e => e.summary === 'Event without end and duration will return start IF dateype is date-time')
  const end = findEnd({ event })
  expect(end instanceof momentInstance).toBe(true)
  expect(end.toISOString()).toBe(event.start)
})

test('Event without end and duration will return (start + 1 day) IF dateype is date', () => {
  const event = events.find(e => e.summary === 'Event without end and duration will return (start + 1 day) IF dateype is date')
  const end = findEnd({ event })
  const tomorrow = moment({ date: event.start }).add(1, 'day').toISOString()
  expect(end instanceof momentInstance).toBe(true)
  expect(end.toISOString()).toBe(tomorrow)
})

test('Event without end but duration will return start IF datetype is date-time', () => {
  const event = events.find(e => e.summary === 'Event without end but duration will return start IF datetype is date-time')
  const end = findEnd({ event })
  expect(end instanceof momentInstance).toBe(true)
  expect(end.toISOString()).toBe(event.start)
})

test('Event without end but duration will return (start + duration) IF datetype is date', () => {
  const event = events.find(e => e.summary === 'Event without end but duration will return (start + duration) IF datetype is date')
  const end = findEnd({ event })
  const duration = '2021-11-17T05:00:20.000Z'
  expect(end instanceof momentInstance).toBe(true)
  expect(end.toISOString()).toBe(duration)
})
