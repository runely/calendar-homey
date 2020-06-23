'use strict';

const Homey = require('homey');
const moment = require('moment');
const tools = require('../lib/tools');

const getTriggeringEvents = (events, app) => {
    var filteredEvents = [];

    events.forEach(event => {
        let timestamps = tools.getTimestamps(event, true, true);

        if (Object.keys(timestamps).length !== 2) {
            return false;
        }

        let now = moment();
        let start = moment(timestamps.start);
        let stop = moment(timestamps.stop);
        let startDiff = now.diff(start, 'seconds');
        let stopDiff = now.diff(stop, 'seconds');
        let resultStart = (startDiff >= 0 && startDiff <= 55 && stopDiff <= 0);
        let resultStop = (stopDiff >= 0 && stopDiff <= 55);
        app.log("getTriggeringEvents: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Started now or in the last minute: " + resultStart);
        app.log("getTriggeringEvents: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Stopped now or in the last minute: " + resultStop);
        
        if (resultStart) filteredEvents.push({ ...event, TRIGGER_ID: 'event_starts' });
        if (resultStop) filteredEvents.push({ ...event, TRIGGER_ID: 'event_stops' });
    });

    return filteredEvents;
}

const getTriggerTokenValue = (key) => {
    if (!key) {
        return '';
    }
    else if (key === "" || key === " " || key === "\n" || key === "\\n" || key === "\n " || key === "\\n " || key === "\r" || key === "\\r" || key === "\r " || key === "\\r " || key === "\r\n" || key === "\\r\\n" || key === "\r\n " || key === "\\r\\n " || key === "\n\r" || key === "\\n\\r" || key === "\n\r " || key === "\\n\\r ") {
        return '';
    }

    return key;
}

const getTriggerTokenDuration = (event) => {
    let timestamps = tools.getTimestamps(event, true, true);
    let duration = {};

    if (Object.keys(timestamps).length !== 2) {
        return { duration: '', durationMinutes: -1 };
    }

    // get duration
    let start = moment(timestamps.start);
    let stop = moment(timestamps.stop);
    let diff = stop.diff(start, 'minutes');
    //app.log("getTriggerTokenDuration: '" + event.SUMMARY + "' -- Start: " + timestamps.start + " -- Stop: " + timestamps.stop);

    // add duration
    let hours = diff/60;
    let output = "";
    if (hours >= 1 && hours < 2) {
        output = hours + " " + Homey.__('token_duration_hour');
    }
    else if (hours >= 2) {
        output = hours + " " + Homey.__('token_duration_hours');
    }
    else if (hours < 1) {
        output = diff + " " + Homey.__('token_duration_minutes');
    }
    else {
        output = ''
    }
    // must replace '.' with ',' to get correct output on Google Home (amongst other things i guess)
    duration['duration'] = output.replace('.', ',')

    // add durationMinutes
    duration['durationMinutes'] = diff;

    return duration;
}

const startTrigger = (event, app) => {
    // trigger flow card
    let duration = getTriggerTokenDuration(event);
    let tokens = {
        'event_name': getTriggerTokenValue(event.SUMMARY),
        'event_description': getTriggerTokenValue(event.DESCRIPTION),
        'event_location': getTriggerTokenValue(event.LOCATION),
        'event_duration_readable': duration.duration,
        'event_duration': duration.durationMinutes
    };

    app.log(`startTrigger: Found event for trigger '${event.TRIGGER_ID}':`, tokens);
    Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens);
}

module.exports = async (app) => {
    // register trigger flow cards
    const registerTriggerFlowCards = async () => {
        new Homey.FlowCardTrigger('event_starts').register();

        new Homey.FlowCardTrigger('event_stops').register();
    }

    await registerTriggerFlowCards();
}

module.exports.triggerEvents = async (app) => {
    if (app.variableMgmt.EVENTS) {
        app.variableMgmt.EVENTS.forEach(calendar => {
            app.log("triggerEvents:", `Checking if any of the ${calendar.events.length} events in calendar '${calendar.name}' ((starts now or has started in the last minute) || (stops now or has stopped in the last minute))`);
            let triggeringEvents = getTriggeringEvents(calendar.events, app) || [];
            triggeringEvents.forEach(event => startTrigger(event, app));
        });
    }
    else {
        app.log("triggerEvents:", "Calendars has not been set in Settings yet");
    }
}