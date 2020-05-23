'use strict';

const ical = require('node-ical')
const icsToJson = require('ical2json')
const icsFix = require('./icsFix')

module.exports.readICSToJSON = (url) => {
    return new Promise((resolve, reject) => {
        ical.async.fromURL(url, (err, data) => {
            if (data.statusCode !== 200)
                reject(data)
            else {
                const fixedIcs = icsFix(data.body)
                const json = icsToJson.convert(fixedIcs)
                resolve(json)
            }
        });
    });
}

module.exports.filterICS = (json, date) => {
    return json.filter((event) => ((typeof event.DTSTART_TIMESTAMP !== 'undefined' && event.DTSTART_TIMESTAMP) ? event.DTSTART_TIMESTAMP.includes(date) : ((typeof event.DTSTART_DATE !== 'undefined' && event.DTSTART_DATE) ? event.DTSTART_DATE.includes(date) : false)))
}