'use strict';

const moment = require('moment');

const isEventNotPast = event => {
    let now = moment();
    let stop = moment(event.DTEND_TIMESTAMP || event.DTEND_DATE);

    if (event.RRULE) {
        if (event.RRULE.toLowerCase().includes('until')) {
            let until;
            event.RRULE.split(';').forEach(property => {
                if (property.toLowerCase().includes('until')) {
                    until = moment(property.split('=')[1]);
                }
            });

            if (until) {
                return now.diff(until, 'seconds') < 0 ? true : false;
            }
        }

        return true;
    }

    return now.diff(stop, 'seconds') < 0 ? true : false;
}

module.exports = (json) => {
    return json.filter(event => isEventNotPast(event));
}