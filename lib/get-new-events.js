const moment = require('moment')

const isEventNew = created => {
  if (!created) return false

  const oneDay = 86400000
  const now = moment()
  return (now - created) < oneDay
}

module.exports = (oldCalendarsUids, newCalendarsUids, calendarsEvents, app) => {
  if (oldCalendarsUids.length === 0) return []

  const newlyAddedEvents = newCalendarsUids.filter(newEvent => !oldCalendarsUids.find(oldEvent => newEvent.uid === oldEvent.uid))
  if (newlyAddedEvents.length === 0) return []

  const newEvents = []
  newlyAddedEvents.forEach(newEvent => {
    const calendar = calendarsEvents.find(calendar => calendar.name === newEvent.calendar)
    if (!calendar) {
      app.log('get-new-events: Calendar', newEvent.calendar, 'not found 😬')
      return
    }
    const event = calendar.events.find(event => event.uid === newEvent.uid)
    if (!event) {
      app.log('get-new-events: Event', newEvent.uid, 'in calendar', newEvent.calendar, 'not found 😬')
      return
    }
    if (!isEventNew(event.created)) return
    app.log('get-new-events: Will trigger new event for event with uid', event.uid, 'from', calendar.name, 'with name', event.summary, 'created @', event.created)
    newEvents.push({ ...event, calendarName: calendar.name })
  })

  return newEvents
}
