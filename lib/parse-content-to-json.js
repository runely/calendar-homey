'use strict';

const icalToJson = require('ical2json');

module.exports = (data) => {
    return icalToJson.convert(data);
}