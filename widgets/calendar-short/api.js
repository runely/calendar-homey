'use strict'
const sortEvents = require('./../../lib/sort-events')

/**
 * Gets the day key for a given datetime.
 * @param {Object} datetime - The datetime object to process.
 * @returns {Object} - The day key for the given datetime.
 */
const getDayKey = (datetime) => {
  return datetime.clone().startOf('day')
}

/**
 * Creates a copy of the calendar object without the 'events' property.
 * @param {Object} calendar - The calendar object to process.
 * @returns {Object} - The calendar object without the 'events' property.
 */
const createCalendarWithoutEvents = (calendar) => {
  const { events: _, ...calendarWithoutEvents } = calendar
  return calendarWithoutEvents
}

/**
 * Adds the calendar reference to each event in the calendar.
 * @param {Object} calendar - The calendar object containing events.
 * @param {Object} calendarWithoutEvents - The calendar object without the 'events' property.
 * @returns {Array} - An array of events with the calendar reference added.
 */
const addCalendarReferenceToEvents = (calendar, calendarWithoutEvents) => {
  return calendar.events.map(event => ({
    ...event,
    calendar: calendarWithoutEvents
  }))
}

/**
 * Lists all relevant events from the calendars managed by the homey app.
 * @param {Object} homey - The homey app object containing calendar data.
 * @returns {Array} - An array of all relevant events with calendar references.
 */
const listRelevantEvents = (homey) => {
  return homey.app.variableMgmt.calendars.reduce(
    (allEvents, calendar) => {
      const calendarWithoutEvents = createCalendarWithoutEvents(calendar)
      const eventsWithCalendar = addCalendarReferenceToEvents(calendar, calendarWithoutEvents)
      return allEvents.concat(eventsWithCalendar)
    },
    []
  )
}

module.exports = {

  /**
   * Gets a list of calendar events for display.
   * @param {Object} homey - The homey app object containing calendar data.
   * @param {Object} query - The query parameters for filtering events.
   * @returns {Array} - An array of serialized events for display.
   */
  async getCalendarList ({ homey, query }) {
    const timeFormat = homey.app.variableMgmt.dateTimeFormat.time
    let events = listRelevantEvents(homey)

    // Ensure max X row is shown
    events = sortEvents(events)
    events = events.slice(0, query.max)

    // Group events by day and serialize the data
    const serializedEvents = []
    const eventsByDay = events.reduce((map, event) => {
      const dayKey = getDayKey(event.start).format('YYYY-MM-DD')
      if (!map.has(dayKey)) {
        map.set(dayKey, {
          day: dayKey,
          events: []
        })
      }
      map.get(dayKey).events.push(event)
      return map
    }, new Map())

    eventsByDay.forEach((dayEvent, _) => {
      const day = dayEvent.day
      const events = dayEvent.events

      events.forEach((event, index) => {
        // Create dayCell for the first event of the day
        const dayInfo = index === 0
          ? `<span class='homey-text-small homey-text-align-center'>${day.format('ddd')}<br />${day.format('MMM D')}</span>`
          : null

        // Create period string
        let after = ` - ${event.end.format(timeFormat)}`
        let period = event.fullDayEvent ? homey.__('widget.allDay') : event.start.format(timeFormat)

        if (!event.start.isSame(event.end, 'day')) {
          const endFormat = event.fullDayEvent ? 'D MMMM' : `D MMMM ${timeFormat}`
          after = event.fullDayEvent ? `, ${homey.__('widget.until')} ${event.end.format(endFormat)}` : ` - ${event.end.format(endFormat)}`
        }

        period = period + after

        // Create summaryCell and calendarCell
        const summaryInfo = `<span class='homey-text-small'>${event.summary}</span><br /><span style='color: var(--homey-color-highlight);' class='homey-text-small-light'>${period}</span>`
        const calendarInfo = `<span style='color: ${event.calendar.color};' class='widget-calendar-cell homey-text-small'><div style='--homey-icon-color: ${event.calendar.color}' class='homey-custom-icon-calendar'></div>${event.calendar.name}</span>`

        // Push serialized event data
        serializedEvents.push({
          dayInfo,
          summaryInfo,
          calendarInfo
        })
      })
    })

    return serializedEvents
  },

  /**
   * Gets calendar events based on the provided parameters.
   * @param {Object} homey - The homey app object containing calendar data.
   * @param {Object} params - The parameters for filtering events.
   * @returns {Object} - An empty object as a placeholder.
   */
  async getCalendarEvents ({ homey, params }) {
    // access the post body and perform some action on it.
    return {}
  }
}
