'use strict'

const sortCalendars = require('../lib/sort-calendars')
const { moment } = require('../lib/moment-datetime')

/** @type {import('../types/VariableMgmt.type').VariableManagementCalendars} */
const calendars = [
  {
    name: 'CalendarOne',
    events: [
      {
        start: moment({ date: '2021-11-06T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-06T21:00:00.000Z' }),
        uid: 'cal_one_Two',
        description: 'Two',
        location: '',
        summary: 'Two',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        start: moment({ date: '2021-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-05T21:00:00.000Z' }),
        uid: 'cal_one_One',
        description: 'One',
        location: '',
        summary: 'One',
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
    name: 'CalendarTwo',
    events: [
      {
        start: moment({ date: '2021-11-06T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-06T21:00:00.000Z' }),
        uid: 'cal_two_Two',
        description: 'Two',
        location: '',
        summary: 'Two',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        start: moment({ date: '2021-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2021-11-05T21:00:00.000Z' }),
        uid: 'cal_two_One',
        description: 'One',
        location: '',
        summary: 'One',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      }
    ]
  }
]

test('Calendar events are sorted after "start" datetime', () => {
  const result = sortCalendars(calendars)
  expect(result.length).toBe(2)
  expect(result[0].name).toBe('CalendarOne')
  expect(result[0].events.length).toBe(2)
  expect(result[0].events[0].uid).toBe('cal_one_One')
  expect(result[0].events[1].uid).toBe('cal_one_Two')
  expect(result[1].name).toBe('CalendarTwo')
  expect(result[1].events.length).toBe(2)
  expect(result[1].events[0].uid).toBe('cal_two_One')
  expect(result[1].events[1].uid).toBe('cal_two_Two')
})
