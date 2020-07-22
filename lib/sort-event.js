'use strict';

const moment = require('moment');

module.exports = (a, b) => {
    return a.start - b.start;
}