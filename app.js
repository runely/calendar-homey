'use strict';

const Homey = require('homey');
const tools = require('./lib/tools');
const moment = require('moment');
const variableMgmt = require('./lib/variableMgmt');

class IcalCalendar extends Homey.App {
	
	onInit() {
		this.log(Homey.manifest.name.en + " v" + Homey.manifest.version + " is running...");

		// register trigger flow cards
		this.registerTriggerFlowCards();
		
		// register condition flow cards
		this.registerConditionFlowCards();

		// register action flow cards
		this.registerActionFlowCards();

		// get ical
		this.getEvents();

		// register callback when a settings has been set
		Homey.ManagerSettings.on('set', args => this.getEvents(args));

		// remove cron tasks on unload
		Homey.on('unload', () => {
			this.unregisterCronTasks()
		});

		// register cron tasks for updateCalendar and triggerEvents
		this.registerCronTasks();
	}

	registerTriggerFlowCards() {
		// registering trigger with Homey
		new Homey.FlowCardTrigger('event_starts').register();

		new Homey.FlowCardTrigger('event_stops').register();
	}
	
	registerConditionFlowCards() {
		new Homey.FlowCardCondition('event_ongoing')
			.register()
			.registerRunListener((args, state) => this.checkEvent(args, state, 'ongoing'))
			.getArgument('event')
			.registerAutocompleteListener((query, args) => this.onEventAutocomplete(query, args));

		new Homey.FlowCardCondition('event_in')
			.register()
			.registerRunListener((args, state) => this.checkEvent(args, state, 'in'))
			.getArgument('event')
			.registerAutocompleteListener((query, args) => this.onEventAutocomplete(query, args));

		new Homey.FlowCardCondition('any_event_ongoing')
			.register()
			.registerRunListener((args, state) => this.checkEvent(args, state, 'any_ongoing'))

		new Homey.FlowCardCondition('any_event_in')
			.register()
			.registerRunListener((args, state) => this.checkEvent(args, state, 'any_in'));

		new Homey.FlowCardCondition('event_stops_in')
			.register()
			.registerRunListener((args, state) => this.checkEvent(args, state, 'stops_in'))
			.getArgument('event')
			.registerAutocompleteListener((query, args) => this.onEventAutocomplete(query, args));
		
		new Homey.FlowCardCondition('any_event_stops_in')
			.register()
			.registerRunListener((args, state) => this.checkEvent(args, state, 'any_stops_in'));
	}

	registerActionFlowCards() {
		new Homey.FlowCardAction('sync-calendar')
			.register()
			.registerRunListener((args, state) => {
				return Promise.resolve(this.getEvents());
			})
	}

	onEventAutocomplete(query, args) {
		if (!variableMgmt.EVENTS) {
			this.log("onEventAutocomplete: Events not set yet. Nothing to show...");
			return Promise.reject(false);
		}
		else {
			if (query && query !== "") {
				var filtered = tools.filterIcalBySummary(variableMgmt.EVENTS, query)
				//this.log("onEventAutocomplete: Filtered events count: " + filtered.length);
				return Promise.resolve(this.getEventList(filtered));
			}
			else {
				//this.log("onEventAutocomplete: Events count: " + variableMgmt.EVENTS.length);
				return Promise.resolve(this.getEventList(variableMgmt.EVENTS));
			}
		}
	}

	async checkEvent(args, state, type) {
		let eventCondition = false;
		let filteredEvents;
		if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
			filteredEvents = tools.filterIcalByUID(variableMgmt.EVENTS, args.event.id);
		}
		else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
			filteredEvents = variableMgmt.EVENTS;
		}
		if (!filteredEvents || !filteredEvents.length) {
			this.log("checkEvent: filteredEvents empty... Resolving with false");
			return Promise.resolve(false);
		}

		this.log("checkEvent: " + filteredEvents.length + " event")

		if (type === 'ongoing') {
			this.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
			eventCondition = this.isEventOngoing(filteredEvents);
			this.log("checkEvent: Ongoing? " + eventCondition);
		}
		else if (type === 'in') {
			this.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
			eventCondition = this.isEventIn(filteredEvents, args.when);
			this.log("checkEvent: Starting in " + args.when + " minutes or less? " + eventCondition);
		}
		else if (type === 'stops_in') {
			this.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
			eventCondition = this.willEventNotIn(filteredEvents, args.when);
			this.log("checkEvent: Stopping in less than " + args.when + " minutes? " + eventCondition);
		}
		else if (type === 'any_ongoing') {
			eventCondition = this.isEventOngoing(filteredEvents);
			this.log("checkEvent: Is any of the " + filteredEvents.length + " events ongoing? " + eventCondition);
		}
		else if (type === 'any_in') {
			eventCondition = this.isEventIn(filteredEvents, args.when);
			this.log("checkEvent: Is any of the " + filteredEvents.length + " events starting in " + args.when + " minutes or less? " + eventCondition);
		}
		else if (type === 'any_stops_in') {
			eventCondition = this.willEventNotIn(filteredEvents, args.when);
			this.log("checkEvent: Is any of the " + filteredEvents.length + " events stopping in " + args.when + " minutes or less? " + eventCondition);
		}

		return Promise.resolve(eventCondition);
	}

	async getEvents(args) {
		if (args) {
			this.log("getEvents: Called from " + args);
			
			if (args === variableMgmt.SETTING.ICAL_URI_LOAD_FAILURE) {
				return false;
			}
			
			var settingName = args;
		}
		else {
			this.log("getEvents: Called from onInit/cron/action");
			var settingName = variableMgmt.SETTING.ICAL_URI;
		}

		// get URI from settings
		this.log("getEvents: Getting url from setting '" + settingName + "'");
		var uri = Homey.ManagerSettings.get(settingName);

		// get ical file
		if (uri) {
			this.log("getEvents: Using url '" + uri + "'");
			tools.getIcal(uri)
				.then(data => {
					// remove uri_failed settings value if it exists
					if (Homey.ManagerSettings.get(variableMgmt.SETTING.ICAL_URI_LOAD_FAILURE)) {
						Homey.ManagerSettings.unset(variableMgmt.SETTING.ICAL_URI_LOAD_FAILURE);
						this.log("getEvents: '" + variableMgmt.SETTING.ICAL_URI_LOAD_FAILURE + "' settings value removed");
					}

					let json = tools.parseIcalToJson(data);
					let activeEvents = tools.filterActiveEvents(json);
					variableMgmt.EVENTS = activeEvents;
					this.log("getEvents: Events updated. Events count: " + variableMgmt.EVENTS.length);
					
					return true;
				})
				.catch(err => {
					this.log("getEvents: Failed to retrieve ical content from '" + uri + "':", err.statusCode);

					// set a settings value to show a error message on settings page
					Homey.ManagerSettings.set(variableMgmt.SETTING.ICAL_URI_LOAD_FAILURE, err.statusCode);
					
					return false;
				});
		}
		else {
			this.log("getEvents: '" + settingName + "' has not been set in Settings yet");
			
			return false;
		}
	}

	async triggerEvents() {
		if (variableMgmt.EVENTS) {
			this.log("triggerEvents:", "Checking if any of the " + variableMgmt.EVENTS.length + " events ((starts now or has started in the last minute) || (stops now or has stopped in the last minute))");
			let eventsStartingOrStoppingNow = this.eventsStartingOrStoppingNow(variableMgmt.EVENTS) || [];
			eventsStartingOrStoppingNow.forEach(event => this.startTrigger(event));
		}
		else {
			this.log("triggerEvents:", "'" + variableMgmt.SETTING.ICAL_URI + "' has not been set in Settings yet");
		}
	}

	async unregisterCronTasks() {
		try {
			await Homey.ManagerCron.unregisterTask(variableMgmt.CRONTASK.ID.UPDATE_CALENDAR);
			this.log("unregisterCronTask: Unregistered task '" + variableMgmt.CRONTASK.ID.UPDATE_CALENDAR + "'");
		}
		catch (err) {
			this.log("unregisterCronTask: Error unregistering task '" + variableMgmt.CRONTASK.ID.UPDATE_CALENDAR + "':", err);
		}

		try {
			await Homey.ManagerCron.unregisterTask(variableMgmt.CRONTASK.ID.TRIGGER_EVENTS);
			this.log("unregisterCronTask: Unregistered task '" + variableMgmt.CRONTASK.ID.TRIGGER_EVENTS + "'");
		}
		catch (err) {
			this.log("unregisterCronTask: Error unregistering task '" + variableMgmt.CRONTASK.ID.TRIGGER_EVENTS + "':", err);
		}
	}
	
	async registerCronTasks() {
		await this.unregisterCronTasks();

		try {
			const cronTaskUpdateCalendar = await Homey.ManagerCron.registerTask(variableMgmt.CRONTASK.ID.UPDATE_CALENDAR, variableMgmt.CRONTASK.SCHEDULE.UPDATE_CALENDAR);
			cronTaskUpdateCalendar.on('run', () => this.getEvents());
			this.log("registerCronTask: Registered task '" + variableMgmt.CRONTASK.ID.UPDATE_CALENDAR + "' with cron format '" + variableMgmt.CRONTASK.SCHEDULE.UPDATE_CALENDAR + "'");
		}
		catch (err) {
			this.log("registerCronTask: Error registering task '" + variableMgmt.CRONTASK.ID.UPDATE_CALENDAR + "' with cron format '" + variableMgmt.CRONTASK.SCHEDULE.UPDATE_CALENDAR + "':", err);
		}

		try {
			const cronTaskTriggerEvents = await Homey.ManagerCron.registerTask(variableMgmt.CRONTASK.ID.TRIGGER_EVENTS, variableMgmt.CRONTASK.SCHEDULE.TRIGGER_EVENTS);
			cronTaskTriggerEvents.on('run', () => this.triggerEvents());
			this.log("registerCronTask: Registered task '" + variableMgmt.CRONTASK.ID.TRIGGER_EVENTS + "' with cron format '" + variableMgmt.CRONTASK.SCHEDULE.TRIGGER_EVENTS + "'");
		}
		catch (err) {
			this.log("registerCronTask: Error registering task '" + variableMgmt.CRONTASK.ID.TRIGGER_EVENTS + "' with cron format '" + variableMgmt.CRONTASK.SCHEDULE.TRIGGER_EVENTS + "':", err);
		}
	}

	getEventList(events) {
		if (events.length === 0) {
			this.log("getEventList: No events. Returning empty array");
			return events;
		}

		return events.map(event => {
			let startStamp = "";
			let fullDayEvent = false;

			if (event.DTSTART_TIMESTAMP) {
				try {
					startStamp = moment(event.DTSTART_TIMESTAMP).format('DD.MM HH:mm')
				}
				catch (err) {
					this.log("getEventList: Failed to parse 'DTSTART_TIMESTAMP'", err);
					startStamp = "";
				}
			}
			else if (event.DTSTART_DATE) {
				try {
					fullDayEvent = true;
					startStamp = moment(event.DTSTART_DATE).format('DD.MM')
				}
				catch (err) {
					this.log("getEventList: Failed to parse 'DTSTART_DATE'", err);
					startStamp = "";
				}
			}

			let name = "";
			let description = "";

			if (startStamp === "") {
				name = event.SUMMARY;
			}
			else {
				name = `(${startStamp}) - ${event.SUMMARY}`;
			}

			if (event.RRULE) {
				description = Homey.__('conditions_event_description_recurring');
			}
			if (fullDayEvent) {
				if (description === "") {
					description = Homey.__('conditions_event_description_fullday');
				}
				else {
					description += " -- " + Homey.__('conditions_event_description_fullday');
				}
			}

			return { "id": event.UID, "name": name, "description": description };
		});
	}

	isEventOngoing(events) {
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
			this.log("isEventOngoing: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Ongoing: " + result);
			return result;
		});
	}

	isEventIn(events, when) {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, true, false);

			if (Object.keys(timestamps).length !== 1) {
				return false;
			}

			let now = moment();
			let start = moment(timestamps.start);
			let startDiff = now.diff(start, 'minutes');
			let result = (startDiff >= when && startDiff <= 0)
			this.log("isEventIn: " + startDiff + " mintes until start -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

	willEventNotIn(events, when) {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, false, true);
			const flipNumber = number => {
				if (number > 0)
					return -number;
				else if (number < 0)
					return Math.abs(number);
				else
					return 0;
			}

			if (Object.keys(timestamps).length !== 1) {
				return false;
			}

			let now = moment();
			let stop = moment(timestamps.stop);
			let stopDiff = flipNumber(now.diff(stop, 'minutes'));
			let result = (stopDiff < when && stopDiff >= 0);
			this.log("willEventNotIn: '" + event.SUMMARY + "' -- ", stop);
			this.log("willEventNotIn: " + stopDiff + " mintes until stop -- Expecting less than " + when + " minutes -- In: " + result);
			return result;
		});
	}

	eventsStartingOrStoppingNow(events) {
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
			this.log("eventsStartingOrStoppingNow: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Started now or in the last minute: " + resultStart);
			this.log("eventsStartingOrStoppingNow: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Stopped now or in the last minute: " + resultStop);
			
			if (resultStart) filteredEvents.push({ ...event, TRIGGER_ID: 'event_starts' });
			if (resultStop) filteredEvents.push({ ...event, TRIGGER_ID: 'event_stops' });
		});

		return filteredEvents;
	}

	getTriggerTokenValue(key) {
		if (!key) {
			return '';
		}
		else if (key === "" || key === " " || key === "\n" || key === "\\n" || key === "\n " || key === "\\n " || key === "\r" || key === "\\r" || key === "\r " || key === "\\r " || key === "\r\n" || key === "\\r\\n" || key === "\r\n " || key === "\\r\\n " || key === "\n\r" || key === "\\n\\r" || key === "\n\r " || key === "\\n\\r ") {
			return '';
		}

		return key;
	}

	getTriggerTokenDuration(event) {
		let timestamps = tools.getTimestamps(event, true, true);
		let duration = {};

		if (Object.keys(timestamps).length !== 2) {
			return { duration: '', durationMinutes: -1 };
		}

		// get duration
		let start = moment(timestamps.start);
		let stop = moment(timestamps.stop);
		let diff = stop.diff(start, 'minutes');
		//this.log("getTriggerTokenDuration: '" + event.SUMMARY + "' -- Start: " + timestamps.start + " -- Stop: " + timestamps.stop);

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

	startTrigger(event) {
		// trigger flow card
		let duration = this.getTriggerTokenDuration(event);
		let tokens = {
			'event_name': this.getTriggerTokenValue(event.SUMMARY),
			'event_description': this.getTriggerTokenValue(event.DESCRIPTION),
			'event_location': this.getTriggerTokenValue(event.LOCATION),
			'event_duration_readable': duration.duration,
			'event_duration': duration.durationMinutes
		};

		this.log(`startTrigger: Found event for trigger '${event.TRIGGER_ID}':`, tokens);
		Homey.ManagerFlow.getCard('trigger', event.TRIGGER_ID).trigger(tokens);
	}
}

module.exports = IcalCalendar;