'use strict';

module.exports = (event, includeStart, includeStop) => {
    let timestamps = {};

    if (includeStart) {
        timestamps['start'] = event.DTSTART_TIMESTAMP || event.DTSTART_DATE;
    }
    if (includeStop) {
        timestamps['stop'] = event.DTEND_TIMESTAMP || event.DTEND_DATE;
    }

    return timestamps;
}