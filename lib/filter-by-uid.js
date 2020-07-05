'use strict';

module.exports = (json, uid) => {
    let events = [];

    json.forEach(item => {
        let itemEvents = (item.events.VEVENT || item.events).filter(event => event.UID.includes(uid));
        events.push({ ...item, events: itemEvents });
    });

    return events;
}