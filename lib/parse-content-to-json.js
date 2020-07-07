'use strict';

const icalToJson = require('ical2json');
const fixJsonContent = require('./fix-json-content');

module.exports = (data) => {
    return fixJsonContent(icalToJson.convert(data));
}