'use strict';

const moment = require('moment');

module.exports = (calendars, specificCalendarName) => {
    let minutesUntilStart = 1000000000000000000000000000;
    let nextEvent = {};
    let now  = moment();

    calendars.forEach(calendar => {
        if (specificCalendarName && specificCalendarName !== calendar.name) {
            return;
        }

        calendar.events.map(event => {
            let startDiff = Math.round(event.start.diff(now, 'minutes', true));
            let endDiff = Math.round(event.end.diff(now, 'minutes', true));

            if (startDiff >= 0 && startDiff < minutesUntilStart) {
                minutesUntilStart = startDiff;
                nextEvent.startsIn = startDiff;
                nextEvent.endsIn = endDiff;
                nextEvent.event = event;
                nextEvent.calendarName = calendar.name
            }
        });
    });

    return nextEvent;
}