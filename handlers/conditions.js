'use strict';

const Homey = require('homey');
const moment = require('moment');
const logger = require('../lib/logger');

const filterBySummary = require('../lib/filter-by-summary');
const filterByUID = require('../lib/filter-by-uid');
const filterByCalendar = require('../lib/filter-by-calendar');
const sortEvent = require('../lib/sort-event');
const convertToMinutes = require('../lib/convert-to-minutes');

module.exports = async (app) => {
    // register condition flow cards
    const registerConditionFlowCards = async () => {
        new Homey.FlowCardCondition('event_ongoing')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'ongoing'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args, 'event'));

        new Homey.FlowCardCondition('event_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'in'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args, 'event'));

        new Homey.FlowCardCondition('any_event_ongoing')
            .register()
			.registerRunListener((args, state) => checkEvent(args, state, 'any_ongoing'));
			
		new Homey.FlowCardCondition('any_event_ongoing_calendar')
            .register()
			.registerRunListener((args, state) => checkEvent(args, state, 'any_ongoing_calendar'))
			.getArgument('calendar')
			.registerAutocompleteListener((query, args) => onEventAutocomplete(query, args, 'calendar'))

        new Homey.FlowCardCondition('any_event_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_in'));

        new Homey.FlowCardCondition('event_stops_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'stops_in'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args, 'event'));
        
        new Homey.FlowCardCondition('any_event_stops_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_stops_in'));
    };

    const onEventAutocomplete = async (query, args, type) => {
		if (!app.variableMgmt.calendars || app.variableMgmt.calendars.length <= 0) {
			logger.info(app, 'onEventAutocomplete: Calendars not set yet. Nothing to show...');
			return Promise.reject(false);
		}

		if (type === 'event') {
			if (query && query !== '') {
				let filtered = filterBySummary(app.variableMgmt.calendars, query);
				return Promise.resolve(getEventList(filtered));
			}
			else {
				return Promise.resolve(getEventList(app.variableMgmt.calendars));
			}
		}
		else if (type === 'calendar') {
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
		}
    }

    const getEventList = (calendars) => {
		let eventList = [];

		if (calendars.length === 0) {
			logger.info(app, 'getEventList: No calendars. Returning empty array');
			return eventList;
		}

		let now = moment();

		calendars.forEach(calendar => {
			calendar.events.forEach(event => {
				let startStamp = '';
				let endStamp = '';
				let startMoment = event.start;
				let endMoment = event.end;

				try {
					if (event.datetype === 'date-time') {
						if (startMoment.isSame(now, 'year')) {
							startStamp = startMoment.format(`${app.variableMgmt.dateTimeFormat.date.short} ${app.variableMgmt.dateTimeFormat.time.time}`);
						}
						else {
							startStamp = startMoment.locale(Homey.__('locale.moment')).format(`${app.variableMgmt.dateTimeFormat.date.long} ${app.variableMgmt.dateTimeFormat.time.time}`);
						}

						if (endMoment.isSame(startMoment, 'year')) {
							if (endMoment.isSame(startMoment, 'date')) {
								endStamp = endMoment.format(app.variableMgmt.dateTimeFormat.time.time);

								startStamp = startStamp.replace(' ', ' - ');
							}
							else {
								endStamp = endMoment.format(`${app.variableMgmt.dateTimeFormat.date.short} ${app.variableMgmt.dateTimeFormat.time.time}`);
							}
						}
						else {
							endStamp = endMoment.locale(Homey.__('locale.moment')).format(`${app.variableMgmt.dateTimeFormat.date.long} ${app.variableMgmt.dateTimeFormat.time.time}`);
						}
					}
					else if (event.datetype === 'date') {
						if (startMoment.isSame(now, 'year')) {
							startStamp = startMoment.format(app.variableMgmt.dateTimeFormat.date.short);
						}
						else {
							startStamp = startMoment.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long);
						}

						if (endMoment.isSame(now, 'year')) {
							if (endMoment.isSame(startMoment, 'date')) {
								endStamp = '';
							}
							else {
								endStamp = endMoment.format(app.variableMgmt.dateTimeFormat.date.short);
							}
						}
						else {
							endStamp = endMoment.locale(Homey.__('locale.moment')).format(app.variableMgmt.dateTimeFormat.date.long);
						}
					}
				}
				catch (err) {
					logger.error(app, `getEventList: Failed to parse 'start' (${startMoment}) or 'end' (${endMoment}):`, err, event);
					startStamp = '';
					endStamp = '';

					// send exception to sentry
					app.sentry.captureException(err);
				}

				let name = event.summary;
				let description = calendar.name;

				if (startStamp !== '' && endStamp !== '') {
					description += ` -- (${startStamp} -> ${endStamp})`;
				}
				else if (endStamp === '') {
					description += ` -- (${startStamp})`;
				}

				eventList.push({ 'id': event.uid, name, description, start: event.start });
			});
		});

		eventList.sort((a, b) => sortEvent(a, b));

		return eventList;
	}

    const checkEvent = async (args, state, type) => {
		let filteredEvents;
		if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
			filteredEvents = filterByUID(app.variableMgmt.calendars || [], args.event.id);
		}
		else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
			filteredEvents = app.variableMgmt.calendars || [];
		}
		else if (type === 'any_ongoing_calendar') {
			filteredEvents = filterByCalendar(app.variableMgmt.calendars, args.calendar.name) || [];
		}

		if (!filteredEvents || !filteredEvents.length) {
			logger.info(app, 'checkEvent: filteredEvents empty... Resolving with false');
			return Promise.resolve(false);
		}

		return Promise.resolve(filteredEvents.some(calendar => {
			if (calendar.events.length <= 0) {
				return false;
			}

			logger.info(app, `checkEvent: Checking ${calendar.events.length} events from '${calendar.name}'`);
			let eventCondition = false;

			if (type === 'ongoing') {
				//logger.info(app, `checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
				eventCondition = isEventOngoing(calendar.events);
				//logger.info(app, `checkEvent: Ongoing? ${eventCondition}`);
			}
			else if (type === 'in') {
				//logger.info(app, `checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
				eventCondition = isEventIn(calendar.events, convertToMinutes(args.when, args.type));
				//logger.info(app, `checkEvent: Starting within ${args.when} minutes or less? ${eventCondition}`);
			}
			else if (type === 'stops_in') {
				//logger.info(app, `checkEvent: I got an event with UID '${args.event.id}' and SUMMARY '${args.event.name}'`);
				eventCondition = willEventNotIn(calendar.events, convertToMinutes(args.when, args.type));
				//logger.info(app, `checkEvent: Ending within less than ${args.when} minutes? ${eventCondition}`);
			}
			else if (type === 'any_ongoing' || type === 'any_ongoing_calendar') {
				eventCondition = isEventOngoing(calendar.events);
				//logger.info(app, `checkEvent: Is any of the ${calendar.events.length} events ongoing? ${eventCondition}`);
			}
			else if (type === 'any_in') {
				eventCondition = isEventIn(calendar.events, convertToMinutes(args.when, args.type));
				//logger.info(app, `checkEvent: Is any of the ${calendar.events.length} events starting within ${args.when} minutes or less? ${eventCondition}`);
			}
			else if (type === 'any_stops_in') {
				eventCondition = willEventNotIn(calendar.events, convertToMinutes(args.when, args.type));
				//logger.info(app, `checkEvent: Is any of the ${calendar.events.length} events ending within ${args.when} minutes or less? ${eventCondition}`);
			}

			return eventCondition;
		}));
    }

    const isEventOngoing = (events) => {
		let now = moment();
		return events.some(event => {
			let startDiff = now.diff(event.start, 'seconds');
			let endDiff = now.diff(event.end, 'seconds');
			let result = (startDiff >= 0 && endDiff <= 0);
			//logger.info(app, `isEventOngoing: '${event.summary}' (${event.uid}) -- ${startDiff} seconds since start -- ${endDiff} seconds since end -- Ongoing: ${result}`);
			return result;
		});
	}

	const isEventIn = (events, when) => {
		let now = moment();
		return events.some(event => {
			let startDiff = event.start.diff(now, 'minutes', true);
			let result = (startDiff <= when && startDiff >= 0);
			//logger.info(app, `isEventIn: ${startDiff} mintes until start -- Expecting ${when} minutes or less -- In: ${result}`);
			return result;
		});
	}

	const willEventNotIn = (events, when) => {
		let now = moment();
		return events.some(event => {
			let endDiff = event.end.diff(now, 'minutes', true);
			let result = (endDiff < when && endDiff >= 0);
			//logger.info(app, `willEventNotIn: ${endDiff} mintes until end -- Expecting ${when} minutes or less -- In: ${result}`);
			return result;
		});
	}

    await registerConditionFlowCards();
}
