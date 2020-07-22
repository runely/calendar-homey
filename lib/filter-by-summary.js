'use strict';

module.exports = (oldCalendars, query) => {
    // TODO: filter-by-summary.js doesn't handle spaces and another character
    let calendars = [];

    oldCalendars.forEach(calendar => {
        let newEvents = calendar.events.filter(event => event.summary.toLowerCase().includes(query.toLowerCase()));
        calendars.push({ ...calendar, events: newEvents });
    });

    return calendars;
}