'use strict';

const Homey = require('homey');
const moment = require('moment');
const tools = require('../lib/tools');

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
        if (!app.variableMgmt.events) {
            app.log("onEventAutocomplete: Events not set yet. Nothing to show...");
            return Promise.reject(false);
        }
        else {
            if (query && query !== "") {
                var filtered = tools.filterIcalBySummary(app.variableMgmt.events, query)
                return Promise.resolve(getEventList(filtered));
            }
            else {
                return Promise.resolve(getEventList(app.variableMgmt.events));
            }
        }
    }

    const getEventList = (events) => {
		if (events.length === 0) {
			app.log("getEventList: No events. Returning empty array");
			return events;
		}

		let eventList = [];
		let now = moment();

		events.forEach(calendar => {
			calendar.events.forEach(event => {
				let startStamp = "";
				let fullDayEvent = false;

				if (event.DTSTART_TIMESTAMP) {
					try {
						let startMoment = moment(event.DTSTART_TIMESTAMP);
						if (startMoment.isSame(now, 'year')) {
							startStamp = startMoment.format(Homey.__('conditions_event_name_date_time_format'))
						}
						else {
							startStamp = startMoment.format(Homey.__('conditions_event_name_date_year_time_format'))
						}
					}
					catch (err) {
						app.log("getEventList: Failed to parse 'DTSTART_TIMESTAMP'", err);
						startStamp = "";
					}
				}
				else if (event.DTSTART_DATE) {
					try {
						fullDayEvent = true;
						let startMoment = moment(event.DTSTART_DATE);
						if (startMoment.isSame(now, 'year')) {
							startStamp = startMoment.format(Homey.__('conditions_event_name_date_format'))
						}
						else {
							startStamp = startMoment.format(Homey.__('conditions_event_name_date_year_format'))
						}
					}
					catch (err) {
						app.log("getEventList: Failed to parse 'DTSTART_DATE'", err);
						startStamp = "";
					}
				}

				let name = "";
				let description = calendar.name;

				if (startStamp === "") {
					name = event.SUMMARY;
				}
				else {
					name = `(${startStamp}) - ${event.SUMMARY}`;
				}

				if (event.RRULE) {
					description += " -- " + Homey.__('conditions_event_description_recurring');
				}
				if (fullDayEvent) {
					description += " -- " + Homey.__('conditions_event_description_fullday');
				}

				eventList.push({ "id": event.UID, name, description });
			});
		});

		return eventList;
	}

    const checkEvent = async (args, state, type) => {
		let filteredEvents;
		if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
			filteredEvents = tools.filterIcalByUID(app.variableMgmt.events, args.event.id);
		}
		else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
			filteredEvents = app.variableMgmt.events;
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
				eventCondition = isEventIn(calendar.events, args.when);
				//app.log("checkEvent: Starting within " + args.when + " minutes or less? " + eventCondition);
			}
			else if (type === 'stops_in') {
				//app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
				eventCondition = willEventNotIn(calendar.events, args.when);
				//app.log("checkEvent: Stopping within less than " + args.when + " minutes? " + eventCondition);
			}
			else if (type === 'any_ongoing') {
				eventCondition = isEventOngoing(calendar.events);
				//app.log("checkEvent: Is any of the " + calendar.events.length + " events ongoing? " + eventCondition);
			}
			else if (type === 'any_in') {
				eventCondition = isEventIn(calendar.events, args.when);
				//app.log("checkEvent: Is any of the " + calendar.events.length + " events starting within " + args.when + " minutes or less? " + eventCondition);
			}
			else if (type === 'any_stops_in') {
				eventCondition = willEventNotIn(calendar.events, args.when);
				//app.log("checkEvent: Is any of the " + calendar.events.length + " events stopping within " + args.when + " minutes or less? " + eventCondition);
			}

			return eventCondition;
		}));
    }

    const isEventOngoing = (events) => {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, true, true);

			if (Object.keys(timestamps).length !== 2) {
				return false;
			}

			let now = moment();
			let start = moment(timestamps.start);
			let stop = moment(timestamps.stop);
			let startDiff = now.diff(start, 'seconds');
			let stopDiff = now.diff(stop, 'seconds');
			let result = (startDiff >= 0 && stopDiff <= 0);
			//app.log("isEventOngoing: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Ongoing: " + result);
			return result;
		});
	}

	const isEventIn = (events, when) => {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, true, false);

			if (Object.keys(timestamps).length !== 1) {
				return false;
			}

			let now = moment();
			let start = moment(timestamps.start);
			let startDiff = tools.flipNumber(now.diff(start, 'minutes'));
			let result = (startDiff <= when && startDiff >= 0)
			//app.log("isEventIn: " + startDiff + " mintes until start -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

	const willEventNotIn = (events, when) => {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, false, true);

			if (Object.keys(timestamps).length !== 1) {
				return false;
			}

			let now = moment();
			let stop = moment(timestamps.stop);
			let stopDiff = tools.flipNumber(now.diff(stop, 'minutes'));
			let result = (stopDiff < when && stopDiff >= 0);
			//app.log("willEventNotIn: " + stopDiff + " mintes until stop -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

    await registerConditionFlowCards();
}