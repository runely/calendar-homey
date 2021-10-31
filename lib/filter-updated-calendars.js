const isChanged = (previous, current) => {
  if (!!previous && !!current) return previous.toString().toLowerCase() !== current.toString().toLowerCase()
  return (!!!previous && !!current) || (!!previous && !!!current)
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
      if (isChanged(oldEvent.start, newEvent.start)) changed.push({ type: 'start', previousValue: oldEvent.start, newValue: newEvent.start })
      if (isChanged(oldEvent.end, newEvent.end)) changed.push({ type: 'end', previousValue: oldEvent.end, newValue: newEvent.end })
      if (isChanged(oldEvent.description, newEvent.description)) changed.push({ type: 'description', previousValue: oldEvent.description, newValue: newEvent.description })
      if (isChanged(oldEvent.location, newEvent.location)) changed.push({ type: 'location', previousValue: oldEvent.location, newValue: newEvent.location })
      if (isChanged(oldEvent.summary, newEvent.summary)) changed.push({ type: 'summary', previousValue: oldEvent.summary, newValue: newEvent.summary })

      if (changed.length > 0) {
        const updatedCalendar = updatedCalendars.find(calendar => calendar.name === newCalendarName)
        const updatedEvent = { ...newEvent, changed }
        updatedCalendar ? updatedCalendar.events.push(updatedEvent) : updatedCalendars.push({ name: newCalendarName, events: [ updatedEvent ] })
      }
    })
  })

  return updatedCalendars
}
