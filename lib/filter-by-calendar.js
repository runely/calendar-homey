'use strict';

module.exports = (calendars, name) => {
    return calendars.filter(calendar => (calendar.name.toLowerCase().indexOf(name.toLowerCase()) > -1));
}