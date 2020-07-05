'use strict';

const ical = require('node-ical');
const icalFix = require('./icalFix');

module.exports = (url) => {
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