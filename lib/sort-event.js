'use strict';

const moment = require('moment');

module.exports = (a, b) => {
    let aMoment = moment(a.DTSTART_TIMESTAMP || a.DTSTART_DATE);
    let bMoment = moment(b.DTSTART_TIMESTAMP || b.DTSTART_DATE);
    return aMoment - bMoment;
}