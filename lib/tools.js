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
            if (data.statusCode !== 200) {
                reject(data);
            }
            else {
                resolve(icalFix(data.body));
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