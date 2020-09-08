'use strict';

module.exports = (oldCalendars, query) => {
    // TODO: filter-by-summary.js doesn't handle spaces and another character
    let calendars = [];

    oldCalendars.forEach(calendar => {
        calendars.push({ ...calendar, events: calendar.events.filter(event => event.summary.toLowerCase().includes(query.toLowerCase())) });
    });

    return calendars;
}