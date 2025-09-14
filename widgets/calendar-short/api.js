'use strict';
const sortEvents = require('./../../lib/sort-events')

const getDayKey = (datetime) => {
  return datetime.clone().startOf('day');
}

module.exports = {

  async getCalendarList({ homey, query }) {
    let events = homey.app.variableMgmt.calendars.reduce((events, calendar) => events.concat(calendar.events), []);
    events = sortEvents(events);

    // Group events by day using a Map
    const eventsByDay = events.reduce((map, event) => {
      const dayKey = getDayKey(event.start).format('YYYY-MM-DD');
      if (!map.has(dayKey)) {
        map[dayKey] = {
          day: getDayKey(event.start), // Store as Moment object
          events: []
        };
      }
      map[dayKey].events.push(event);
      return map;
    }, new Map());

      eventsByDay.forEach((dayEvent, dayKey) => {
        const day = dayEvent.day;
        const events = dayEvent.events;

          events.forEach((event, index) => {
            if (index == 0) {
              const lengt = events.length;
              let dayCell = `<span class=".homey-text-bold">${day.format('ddd')}<br />${day.format('MMM D')}</span>`;
            }

            // Create and append the second column (age)
            let period = `${event.start.format('HH:MM')} - ${event.end.format('HH:MM')}`;
            if (!event.start.isSame(event.end, 'day')) {
              period = `${event.start.format('HH:MM')} - ${event.end.format('D MMMM HH:MM')}`;
            } 

            let summaryCell = `<span class=".homey-text-medium">${event.summary}</span><br /><span class=".homey-text-small-light">${period}</span>`;

            let calendarCell = `<span class=".homey-text-regular">Foobar</span>`;

          });

      });

    return eventsByDay;
  },

  async getCalendarEvents({ homey, params }) {
    // access the post body and perform some action on it.
    return {}
  }
};
