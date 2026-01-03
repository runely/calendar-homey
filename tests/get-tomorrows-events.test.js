'use strict'

const momentInstance = require('moment-timezone')
const { moment } = require('../lib/moment-datetime')
const getEventsTomorrow = require('../lib/get-tomorrows-events')

const expectedStart = moment()
  .add(1, 'day')
  .set('hours', 23)
  .set('minutes', 58)
  .set('seconds', 59)
  .toISOString()
const expectedEnd = moment()
  .add(1, 'day')
  .set('hours', 23)
  .set('minutes', 59)
  .set('seconds', 59)
  .toISOString()

/** @type {import('../types/VariableMgmt.type').VariableManagementCalendars} */
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
        summary: 'Past',
        created: undefined,
        fullDayEvent: false,
        skipTZ: true,
        freeBusy: '',
        meetingUrl: '',
        local: false
      },
      {
        start: moment({ date: '2041-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2041-11-05T21:00:00.000Z' }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8842',
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
        start: moment({ date: expectedStart }),
        datetype: 'date-time',
        end: moment({ date: expectedEnd }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8843',
        description: 'Desc',
        location: '',
        summary: 'Today1',
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
        start: moment({ date: '2040-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2040-11-05T21:00:00.000Z' }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8844',
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
        start: moment({ date: '2041-11-05T20:00:00.000Z' }),
        datetype: 'date-time',
        end: moment({ date: '2041-11-05T21:00:00.000Z' }),
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
        start: moment({ date: expectedStart }),
        datetype: 'date-time',
        end: moment({ date: expectedEnd }),
        uid: 'F7177A32-DBD4-46A9-85C7-669749EA8846',
        description: 'Desc',
        location: '',
        summary: 'Today2',
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

describe('Tomorrows event count is', () => {
  test('2 when \'specificCalendarName\' is NOT given', () => {
    const tomorrowsEvents = getEventsTomorrow({ calendars })
    expect(Array.isArray(tomorrowsEvents)).toBe(true)
    expect(tomorrowsEvents.length).toBe(2)
    expect(typeof tomorrowsEvents[0]).toBe('object')
    expect(typeof tomorrowsEvents[0].calendarName).toBe('string')
    expect(tomorrowsEvents[0].start instanceof momentInstance).toBe(true)
    expect(tomorrowsEvents[0].end instanceof momentInstance).toBe(true)
    expect(typeof tomorrowsEvents[0].summary).toBe('string')
    expect(tomorrowsEvents[0].start.toISOString()).toBe(expectedStart)
    expect(tomorrowsEvents[0].end.toISOString()).toBe(expectedEnd)
    expect(tomorrowsEvents[0].summary).toBe('Today1')
    expect(tomorrowsEvents[0].calendarName).toBe('events')
    expect(typeof tomorrowsEvents[1]).toBe('object')
    expect(typeof tomorrowsEvents[1].calendarName).toBe('string')
    expect(tomorrowsEvents[1].start instanceof momentInstance).toBe(true)
    expect(tomorrowsEvents[1].end instanceof momentInstance).toBe(true)
    expect(typeof tomorrowsEvents[1].summary).toBe('string')
    expect(tomorrowsEvents[1].start.toISOString()).toBe(expectedStart)
    expect(tomorrowsEvents[1].end.toISOString()).toBe(expectedEnd)
    expect(tomorrowsEvents[1].summary).toBe('Today2')
    expect(tomorrowsEvents[1].calendarName).toBe('events2')
  })

  test('1 when \'specificCalendarName\' IS given', () => {
    const tomorrowsEvents = getEventsTomorrow({ calendars, specificCalendarName: 'events2' })
    expect(Array.isArray(tomorrowsEvents)).toBe(true)
    expect(tomorrowsEvents.length).toBe(1)
    expect(typeof tomorrowsEvents[0]).toBe('object')
    expect(typeof tomorrowsEvents[0].summary).toBe('string')
    expect(typeof tomorrowsEvents[0].calendarName).toBe('string')
    expect(tomorrowsEvents[0].start instanceof momentInstance).toBe(true)
    expect(tomorrowsEvents[0].end instanceof momentInstance).toBe(true)
    expect(tomorrowsEvents[0].start.toISOString()).toBe(expectedStart)
    expect(tomorrowsEvents[0].end.toISOString()).toBe(expectedEnd)
    expect(tomorrowsEvents[0].summary).toBe('Today2')
    expect(tomorrowsEvents[0].calendarName).toBe('events2')
  })
})
