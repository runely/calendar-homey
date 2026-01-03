'use strict'

const constructedApp = require('./lib/construct-app')
const { moment } = require('../lib/moment-datetime')
const getNewEvents = require('../lib/get-new-events')

/**
 * @type {import('../types/AppTests.type').AppTests}
 */
const app = {
  ...constructedApp
}

const calendarsEvents = [
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
        summary: 'startNow',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        start: moment().subtract(1, 'hour'),
        datetype: 'date-time',
        end: moment(),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
        description: 'Desc',
        location: '',
        summary: 'stopNow',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
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
        summary: 'Future2',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        start: moment().subtract(2, 'hours'),
        datetype: 'date-time',
        end: moment().subtract(1, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844',
        description: 'Desc',
        location: '',
        summary: 'Future',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        start: moment().subtract(4, 'hours'),
        datetype: 'date-time',
        end: moment().subtract(2, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845',
        description: 'Desc',
        location: '',
        summary: 'Future',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        created: moment().subtract(8, 'hours'),
        start: moment().subtract(4, 'hours'),
        datetype: 'date-time',
        end: moment().subtract(2, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8846',
        description: 'Desc',
        location: '',
        summary: 'Future',
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        created: moment().subtract(28, 'hours'),
        start: moment().subtract(4, 'hours'),
        datetype: 'date-time',
        end: moment().subtract(2, 'hours'),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8847',
        description: 'Desc',
        location: '',
        summary: 'Future',
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      }
    ]
  }
]

const oldCalendarsUids = [
  {
    calendar: 'events',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8841'
  },
  {
    calendar: 'events',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842'
  },
  {
    calendar: 'events2',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8843'
  },
  {
    calendar: 'events2',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844'
  }
]

test('When 0 new events - Will return an empty array', () => {
  const result = getNewEvents({ timezone: 'UTC', oldCalendarsUids, newCalendarsUids: [], calendarsEvents, app })
  expect(result.length).toBe(0)
})

test('When 0 old events - Will return an empty array', () => {
  const result = getNewEvents({ timezone: 'UTC', oldCalendarsUids: [], newCalendarsUids: [], calendarsEvents, app })
  expect(result.length).toBe(0)
})

test('When 1 new event, but "created" property is missing - Will return 0 events', () => {
  const calendarsUids = {
    calendar: 'events2',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8845'
  }
  const result = getNewEvents({
    timezone: 'UTC',
    oldCalendarsUids,
    newCalendarsUids: [calendarsUids],
    calendarsEvents,
    app
  })
  expect(result.length).toBe(0)
})

test('When 1 new event, and "created" is more then last 24 hours - Will return 0 event', () => {
  const calendarsUids = {
    calendar: 'events2',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8847'
  }
  const result = getNewEvents({
    timezone: 'UTC',
    oldCalendarsUids,
    newCalendarsUids: [calendarsUids],
    calendarsEvents,
    app
  })
  expect(result.length).toBe(0)
})

test('When 1 new event, and "created" is within the last 24 hours - Will return 1 event', () => {
  const calendarsUids = {
    calendar: 'events2',
    uid: 'F7177A32-DBD4-46A9-85C7-669749EA8846'
  }
  const result = getNewEvents({
    timezone: 'UTC',
    oldCalendarsUids,
    newCalendarsUids: [calendarsUids],
    calendarsEvents,
    app
  })
  expect(result.length).toBe(1)
  expect(result[0].calendarName).toBe(calendarsUids.calendar)
  expect(result[0].uid).toBe(calendarsUids.uid)
})
