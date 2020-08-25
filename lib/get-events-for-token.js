'use strict';

const Homey = require('homey');

module.exports = event => {
    let value = '';

    if (event.datetype === 'date-time') {
        let eventValue = `${event.summary}, ${Homey.__('flowTokens.events_today-tomorrow_title_stamps_starts')} ${event.start.format(Homey.__('flowTokens.events_today-tomorrow_startstamp_time_format'))}, ${Homey.__('flowTokens.events_today-tomorrow_title_stamps_stops')} ${event.end.format(Homey.__('flowTokens.events_today-tomorrow_stopstamp_time_format'))}`;
        if (value === '') {
            value = `${eventValue}`;
        }
        else {
            value += `.\n${eventValue}`;
        }
    }
    else if (event.datetype === 'date') {
        let eventValue = `${event.summary}, ${Homey.__('flowTokens.events_today-tomorrow_startstamp_fullday')}`;
        if (value === '') {
            value = `${eventValue}`;
        }
        else {
            value += `.\n${eventValue}`;
        }
    }

    return value;
}