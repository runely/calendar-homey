'use strict';

const moment = require('moment');
const flipNumber = require('./flip-number');

module.exports = (calendars) => {
    let minutesUntilStart = -1000000000000000000000000000;
    let nextEvent = {};
    let now  = moment();

    calendars.forEach(calendar => {
        calendar.events.map(event => {
            let startDiff = (now.diff(event.start, 'minutes') - 1);
            let stopDiff = (now.diff(event.end, 'minutes') - 1);

            let result = startDiff <= 0 && startDiff > minutesUntilStart;
            if (result) {
                minutesUntilStart = startDiff;
                nextEvent.startsIn = flipNumber(startDiff);
                nextEvent.stopsIn = flipNumber(stopDiff);
                nextEvent.event = event;
                nextEvent.calendarName = calendar.name
            }
        });
    });

    return nextEvent;
}