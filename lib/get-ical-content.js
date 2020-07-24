'use strict';

const ical = require('node-ical');

module.exports = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        ical.async.fromURL(url, options, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}