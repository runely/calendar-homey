'use strict';

const moment = require('moment');
const sortEvents = require('./sort-events');

module.exports = (calendars, specificCalendarName) => {
    let eventsTomorrow = [];
    let tomorrowStart = moment().add(1, 'day').startOf('day');

    calendars.map(calendar => {
        if (specificCalendarName && specificCalendarName !== calendar.name) {
            return;
        }

        calendar.events.map(event => {
            let startDiff = tomorrowStart.diff(event.start);
            let endDiff = tomorrowStart.diff(event.end);
            let startIsSameDay = event.start.isSame(tomorrowStart, 'day');

            let tomorrowNotStartedYet = (startDiff <= 0 && startIsSameDay);
            let startPastButNotEnded = (startDiff > 0 && !startIsSameDay && endDiff < 0);
            if (tomorrowNotStartedYet || startPastButNotEnded) {
                eventsTomorrow.push({ ...event, calendarname: calendar.name });
            }
        });
    });

    sortEvents(eventsTomorrow);
    return eventsTomorrow;
}