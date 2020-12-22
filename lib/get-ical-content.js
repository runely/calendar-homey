'use strict';

const ical = require('node-ical');

module.exports = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            ical.async.fromURL(url, options, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        }
        catch (err) {
            console.error(`get-ical-content: Failed to retrieve content for url '${url}': `, err);
            reject(err);
        }
    });
}