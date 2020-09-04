'use strict';

const moment = require('moment');
const sortEvents = require('./sort-events');

module.exports = (calendars, specificCalendarName) => {
    let eventsToday = [];
    let now = moment();

    calendars.map(calendar => {
        if (specificCalendarName && specificCalendarName !== calendar.name) {
            return;
        }

        calendar.events.map(event => {
            let startDiff = now.diff(event.start);
            let endDiff = now.diff(event.end);
            let startIsSameDay = event.start.isSame(now, 'day');

            let todayNotStartedYet = (startDiff < 0 && startIsSameDay);
            let todayAlreadyStarted = (startDiff > 0 && startIsSameDay && endDiff < 0);
            let startPastButNotEnded = (startDiff > 0 && !startIsSameDay && endDiff < 0);
            if (todayNotStartedYet || todayAlreadyStarted || startPastButNotEnded) {
                eventsToday.push({ ...event, calendarname: calendar.name });
            }
        });
    });

    sortEvents(eventsToday);
    return eventsToday;
}