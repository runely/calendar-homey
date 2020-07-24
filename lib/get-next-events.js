'use strict';

const moment = require('moment');

module.exports = (calendars) => {
    let minutesUntilStart = 1000000000000000000000000000;
    let nextEvents = [];
    let nextEvent = {};
    let now  = moment();

    calendars.forEach(calendar => {
        calendar.events.map(event => {
            let startDiff = Math.round(event.start.diff(now, 'minutes', true));
            let stopDiff = Math.round(event.end.diff(now, 'minutes', true));

            if (startDiff >= 0 && startDiff < minutesUntilStart) {
                minutesUntilStart = startDiff;
                nextEvent.startsIn = startDiff;
                nextEvent.stopsIn = stopDiff;
                nextEvent.event = event;
                nextEvent.calendarName = calendar.name
            }
        });
    });

    if (nextEvent.event) {
        nextEvents.push(nextEvent);

        calendars.forEach(calendar => {
            calendar.events.map(event => {
                if (event.start.format('x') === nextEvent.event.start.format('x') && event.uid !== nextEvent.event.uid) {
                    nextEvents.push({
                        startsIn: Math.round(event.start.diff(now, 'minutes', true)),
                        stopsIn: Math.round(event.end.diff(now, 'minutes', true)),
                        event,
                        calendarName: calendar.name
                    });
                }
            });
        });
    }
    
    return nextEvents;
}