'use strict';

const moment = require('moment');
const getTimestamps = require('./get-timestamps');

module.exports = (json) => {
    let events = [];

    json.map(item => {
        let calendarEvents = [];

        item.events.map(event => {
            let timestamps = getTimestamps(event, true, true);
            let now = moment();
            let start = moment(timestamps.start);
            let stop = moment(timestamps.stop);
            let startDiff = now.diff(start);
            let stopDiff = now.diff(stop);
            let startIsSameDay = start.isSame(now, 'day');

            if ((startDiff < 0 && startIsSameDay) || (startDiff > 0 && startIsSameDay && stopDiff < 0)) {
                calendarEvents.push(event);
            }
        });

        events.push({ name: item.name, events: calendarEvents });
    });

    return events;
}