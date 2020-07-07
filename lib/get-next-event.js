'use strict';

const moment = require('moment');
const getTimestamps = require('./get-timestamps');
const flipNumber = require('./flip-number');

module.exports = (json) => {
    let minutesUntilStart = -1000000000000000000000000000;
    let nextEvent = {};
    let now  = moment();

    json.forEach(item => {
        item.events.map(event => {
            let timestamps = getTimestamps(event, true, true);
            let start = moment(timestamps.start);
            let stop = moment(timestamps.stop);
            let startDiff = (now.diff(start, 'minutes') - 1);
            let stopDiff = (now.diff(stop, 'minutes') - 1);

            let result = startDiff <= 0 && startDiff > minutesUntilStart;
            if (result) {
                minutesUntilStart = startDiff;
                nextEvent.startsIn = flipNumber(startDiff);
                nextEvent.stopsIn = flipNumber(stopDiff);
                nextEvent.event = event;
                nextEvent.calendarName = item.name
            }
        });
    });

    return nextEvent;
}