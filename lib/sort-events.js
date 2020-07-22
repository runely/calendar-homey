'use strict';

const sortEvent = require('./sort-event');

module.exports = (calendars) => {
    return calendars.map(calendar => {
        let sortedEvents = calendar.events.sort((a, b) => sortEvent(a, b));
        return { ...calendar, events: sortedEvents };
    });
}