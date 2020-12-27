'use strict';

const Homey = require('homey');
const moment = require('moment');
const humanize = require('humanize-duration');

const logger = require('../lib/logger');
const filterByCalendar = require('../lib/filter-by-calendar');
const getNextEvent = require('../lib/get-next-event');
const getTodaysEvents = require('../lib/get-todays-events');
const getTomorrowsEvents = require('../lib/get-tomorrows-events');
const convertToMinutes = require('../lib/convert-to-minutes');
const getEventsForToken = require('../lib/get-events-for-token');

const triggerAllEvents = (calendars, app) => {
    let now = moment();

    calendars.map(calendar => {
        logger.info(app, `triggerAllEvents: Checking calendar '${calendar.name}' for events to trigger`);
        calendar.events.map(event => {
            let startDiff = now.diff(event.start, 'seconds');
            let endDiff = now.diff(event.end, 'seconds');

            let resultStart = (startDiff >= 0 && startDiff <= 55 && endDiff <= 0);
            let resultEnd = (endDiff >= 0 && endDiff <= 55);
            let resultStartInCheck = (!resultStart && !resultEnd && startDiff < 0);
            let resultStopInCheck = (!resultStart && !resultEnd && endDiff < 0);

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
            if (resultStopInCheck) {
                let stopsIn = Math.round(event.end.diff(now, 'minutes', true));
                startTrigger(calendar.name, { ...event, TRIGGER_ID: 'event_stops_in' }, app, { when: stopsIn });
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
    let durationMS = event.end.diff(event.start, 'milliseconds');

    return {
        duration: humanize(durationMS, { language: Homey.__('locale.humanize'), largest: 2, units: ['y', 'mo', 'w', 'd', 'h', 'm'], round: true }),
        durationMinutes: event.end.diff(event.start, 'minutes')
    };
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
        logger.info(app, `Triggered '${event.TRIGGER_ID}'`);
        Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens);
    }
    else {
        Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens, state);
    }
}

const getNextEventCalendar = (app, calendarName, nextEvent) => {
    if (!nextEvent) {
        //logger.info(app, `getNextEventCalendar: nextEvent not set. Getting next event for calendar '${calendarName}'`);
        return getNextEvent(app.variableMgmt.calendars, calendarName);
    }
    else if (nextEvent && nextEvent.calendarName !== calendarName) {
        //logger.info(app, `getNextEventCalendar: nextEvent already set but for calendar '${nextEvent.calendarName}'. Getting next event for calendar '${calendarName}'`);
        return getNextEvent(app.variableMgmt.calendars, calendarName);
    }
    else if (nextEvent && nextEvent.calendarName === calendarName) {
        //logger.info(app, `getNextEventCalendar: nextEvent already set for calendar '${nextEvent.calendarName}' (${calendarName}). Using this one`);
        return nextEvent;
    }
    else {
        logger.error(app, 'getNextEventCalendar: What what what????')
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
            token.setValue(nextEvent.event ? nextEvent.event.start.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '');
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
            token.setValue(nextEvent.event ? nextEvent.event.end.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '');
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
        //logger.info(app, `calendarTokens: Setting token '${calendarType}' for calendar '${calendarName}'`);
        let value = '';

        if (calendarType === 'today') {
            let todaysEventsCalendar = getTodaysEvents(app.variableMgmt.calendars, calendarName);
            //logger.info(app, `updateFlowTokens: Found '${todaysEventsCalendar.length}' events for today from calendar '${calendarName}'`);
            value = getEventsForToken(app, todaysEventsCalendar) || '';
        }
        else if (calendarType === 'tomorrow') {
            let tomorrowsEventsCalendar = getTomorrowsEvents(app.variableMgmt.calendars, calendarName);
            //logger.info(app, `updateFlowTokens: Found '${tomorrowsEventsCalendar.length}' events for tomorrow from calendar '${calendarName}'`);
            value = getEventsForToken(app, tomorrowsEventsCalendar) || '';
        }
        else if (calendarType === 'next_title') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            value = calendarNextEvent.event ? calendarNextEvent.event.summary : '';
        }
        else if (calendarType === 'next_startdate') {
            calendarNextEvent = getNextEventCalendar(app, calendarName, calendarNextEvent);
            value = calendarNextEvent.event ? calendarNextEvent.event.start.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '';
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
            value = calendarNextEvent.event ? calendarNextEvent.event.end.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long) : '';
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
                if (result) logger.info(app, "Triggered 'event_starts_in' with state:", state);
                return Promise.resolve(result);
            })
            .register();
        
        new Homey.FlowCardTrigger('event_stops_in')
            .registerRunListener((args, state) => {
                let minutes = convertToMinutes(args.when, args.type);
                let result = (minutes == state.when);
                if (result) logger.info(app, "Triggered 'event_stops_in' with state:", state);
                return Promise.resolve(result);
            })
            .register();
            
        new Homey.FlowCardTrigger('event_starts_calendar')
            .register()
            .registerRunListener((args, state) => {
                let result = (args.calendar.name === state.calendarName);
                if (result) logger.info(app, "Triggered 'event_starts_calendar' with state:", state);
                return Promise.resolve(result);
            })
            .getArgument('calendar')
            .registerAutocompleteListener((query, args) => {
                if (!app.variableMgmt.calendars) {
                    logger.info(app, 'event_starts_calendar.onAutocompleteListener: Calendars not set yet. Nothing to show...');
                    return Promise.reject(false);
                }
                    
                if (query && query !== '') {
                    let filteredCalendar = filterByCalendar(app.variableMgmt.calendars, query) || [];
                    return Promise.resolve(
                        filteredCalendar.map(calendar => {
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
            logger.info(app, 'triggerEvents: Calendars has not been set in Settings yet');
        }

        resolve(true);
    });
}

module.exports.updateTokens = async (app) => {
    return new Promise((resolve, reject) => {
        logger.info(app, 'updateTokens: Updating flow tokens');

        updateFlowTokens(app);
        
        resolve(true);
    });
}
