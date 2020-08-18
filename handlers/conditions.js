'use strict';

const Homey = require('homey');
const moment = require('moment');
const filterBySummary = require('../lib/filter-by-summary');
const filterByUID = require('../lib/filter-by-uid');
const sortEvent = require('../lib/sort-event');
const convertToMinutes = require('../lib/convert-to-minutes');

module.exports = async (app) => {
    // register condition flow cards
    const registerConditionFlowCards = async () => {
        new Homey.FlowCardCondition('event_ongoing')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'ongoing'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args));

        new Homey.FlowCardCondition('event_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'in'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args));

        new Homey.FlowCardCondition('any_event_ongoing')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_ongoing'))

        new Homey.FlowCardCondition('any_event_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_in'));

        new Homey.FlowCardCondition('event_stops_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'stops_in'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args));
        
        new Homey.FlowCardCondition('any_event_stops_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_stops_in'));
    };

    const onEventAutocomplete = async (query, args) => {
        if (!app.variableMgmt.calendars) {
            app.log("onEventAutocomplete: Calendars not set yet. Nothing to show...");
            return Promise.reject(false);
        }
        else {
            if (query && query !== "") {
                var filtered = filterBySummary(app.variableMgmt.calendars, query)
                return Promise.resolve(getEventList(filtered));
            }
            else {
                return Promise.resolve(getEventList(app.variableMgmt.calendars));
            }
        }
    }

    const getEventList = (calendars) => {
		let eventList = [];

		if (calendars.length === 0) {
			app.log("getEventList: No calendars. Returning empty array");
			return eventList;
		}

		let now = moment();

		calendars.forEach(calendar => {
			calendar.events.forEach(event => {
				let startStamp = "";
				let stopStamp = "";
				let startMoment = event.start;
				let stopMoment = event.end;

				try {
					if (event.datetype === 'date-time') {
						if (startMoment.isSame(now, 'year')) {
							startStamp = startMoment.format(Homey.__('conditions_event_name_start_date_time_format'))
						}
						else {
							startStamp = startMoment.format(Homey.__('conditions_event_name_start_date_year_time_format'))
						}

						if (stopMoment.isSame(startMoment, 'year')) {
							if (stopMoment.isSame(startMoment, 'date')) {
								stopStamp = stopMoment.format(Homey.__('conditions_event_name_stop_time_format'))

								startStamp = startStamp.replace(' ', ' - ');
							}
							else {
								stopStamp = stopMoment.format(Homey.__('conditions_event_name_stop_date_time_format'))
							}
						}
						else {
							stopStamp = stopMoment.format(Homey.__('conditions_event_name_stop_date_year_time_format'))
						}
					}
					else if (event.datetype === "date") {
						if (startMoment.isSame(now, 'year')) {
							startStamp = startMoment.format(Homey.__('conditions_event_name_start_stop_date_format'))
						}
						else {
							startStamp = startMoment.format(Homey.__('conditions_event_name_start_stop_date_year_format'))
						}

						if (stopMoment.isSame(now, 'year')) {
							if (stopMoment.isSame(startMoment, 'date')) {
								stopStamp = "";
							}
							else {
								stopStamp = stopMoment.format(Homey.__('conditions_event_name_start_stop_date_format'))
							}
						}
						else {
							stopStamp = stopMoment.format(Homey.__('conditions_event_name_start_stop_date_year_format'))
						}
					}
				}
				catch (err) {
					app.log(`getEventList: Failed to parse 'start' (${startMoment}) or 'end' (${stopMoment}):`, err);
					startStamp = "";
					stopStamp = "";
				}

				let name = event.summary;
				let description = calendar.name;

				if (startStamp !== '' && stopStamp !== '') {
					description += ` -- (${startStamp} -> ${stopStamp})`;
				}
				else if (stopStamp === '') {
					description += ` -- (${startStamp})`;
				}

				eventList.push({ "id": event.uid, name, description, start: event.start });
			});
		});

		eventList.sort((a, b) => sortEvent(a, b));

		return eventList;
	}

    const checkEvent = async (args, state, type) => {
		let filteredEvents;
		if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
			filteredEvents = filterByUID(app.variableMgmt.calendars, args.event.id);
		}
		else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
			filteredEvents = app.variableMgmt.calendars;
		}
		if (!filteredEvents || !filteredEvents.length) {
			app.log("checkEvent: filteredEvents empty... Resolving with false");
			return Promise.resolve(false);
		}

		return Promise.resolve(filteredEvents.some(calendar => {
			if (calendar.events.length <= 0) {
				return false;
			}

			app.log(`checkEvent: Checking ${calendar.events.length} events from '${calendar.name}'`);
			let eventCondition = false;

			if (type === 'ongoing') {
				//app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
				eventCondition = isEventOngoing(calendar.events);
				//app.log("checkEvent: Ongoing? " + eventCondition);
			}
			else if (type === 'in') {
				//app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
				eventCondition = isEventIn(calendar.events, convertToMinutes(args.when, args.type));
				//app.log("checkEvent: Starting within " + args.when + " minutes or less? " + eventCondition);
			}
			else if (type === 'stops_in') {
				//app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
				eventCondition = willEventNotIn(calendar.events, convertToMinutes(args.when, args.type));
				//app.log("checkEvent: Stopping within less than " + args.when + " minutes? " + eventCondition);
			}
			else if (type === 'any_ongoing') {
				eventCondition = isEventOngoing(calendar.events);
				//app.log("checkEvent: Is any of the " + calendar.events.length + " events ongoing? " + eventCondition);
			}
			else if (type === 'any_in') {
				eventCondition = isEventIn(calendar.events, convertToMinutes(args.when, args.type));
				//app.log("checkEvent: Is any of the " + calendar.events.length + " events starting within " + args.when + " minutes or less? " + eventCondition);
			}
			else if (type === 'any_stops_in') {
				eventCondition = willEventNotIn(calendar.events, convertToMinutes(args.when, args.type));
				//app.log("checkEvent: Is any of the " + calendar.events.length + " events stopping within " + args.when + " minutes or less? " + eventCondition);
			}

			return eventCondition;
		}));
    }

    const isEventOngoing = (events) => {
		return events.some(event => {
			let now = moment();
			let startDiff = now.diff(event.start, 'seconds');
			let stopDiff = now.diff(event.end, 'seconds');
			let result = (startDiff >= 0 && stopDiff <= 0);
			//app.log(`isEventOngoing: '${event.SUMMARY}' (${event.UID}) -- ${startDiff} seconds since start -- ${stopDiff} seconds since stop -- Ongoing: ${result}`);
			return result;
		});
	}

	const isEventIn = (events, when) => {
		return events.some(event => {
			let now = moment();
			let startDiff = event.start.diff(now, 'minutes', true);
			let result = (startDiff <= when && startDiff >= 0)
			//app.log("isEventIn: " + startDiff + " mintes until start -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

	const willEventNotIn = (events, when) => {
		return events.some(event => {
			let now = moment();
			let stopDiff = event.end.diff(now, 'minutes', true);
			let result = (stopDiff < when && stopDiff >= 0);
			//app.log("willEventNotIn: " + stopDiff + " mintes until stop -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

    await registerConditionFlowCards();
}