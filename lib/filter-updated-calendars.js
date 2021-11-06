const Homey = require('homey')

const hasData = data => data !== undefined && data !== null

const isChanged = (previous, current) => {
  if (hasData(previous) && hasData(current)) return previous.toString().toLowerCase() !== current.toString().toLowerCase()
  return (hasData(previous) && !hasData(current)) || (!hasData(previous) && hasData(current))
}

module.exports = (oldCalendars, newCalendars) => {
  const updatedCalendars = []
  newCalendars.forEach(newCalendar => {
    const newCalendarName = newCalendar.name
    const oldCalendar = oldCalendars.find(calendar => calendar.name === newCalendarName)
    const oldCalendarEvents = oldCalendar ? oldCalendar.events : []
    newCalendar.events.forEach(newEvent => {
      const oldEvent = oldCalendarEvents.find(event => event.uid === newEvent.uid)
      if (!oldEvent) return

      const changed = []
      if (isChanged(oldEvent.start, newEvent.start)) changed.push({ type: Homey.__('triggers.event_changed.start'), previousValue: oldEvent.start, newValue: newEvent.start })
      if (isChanged(oldEvent.end, newEvent.end)) changed.push({ type: Homey.__('triggers.event_changed.end'), previousValue: oldEvent.end, newValue: newEvent.end })
      if (isChanged(oldEvent.description, newEvent.description)) changed.push({ type: Homey.__('triggers.event_changed.description'), previousValue: oldEvent.description, newValue: newEvent.description })
      if (isChanged(oldEvent.location, newEvent.location)) changed.push({ type: Homey.__('triggers.event_changed.location'), previousValue: oldEvent.location, newValue: newEvent.location })
      if (isChanged(oldEvent.summary, newEvent.summary)) changed.push({ type: Homey.__('triggers.event_changed.summary'), previousValue: oldEvent.summary, newValue: newEvent.summary })

      if (changed.length > 0) {
        const updatedCalendar = updatedCalendars.find(calendar => calendar.name === newCalendarName)
        const updatedEvent = { ...newEvent, changed }
        updatedCalendar ? updatedCalendar.events.push(updatedEvent) : updatedCalendars.push({ name: newCalendarName, events: [updatedEvent] })
      }
    })
  })

  return updatedCalendars
}
