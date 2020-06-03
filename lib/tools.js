'use strict';

const ical = require('node-ical');
const icalToJson = require('ical2json');
const icalFix = require('./icalFix');

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

module.exports.filterIcalByStartDate = (json, date) => {
    return json.filter((event) => ((typeof event.DTSTART_TIMESTAMP !== 'undefined' && event.DTSTART_TIMESTAMP) ? event.DTSTART_TIMESTAMP.includes(date) : ((typeof event.DTSTART_DATE !== 'undefined' && event.DTSTART_DATE) ? event.DTSTART_DATE.includes(date) : false)));
}

module.exports.filterIcalBySummary = (json, summary) => {
    // TODO: tools.filterIcalBySummary doesn't handle spaces and another character
    return json.VEVENT.filter((event) => event.SUMMARY.toLowerCase().indexOf(summary.toLowerCase()) > -1 && event.STATUS.toLowerCase() === "confirmed");
}

module.exports.filterIcalByUID = (json, uid) => {
    return json.VEVENT.filter((event) => event.UID.indexOf(uid) > -1);
}