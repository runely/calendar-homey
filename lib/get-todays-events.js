'use strict';

const moment = require('moment');

module.exports = (calendars) => {
    let now = moment();
    let calendarsToday = [];

    calendars.map(calendar => {
        let calendarEvents = [];

        calendar.events.map(event => {
            let startDiff = now.diff(event.start);
            let stopDiff = now.diff(event.end);
            let startIsSameDay = event.start.isSame(now, 'day');

            let todayNotStartedYet = (startDiff < 0 && startIsSameDay);
            let todayAlreadyStarted = (startDiff > 0 && startIsSameDay && stopDiff < 0);
            let startPastButNotStopped = (startDiff > 0 && !startIsSameDay && stopDiff < 0);
            if (todayNotStartedYet || todayAlreadyStarted || startPastButNotStopped) {
                calendarEvents.push(event);
            }
        });

        calendarsToday.push({ name: calendar.name, events: calendarEvents });
    });

    return calendarsToday;
}