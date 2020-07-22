'use strict';

module.exports = (oldCalendars, uid) => {
    let calendars = [];

    oldCalendars.forEach(calendar => {
        let newEvents = calendar.events.filter(event => event.uid === uid);
        calendars.push({ ...calendar, events: newEvents });
    });

    return calendars;
}