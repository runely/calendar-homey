'use strict';

const ical = require('node-ical');
const icalToJson = require('ical2json');
const icalFix = require('./icalFix');
const moment = require('moment');

const isEventNotPast = event => {
    let now = moment();
    let stop;

    if (event.DTEND_TIMESTAMP) {
        stop = moment(event.DTEND_TIMESTAMP);
    }
    else if (event.DTEND_DATE) {
        stop = moment(event.DTEND_DATE);
    }

    if (event.RRULE) {
        if (event.RRULE.toLowerCase().includes('until')) {
            let until;
            event.RRULE.split(';').forEach(property => {
                if (property.toLowerCase().includes('until')) {
                    until = moment(property.split('=')[1]);
                }
            });

            if (until) {
                return now.diff(until, 'seconds') < 0 ? true : false;
            }
        }

        return true;
    }

    return now.diff(stop, 'seconds') < 0 ? true : false;
}

module.exports.getIcal = (url) => {
    return new Promise((resolve, reject) => {
        ical.async.fromURL(url, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                if (data.statusCode !== 200) {
                    reject(data);
                }
                else {
                    resolve(icalFix(data.body));
                }
            }
        });
    });
}

module.exports.parseIcalToJson = (data) => {
    return icalToJson.convert(data);
}

module.exports.filterActiveEvents = (json) => {
    if (json.VEVENT) {
        return json.VEVENT.filter(event => isEventNotPast(event));
    }
    else {
        return json.filter(event => isEventNotPast(event));
    }
}

module.exports.filterIcalBySummary = (json, summary) => {
    // TODO: tools.filterIcalBySummary doesn't handle spaces and another character
    let events = [];

    json.forEach(item => {
        if (item.events.VEVENT) {
            let itemEvents = item.events.VEVENT.filter(event => event.SUMMARY.toLowerCase().includes(summary.toLowerCase()));
            events.push({ ...item, events: itemEvents });
        }
        else {
            let itemEvents = item.events.filter(event => event.SUMMARY.toLowerCase().includes(summary.toLowerCase()));
            events.push({ ...item, events: itemEvents });
        }
    });

    return events;
}

module.exports.filterIcalByUID = (json, uid) => {
    let events = [];

    json.forEach(item => {
        if (item.events.VEVENT) {
            let itemEvents = item.events.VEVENT.filter(event => event.UID.includes(uid));
            events.push({ ...item, events: itemEvents });
        }
        else {
            let itemEvents = item.events.filter(event => event.UID.includes(uid));
            events.push({ ...item, events: itemEvents });
        }
    });

    return events;
}

module.exports.getNextEvent = (json) => {
    let minutesUntilStart = -1000000000000000000000000000;
    let nextEvent = {};
    let now  = moment();

    json.forEach(item => {
        let events = item.events.VEVENT || item.events;

        events.map(event => {
            let timestamps = this.getTimestamps(event, true, true);
            let start = moment(timestamps.start);
            let stop = moment(timestamps.stop);
            let startDiff = now.diff(start, 'minutes');
            let stopDiff = now.diff(stop, 'minutes');

            let result = startDiff <= 0 && startDiff > minutesUntilStart;
            if (result) {
                minutesUntilStart = startDiff;
                nextEvent.startsIn = this.flipNumber(startDiff);
                nextEvent.stopsIn = this.flipNumber(stopDiff);
                nextEvent.event = event;
                nextEvent.calendarName = item.name
            }
        });
    });

    return nextEvent;
}

module.exports.getTodaysEvents = (json) => {
    let events = [];

    json.map(item => {
        let calendarEvents = [];

        (item.events.VEVENT || item.events).map(event => {
            let timestamps = this.getTimestamps(event, true, true);
            let now = moment();
            let start = moment(timestamps.start);
            let startDiff = now.diff(start);
            let isSameDay = start.isSame(now, 'day');

            if (startDiff < 0 && isSameDay) {
                calendarEvents.push(event);
            }
        });

        events.push({ name: item.name, events: calendarEvents });
    });

    return events;
}

module.exports.getTimestamps = (event, start, stop) => {
    let timestamps = {};

    if (start) {
        if (event.DTSTART_TIMESTAMP) {
            timestamps['start'] = event.DTSTART_TIMESTAMP;
        }
        else if (event.DTSTART_DATE) {
            timestamps['start'] = event.DTSTART_DATE;
        }
    }
    if (stop) {
        if (event.DTEND_TIMESTAMP) {
            timestamps['stop'] = event.DTEND_TIMESTAMP;
        }
        else if (event.DTEND_DATE) {
            timestamps['stop'] = event.DTEND_DATE;
        }
    }

    return timestamps;
}

module.exports.flipNumber = number => {
    if (number > 0)
        return -number;
    else if (number < 0)
        return Math.abs(number);
    else
        return 0;
}