'use strict';

const sortEvent = require('./sort-event');

module.exports = (json) => {
    return json.map(item => {
        let sortedEvents = item.events.sort((a, b) => sortEvent(a, b));
        return { ...item, events: sortedEvents };
    });
}