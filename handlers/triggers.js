'use strict';

const Homey = require('homey');
const moment = require('moment');
const getNextEvent = require('../lib/get-next-event');
const getTodaysEvents = require('../lib/get-todays-events');

const getNumber = num => {
    if (Number.isInteger(num)) {
        return num;
    }
    else {
        return num.toFixed(2);
    }
}

const getTriggeringEvents = (events, app) => {
    var filteredEvents = [];
    app.log("getTriggeringEvents");

    events.forEach(event => {
        let now = moment();
        let startDiff = now.diff(event.start, 'seconds');
        let stopDiff = now.diff(event.end, 'seconds');
        let resultStart = (startDiff >= 0 && startDiff <= 55 && stopDiff <= 0);
        let resultStop = (stopDiff >= 0 && stopDiff <= 55);
        //app.log("getTriggeringEvents: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Started now or in the last minute: " + resultStart);
        //app.log("getTriggeringEvents: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Stopped now or in the last minute: " + resultStop);
        
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
    let duration = {};

    // get duration
    let diff = event.end.diff(event.start, 'minutes');

    // add duration
    let hours = diff/60;
    let output = "";
    if (hours >= 1 && hours < 2) {
        output = getNumber(hours) + " " + Homey.__('token_duration_hour');
    }
    else if (hours >= 2) {
        output = getNumber(hours) + " " + Homey.__('token_duration_hours');
    }
    else if (hours < 1) {
        output = diff + " " + Homey.__('token_duration_minutes');
    }
    else {
        output = ''
    }

    // must replace '.' with ',' to get correct output on Google Home (amongst other things i guess)
    duration.duration = output.replace('.', ',')

    // add durationMinutes
    duration.durationMinutes = diff;

    return duration;
}

const startTrigger = (calendarName, event, app, state) => {
    // trigger flow card
    let duration = getTriggerTokenDuration(event);
    let tokens = {
        'event_name': getTriggerTokenValue(event.summary),
        'event_description': getTriggerTokenValue(event.description),
        'event_location': getTriggerTokenValue(event.location),
        'event_duration_readable': duration.duration,
        'event_duration': duration.durationMinutes,
        'event_calendar_name': calendarName
    };

    if (state === undefined) {
        app.log(`startTrigger: Found event for trigger '${event.TRIGGER_ID}'`);
        Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens);
    }
    else {
        Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens, { when: state });
    }
}

const updateFlowTokens = (nextEvent, app) => {
    let calendarsToday = getTodaysEvents(app.variableMgmt.calendars);
    let eventDuration;

    if (nextEvent.event) {
        eventDuration = getTriggerTokenDuration(nextEvent.event);
    }

    app.variableMgmt.flowTokens.map(token => {
        if (token.id === 'event_next_title') {
            token.setValue(nextEvent.event ? nextEvent.event.summary : '');
        }
        else if (token.id === 'event_next_startstamp') {
            if (nextEvent.event) {
                if (nextEvent.event.datetype === 'date-time') {
                    token.setValue(nextEvent.event.start.format(Homey.__('flowTokens.event_next_startstamp_date_time_format')));
                }
                else if (nextEvent.event.datetype === 'date') {
                    token.setValue(nextEvent.event.start.format(Homey.__('flowTokens.event_next_startstamp_date_format')));
                }
            }
            else {
                token.setValue('');
            }
        }
        else if (token.id === 'event_next_stopstamp') {
            if (nextEvent.event) {
                if (nextEvent.event.datetype === 'date-time') {
                    token.setValue(nextEvent.event.end.format(Homey.__('flowTokens.event_next_stopstamp_date_time_format')));
                }
                else if (nextEvent.event.datetype === 'date') {
                    token.setValue(nextEvent.event.end.format(Homey.__('flowTokens.event_next_stopstamp_date_format')));
                }
            }
            else {
                token.setValue('');
            }
        }
        else if (token.id === 'event_next_duration') {
            token.setValue(nextEvent.event ? eventDuration.duration : '');
        }
        else if (token.id === 'event_next_duration_minutes') {
            token.setValue(nextEvent.event ? eventDuration.durationMinutes : -1);
        }
        else if (token.id === 'event_next_starts_in_minutes') {
            token.setValue(nextEvent.event ? nextEvent.startsIn : -1);
        }
        else if (token.id === 'event_next_stops_in_minutes') {
            token.setValue(nextEvent.event ? nextEvent.stopsIn : -1);
        }
        else if (token.id === 'event_next_calendar_name') {
            token.setValue(nextEvent.event ? nextEvent.calendarName : '');
        }
        else if (token.id === 'events_today_title_stamps') {
            let value = '';
            calendarsToday.map(calendar => {
                calendar.events.map(event => {
                    if (event.datetype === 'date-time') {
                        let eventValue = `${event.summary}, ${Homey.__('flowTokens.events_today_title_stamps_starts')} ${event.start.format(Homey.__('flowTokens.events_today_startstamp_time_format'))}, ${Homey.__('flowTokens.events_today_title_stamps_stops')} ${event.end.format(Homey.__('flowTokens.events_today_stopstamp_time_format'))}`;
                        if (value === '') {
                            value = `${Homey.__('flowTokens.events_today_title_stamps_pre')}\n${eventValue}`;
                        }
                        else {
                            value += `.\n${eventValue}`;
                        }
                    }
                    else if (event.datetype === 'date') {
                        let eventValue = `${event.summary}, ${Homey.__('flowTokens.events_today_startstamp_fullday')}`;
                        if (value === '') {
                            value = `${Homey.__('flowTokens.events_today_title_stamps_pre')}\n${eventValue}`;
                        }
                        else {
                            value += `.\n${eventValue}`;
                        }
                    }
                });
            });
            token.setValue(value);
        }
        else if (token.id === 'events_today_count') {
            let todaysEventCount = 0;
            calendarsToday.map(calendar => {
                todaysEventCount += calendar.events.length;
            });
            token.setValue(todaysEventCount);
        }
    });
}

module.exports = async (app) => {
    // register trigger flow cards
    const registerTriggerFlowCards = async () => {
        new Homey.FlowCardTrigger('event_starts').register();

        new Homey.FlowCardTrigger('event_stops').register();

        new Homey.FlowCardTrigger('event_starts_in')
            .registerRunListener((args, state) => {
                let result = (args.when == state.when);
                if (result) app.log(`Triggered 'event_starts_in' with state: ${state.when}`);
                return Promise.resolve(result);
            })
            .register();
    }

    // register flow tokens
    const registerFlowTokens = async () => {
        app.variableMgmt.tokens.map(definition => {
            new Homey.FlowToken(definition.id, { type: definition.type, title: Homey.__(`flowTokens.${definition.id}`)})
                .register()
                .then(token => {
                    //app.log(`registerFlowToken: ${definition.id} registered`);
                    app.variableMgmt.flowTokens.push(token);
                });
        });
    }

    await registerTriggerFlowCards();
    await registerFlowTokens();
}

module.exports.triggerEvents = async (app, nextEvent) => {
    return new Promise((resolve, reject) => {
        if (app.variableMgmt.calendars) {
            app.variableMgmt.calendars.forEach(calendar => {
                app.log("triggerEvents:", `Checking if any of the ${calendar.events.length} events in calendar '${calendar.name}' ((starts now or has started in the last minute) || (stops now or has stopped in the last minute))`);
                let triggeringEvents = getTriggeringEvents(calendar.events, app) || [];
                triggeringEvents.forEach(event => startTrigger(calendar.name, event, app));
            });
        }
        else {
            app.log("triggerEvents:", "Calendars has not been set in Settings yet");
        }

        // fire event_starts_in trigger as well with nextEvent.startsIn as state
        if (nextEvent.event) {
            let startsInEvent = { ...nextEvent.event, TRIGGER_ID: 'event_starts_in' };
            startTrigger(nextEvent.calendarName, startsInEvent, app, nextEvent.startsIn);
        }

        resolve();
    });
}

module.exports.updateTokens = async (app) => {
    return new Promise((resolve, reject) => {
        let nextEvent = getNextEvent(app.variableMgmt.calendars);
        app.log("updateTokens: Updating flow tokens");

        if (nextEvent) {
            updateFlowTokens(nextEvent, app);
        }
        else {
            updateFlowTokens(null, app);
        }
        
        resolve(nextEvent);
    });
}