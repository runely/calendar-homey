'use strict';

module.exports = (json) => {
    return (json.VEVENT || json).map(event => {
        if (event.EXDATE && typeof event.EXDATE === 'string') {
            event.EXDATE = event.EXDATE.split(',').map(exdate => exdate);
        }
        if (event.RDATE && typeof event.RDATE === 'string') {
            event.RDATE = event.RDATE.split(',').map(rdate => rdate);
        }
        return event;
    });
}