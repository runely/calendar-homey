'use strict';

const ical = require('node-ical');
const fixContent = require('./fix-ical-content');

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
                    resolve(fixContent(data.body));
                }
            }
        });
    });
}