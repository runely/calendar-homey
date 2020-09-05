'use strict';

const Homey = require('homey');
const moment = require('moment');
const getNextEvent = require('../lib/get-next-event');
const getTodaysEvents = require('../lib/get-todays-events');
const getTomorrowsEvents = require('../lib/get-tomorrows-events');
const convertToMinutes = require('../lib/convert-to-minutes');
const getEventsForToken = require('../lib/get-events-for-token');

const getNumber = num => {
    if (Number.isInteger(num)) {
        return num;
    }
    else {
        return num.toFixed(2);
    }
}

const triggerAllEvents = (calendars, app) => {
    let now = moment();

    calendars.map(calendar => {
        app.log(`triggerAllEvents: Triggering events from calendar '${calendar.name}'`);
        calendar.events.map(event => {
            let startDiff = now.diff(event.start, 'seconds');
            let endDiff = now.diff(event.end, 'seconds');

            let resultStart = (startDiff >= 0 && startDiff <= 55 && endDiff <= 0);
            let resultEnd = (endDiff >= 0 && endDiff <= 55);
            let resultStartInCheck = (!resultStart && !resultEnd && startDiff < 0);

            if (resultStart) {
                startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_starts' }, app);
                startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_starts_calendar' }, app, { calendarName: calendar.name });
            }
            if (resultEnd) {
                startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_stops' }, app);
            }
            if (resultStartInCheck) {
                let startsIn = Math.round(event.start.diff(now, 'minutes', true));
                startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_starts_in' }, app, { when: startsIn });
            }
        });
    });
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
    let eventDuration = {};

    // get duration
    let diff = event.end.diff(event.start, 'minutes');

    // add duration
    let hours = diff/60;
    let output = '';
    if (hours >= 1 && hours < 2) {
        output = `${getNumber(hours)} ${Homey.__('tokens.duration_hour')}`;
    }
    else if (hours >= 2) {
        output = `${getNumber(hours)} ${Homey.__('tokens.duration_hours')}`;
    }
    else if (hours < 1) {
        output = `${diff} ${Homey.__('tokens.duration_minutes')}`;
    }
    else {
        output = '';
    }

    // must replace '.' with ',' to get correct output on Google Home (amongst other things i guess)
    eventDuration.duration = output.replace('.', ',');

    // add durationMinutes
    eventDuration.durationMinutes = diff;

    return eventDuration;
}

const startTrigger = (calendarName, event, app, state) => {
    // trigger flow card
    let eventDuration = getTriggerTokenDuration(event);
    let tokens = {
        'event_name': getTriggerTokenValue(event.summary),
        'event_description': getTriggerTokenValue(event.description),
        'event_location': getTriggerTokenValue(event.location),
        'event_duration_readable': eventDuration.duration,
        'event_duration': eventDuration.durationMinutes,
        'event_calendar_name': calendarName
    };

    if (state === undefined) {
        app.log(`Triggered '${event.TRIGGER_ID}'`);
        Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens);
    }
    else {
        Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens, state);
    }
}

const getNextEventCalendar = (app, calendarName, nextEvent) => {
    if (!nextEvent) {
        //app.log(`getNextEventCalendar: nextEvent not set. Getting next event for calendar '${calendarName}'`);
        return getNextEvent(app.variableMgmt.calendars, calendarName);
    }
    else if (nextEvent && nextEvent.calendarName !== calendarName) {
        //app.log(`getNextEventCalendar: nextEvent already set but for calendar '${nextEvent.calendarName}'. Getting next event for calendar '${calendarName}'`);
        return getNextEvent(app.variableMgmt.calendars, calendarName);
    }
    else if (nextEvent && nextEvent.calendarName === calendarName) {
        //app.log(`getNextEventCalendar: nextEvent already set for calendar '${nextEvent.calendarName}' (${calendarName}). Using this one`);
        return nextEvent;
    }
    else {
        app.log('getNextEventCalendar: What what what????')
        return null;
    }
}

const updateFlowTokens = (app) => {
    let nextEvent = getNextEvent(app.variableMgmt.calendars);
    let eventsToday = getTodaysEvents(app.variableMgmt.calendars);
    let eventsTomorrow = getTomorrowsEvents(app.variableMgmt.calendars);
    let eventDuration;

    if (nextEvent.event) {
        eventDuration = getTriggerTokenDuration(nextEvent.event);
    }

    // loop through flow tokens
    app.variableMgmt.flowTokens.map(token => {
        if (token.id === 'event_next_title') {
            token.setValue(nextEvent.event ? nextEvent.event.summary : '');
        }
        else if (token.id === 'event_next_startdate') {
            token.setValue(nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.date.long));
        }
        else if (token.id === 'event_next_startstamp') {
            if (nextEvent.event) {
                if (nextEvent.event.datetype === 'date-time') {
                    token.setValue(nextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time.time));
                }
                else if (nextEvent.event.datetype === 'date') {
                    token.setValue(`00${app.variableMgmt.dateTimeFormat.time.splitter}00`);
                }
            }
            else {
                token.setValue('');
            }
        }
        else if (token.id === 'event_next_stopdate') {
            token.setValue(nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.date.long));
        }
        else if (token.id === 'event_next_stopstamp') {
            if (nextEvent.event) {
                if (nextEvent.event.datetype === 'date-time') {
                    token.setValue(nextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time.time));
                }
                else if (nextEvent.event.datetype === 'date') {
                    token.setValue(`00${app.variableMgmt.dateTimeFormat.time.splitter}00`);
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
            token.setValue(nextEvent.event ? nextEvent.endsIn : -1);
        }
        else if (token.id === 'event_next_calendar_name') {
            token.setValue(nextEvent.event ? nextEvent.calendarName : '');
        }
        else if (token.id === 'events_today_title_stamps') {
            let value = getEventsForToken(app, eventsToday) || '';
            token.setValue(value);
        }
        else if (token.id === 'events_today_count') {
            token.setValue(eventsToday.length);
        }
        else if (token.id === 'events_tomorrow_title_stamps') {
            let value = getEventsForToken(app, eventsTomorrow) || '';
            token.setValue(value);
        }
        else if (token.id === 'events_tomorrow_count') {
            token.setValue(eventsTomorrow.length);
        }
    });

    // loop through calendar tokens
    let calendarNextEvent;
    app.variableMgmt.calendarTokens.map(token => {
        let calendarId = token.id.replace(app.variableMgmt.calendarTokensPreId, '');
        let calendarName = calendarId.replace(app.variableMgmt.calendarTokensPostTodayId, '').replace(app.variableMgmt.calendarTokensPostTomorrowId, '').replace(app.variableMgmt.calendarTokensPostNextTitleId, '').replace(app.variableMgmt.calendarTokensPostNextStartDateId, '').replace(app.variableMgmt.calendarTokensPostNextStartTimeId, '').replace(app.variableMgmt.calendarTokensPostNextEndDateId, '').replace(app.variableMgmt.calendarTokensPostNextEndTimeId, '');
        let calendarType = calendarId.replace(`${calendarName}_`, '');
        //app.log(`calendarTokens: Setting token '${calendarType}' for calendar '${calendarName}'`);
        let value = '';

        if (calendarType === 'today') {
            let todaysEventsCalendar = getTodaysEvents(app.variableMgmt.calendars, calendarName);
            //app.log(`updateFlowTokens: Found '${todaysEventsCalendar.length}' events for today from calendar '${calendarName}'`);
            value = getEventsForToken(app, todaysEventsCalendar) || '';
        }
        else if (calendarType === 'tomorrow') {
            let tomorrowsEventsCalendar = getTomorrowsEvents(app.variableMgmt.calendars, calendarName);
            //app.log(`updateFlowTokens: Found '${tomorrowsEventsCalendar.length}' events for tomorrow from calendar '${calendarName}'`);
            value = getEventsForToken(app, tomorrowsEventsCalendar) || '';
        }
        else if (calendarType === 'next_title') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            value = calendarNextEvent.event ? calendarNextEvent.event.summary : '';
        }
        else if (calendarType === 'next_startdate') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            value = calendarNextEvent.event ? calendarNextEvent.event.start.format(app.variableMgmt.dateTimeFormat.date.long) : '';
        }
        else if (calendarType === 'next_starttime') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            if (calendarNextEvent.event) {
                if (calendarNextEvent.event.datetype === 'date-time') {
                    value = calendarNextEvent.event.start.format(app.variableMgmt.dateTimeFormat.time.time);
                }
                else if (calendarNextEvent.event.datetype === 'date') {
                    value = `00${app.variableMgmt.dateTimeFormat.time.splitter}00`;
                }
            }
            else {
                value = '';
            }
        }
        else if (calendarType === 'next_enddate') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            value = calendarNextEvent.event ? calendarNextEvent.event.end.format(app.variableMgmt.dateTimeFormat.date.long) : '';
        }
        else if (calendarType === 'next_endtime') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            if (calendarNextEvent.event) {
                if (calendarNextEvent.event.datetype === 'date-time') {
                    value = calendarNextEvent.event.end.format(app.variableMgmt.dateTimeFormat.time.time);
                }
                else if (calendarNextEvent.event.datetype === 'date') {
                    value = `00${app.variableMgmt.dateTimeFormat.time.splitter}00`;
                }
            }
            else {
                value = '';
            }
        }
        token.setValue(value);
    });
}

module.exports = async (app) => {
    // register trigger flow cards
    const registerTriggerFlowCards = async () => {
        new Homey.FlowCardTrigger('event_starts').register();

        new Homey.FlowCardTrigger('event_stops').register();

        new Homey.FlowCardTrigger('event_starts_in')
            .registerRunListener((args, state) => {
                let minutes = convertToMinutes(args.when, args.type);
                let result = (minutes == state.when);
                if (result) app.log("Triggered 'event_starts_in' with state:", state);
                return Promise.resolve(result);
            })
            .register();
            
        new Homey.FlowCardTrigger('event_starts_calendar')
            .register()
            .registerRunListener((args, state) => {
                let result = (args.calendar.name === state.calendarName);
                if (result) app.log("Triggered 'event_starts_calendar' with state:", state);
                return Promise.resolve(result);
            })
            .getArgument('calendar')
            .registerAutocompleteListener((query, args) => {
                if (!app.variableMgmt.calendars) {
                    app.log('event_starts_calendar.onAutocompleteListener: Calendars not set yet. Nothing to show...');
                    return Promise.reject(false);
                }
                else {
                    if (query && query !== '') {
                        return Promise.resolve(
                            app.variableMgmt.calendars.filter(calendar => (calendar.name.toLowerCase().indexOf(query.toLowerCase()) > -1)).map(calendar => {
                                return { 'id': calendar.name, 'name': calendar.name };
                            })
                        );
                    }
                    else {
                        return Promise.resolve(
                            app.variableMgmt.calendars.map(calendar => {
                                return { 'id': calendar.name, 'name': calendar.name };
                            })
                        );
                    }
                }
            });
    }

    // register flow tokens
    const registerFlowTokens = async () => {
        app.variableMgmt.tokens.map(definition => {
            new Homey.FlowToken(definition.id, { type: definition.type, title: Homey.__(`flowTokens.${definition.id}`)})
                .register()
                .then(token => app.variableMgmt.flowTokens.push(token));
        });
    }

    await registerTriggerFlowCards();
    await registerFlowTokens();
}

module.exports.triggerEvents = async (app) => {
    return new Promise((resolve, reject) => {
        if (app.variableMgmt.calendars) {
            triggerAllEvents(app.variableMgmt.calendars, app);
        }
        else {
            app.log('triggerEvents: Calendars has not been set in Settings yet');
        }

        resolve(true);
    });
}

module.exports.updateTokens = async (app) => {
    return new Promise((resolve, reject) => {
        app.log('updateTokens: Updating flow tokens');

        let flowTokensStart = moment().format('x');
        updateFlowTokens(app);
        let flowTokensStop = moment().format('x');
        app.log(`updateTokens: Update took '${(flowTokensStop - flowTokensStart) / 1000}' seconds`);
        
        resolve(true);
    });
}