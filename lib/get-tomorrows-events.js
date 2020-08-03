'use strict';

const moment = require('moment');

module.exports = (calendars) => {
    let tomorrowStart = moment().add(1, 'day').startOf('day');
    let calendarsTomorrow = [];

    calendars.map(calendar => {
        let calendarEvents = [];

        calendar.events.map(event => {
            let startDiff = tomorrowStart.diff(event.start);
            let endDiff = tomorrowStart.diff(event.end);
            let startIsSameDay = event.start.isSame(tomorrowStart, 'day');

            let tomorrowNotStartedYet = (startDiff < 0 && startIsSameDay);
            let startPastButNotStopped = (startDiff > 0 && !startIsSameDay && endDiff < 0);
            if (tomorrowNotStartedYet || startPastButNotStopped) {
                calendarEvents.push(event);
            }
        });

        calendarsTomorrow.push({ name: calendar.name, events: calendarEvents })
    });

    return calendarsTomorrow;
}