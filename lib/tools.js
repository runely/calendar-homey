'use strict';

const ical = require('node-ical');
const icalToJson = require('ical2json');
const icalFix = require('./icalFix');
const moment = require('moment');

const isEventNotPast = event => {
    let now = moment();
    let start;

    if (event.DTSTART_TIMESTAMP) {
        start = moment(event.DTSTART_TIMESTAMP);
    }
    else if (event.DTSTART_DATE) {
        start = moment(event.DTSTART_DATE);
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

    return now.diff(start, 'seconds') < 0 ? true : false;
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
    if (json.VEVENT) {
        return json.VEVENT.filter(event => event.SUMMARY.toLowerCase().indexOf(summary.toLowerCase()) > -1 && event.STATUS.toLowerCase() === "confirmed");
    }
    else {
        return json.filter(event => event.SUMMARY.toLowerCase().indexOf(summary.toLowerCase()) > -1 && event.STATUS.toLowerCase() === "confirmed");
    }
}

module.exports.filterIcalByUID = (json, uid) => {
    if (json.VEVENT) {
        return json.VEVENT.filter(event => event.UID.indexOf(uid) > -1);
    }
    else {
        return json.filter(event => event.UID.indexOf(uid) > -1);
    }
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