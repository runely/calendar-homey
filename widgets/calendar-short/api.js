'use strict';
const sortEvents = require('./../../lib/sort-events')

const getDayKey = (datetime) => {
  return datetime.clone().startOf('day');
}

module.exports = {

  async getCalendarList({ homey, query }) {
    let events = homey.app.variableMgmt.calendars.reduce(
      (allEvents, calendar) => {
        // Create a copy of the calendar object without the 'events' property
        const { events: _, ...calendarWithoutEvents } = calendar;

        // For each event in the calendar, add the calendar reference
        const eventsWithCalendar = calendar.events.map(event => ({
          ...event,
          calendar: calendarWithoutEvents // Attach the calendar reference
        }));
        return allEvents.concat(eventsWithCalendar);
      },
      []
    );

    // Ensure max X row is shown
    events = sortEvents(events);
    events = events.slice(0, query.max);

    // Group events by day and serialize the data
    const serializedEvents = [];
    const eventsByDay = events.reduce((map, event) => {
      const dayKey = getDayKey(event.start).format('YYYY-MM-DD');
      if (!map.has(dayKey)) {
        map.set(dayKey, {
          day: getDayKey(event.start),
          events: [],
        });
      }
      map.get(dayKey).events.push(event);
      return map;
    }, new Map());

    eventsByDay.forEach((dayEvent, _) => {
      const day = dayEvent.day;
      const events = dayEvent.events;

      events.forEach((event, index) => {
        // Create dayCell for the first event of the day
        const dayInfo = index === 0
          ? `<span class="homey-text-small homey-text-align-center">${day.format('ddd')}<br />${day.format('MMM D')}</span>`
          : null;

        // Create period string
        let after =  ` - ${event.end.format('HH:mm')}`;
        let period = event.fullDayEvent ? homey.__("widget.allDay") : event.start.format('HH:mm');

        if (!event.start.isSame(event.end, 'day')) {
          after = event.fullDayEvent ? `, ${homey.__("widget.until")} ${event.end.format('D MMMM')}` : ` - ${event.end.format('D MMMM HH:mm')}`;
        }

        period = period + after;

        // Create summaryCell and calendarCell
        const summaryInfo = `<span class="homey-text-small">${event.summary}</span><br /><span style="color: var(--homey-color-highlight);" class="homey-text-small-light">${period}</span>`;
        const calendarInfo = `<span style="color: ${event.calendar.color};" class="widget-calendar-cell homey-text-small"><div style="--homey-icon-color: ${event.calendar.color}" class="homey-custom-icon-calendar"></div>${event.calendar.name}</span>`;

        // Push serialized event data
        serializedEvents.push({
          dayInfo,
          summaryInfo,
          calendarInfo,
        });
      });
    });

    return serializedEvents;
  },

  async getCalendarEvents({ homey, params }) {
    // access the post body and perform some action on it.
    return {}
  }
};
