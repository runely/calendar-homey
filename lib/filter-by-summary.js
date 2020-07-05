'use strict';

module.exports = (json, summary) => {
    // TODO: filter-by-summary.js doesn't handle spaces and another character
    let events = [];

    json.forEach(item => {
        let itemEvents = (item.events.VEVENT || item.events).filter(event => event.SUMMARY.toLowerCase().includes(summary.toLowerCase()));
        events.push({ ...item, events: itemEvents });
    });

    return events;
}