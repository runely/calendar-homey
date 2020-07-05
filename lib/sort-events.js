'use strict';

const moment = require('moment');

module.exports = (json) => {
    return json.map(item => {
        let sortedEvents = (item.events.VEVENT || item.events).sort((a, b) => {
            let aStamp = a.DTSTART_TIMESTAMP || a.DTSTART_DATE;
            let aMoment = moment(aStamp);
            let bStamp = b.DTSTART_TIMESTAMP || b.DTSTART_DATE;
            let bMoment = moment(bStamp);
            return aMoment - bMoment;
        });
        return { ...item, events: sortedEvents };
    });
}