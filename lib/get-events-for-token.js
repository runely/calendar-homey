'use strict';

const Homey = require('homey');

module.exports = (app, events) => {
    let value = '';

    events.map(event => {
        if (event.datetype === 'date-time') {
            let eventValue = `${event.summary}; ${event.start.format(app.variableMgmt.dateTimeFormat.time.time)} ${Homey.__('flowTokens.events_today-tomorrow_start-stop_stamps_pre')} ${event.end.format(app.variableMgmt.dateTimeFormat.time.time)}`;
            if (value === '') {
                value = `${eventValue}`;
            }
            else {
                value += `; ${eventValue}`;
            }
        }
        else if (event.datetype === 'date') {
            let eventValue = `${event.summary}; ${Homey.__('flowTokens.events_today-tomorrow_startstamp_fullday')}`;
            if (value === '') {
                value = `${eventValue}`;
            }
            else {
                value += `; ${eventValue}`;
            }
        }
    });

    return value;
}