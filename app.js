'use strict';

const Homey = require('homey');
const tools = require('./lib/tools');
const moment = require('moment');
const variableMgmt = require('./lib/variableMgmt');

class IcalCalendar extends Homey.App {
	
	onInit() {
		this.log(Homey.manifest.name.en + " V" + Homey.manifest.version + " is running...");

		// register trigger flow cards
		this.registerTriggerFlowCards();
		
		// register condition flow cards
		this.registerConditionFlowCards();

		// get ical
		this.getEvents();

		// register callback when a settings has been set
		Homey.ManagerSettings.on('set', args => this.getEvents(args));

		// remove cron tasks on unload
		Homey.on('unload', () => {
			this.unregisterCronTasks()
			clearInterval(variableMgmt.INTERVAL.eventStartsTrigger);
		});

		// register cron tasks for updateCalendar and triggerEvents
		this.registerCronTasks();
	}

	registerTriggerFlowCards() {
		// registering trigger with Homey
		new Homey.FlowCardTrigger('event_starts').register();
		
		/*// mock trigger
		variableMgmt.INTERVAL.eventStartsTrigger = setInterval(() => {
			this.log("setInterval:", "Triggering flow");

			let tokens = {
				'event_name': 'Postmann Pat',
				'event_description': 'Opplæring i bomgiring',
				'event_location': 'Greendale'
			};

			Homey.ManagerFlow.getCard('trigger', 'event_starts').trigger(tokens).then(this.log);
		}, 45000);*/
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
	}

	onEventAutocomplete(query, args) {
		if (!variableMgmt.EVENTS) {
			this.log("onEventAutocomplete: Events not set yet. Nothing to show...");
			return Promise.reject(false);
		}
		else {
			var filtered = tools.filterIcalBySummary(variableMgmt.EVENTS, query)
			this.log("onEventAutocomplete: Filtered events count: " + filtered.length);
			return Promise.resolve(this.getEventList(filtered));
		}
	}

	async checkEvent(args, state, type) {
		var eventCondition = false;
		var filteredEvents;
		if (type === 'ongoing' || type === 'in') {
			filteredEvents = tools.filterIcalByUID(variableMgmt.EVENTS, args.event.id);
		}
		else if (type === 'any_ongoing' || type === 'any_in') {
			filteredEvents = tools.filterIcalBySummary(variableMgmt.EVENTS, '');
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
		else if (type === 'any_ongoing') {
			eventCondition = this.isEventOngoing(filteredEvents);
			this.log("checkEvent: Is any of the " + filteredEvents.length + " events ongoing? " + eventCondition);
		}
		else if (type === 'any_in') {
			eventCondition = this.isEventIn(filteredEvents, args.when);
			this.log("checkEvent: Is any of the " + filteredEvents.length + " events starting in " + args.when + " minutes or less? " + eventCondition);
		}

		return Promise.resolve(eventCondition);
	}

	async getEvents(args) {
		if (args) {
			this.log("getEvents: Called from " + args);
			var settingName = args;
		}
		else {
			this.log("getEvents: Called from onInit/cron");
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
					variableMgmt.EVENTS = tools.parseIcalToJson(data);
					this.log("getEvents: Events updated. Events count: " + variableMgmt.EVENTS.VEVENT.length);
					
					return true;
				})
				.catch(err => {
					this.log("getEvents: Failed to retrieve ical content from '" + uri + "':", err);
					
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
			var filteredEvents = tools.filterIcalBySummary(variableMgmt.EVENTS, '');
			this.log("triggerEvents:", "Checking if any of the " + filteredEvents.length + " events starts now or has started in the last minute");
			var eventStartedNow = this.isAnyEventStartingNow(filteredEvents);

			if (eventStartedNow) {
				// trigger flow card
				let tokens = {
					'event_name': this.getTokenValue(eventStartedNow.SUMMARY),
					'event_description': this.getTokenValue(eventStartedNow.DESCRIPTION),
					'event_location': this.getTokenValue(eventStartedNow.LOCATION)
				};

				this.log("triggerEvents: Found started event:", tokens);
				Homey.ManagerFlow.getCard('trigger', 'event_starts').trigger(tokens);
			}
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
			if (event.DTSTART_TIMESTAMP) {
				try {
					startStamp = moment(event.DTSTART_TIMESTAMP).format('DD.MM HH:mm')
				}
				catch (err) {
					console.log("eventList: Failed to parse 'DTSTART_TIMESTAMP'", err);
					startStamp = "";
				}
			}
			else if (event.DTSTART_DATE) {
				try {
					startStamp = moment(event.DTSTART_DATE).format('DD.MM')
				}
				catch (err) {
					console.log("eventList: Failed to parse 'DTSTART_DATE'", err);
					startStamp = "";
				}
			}

			if (startStamp === "") {
				return { "id": event.UID, "name": `${event.SUMMARY}` };
			}
			else {
				return { "id": event.UID, "name": `(${startStamp}) - ${event.SUMMARY}` };
			}
		});
	}

	isEventOngoing(events) {
		return events.some(event => {
			var startStamp = "";
			var stopStamp = "";
			if (event.DTSTART_TIMESTAMP && event.DTEND_TIMESTAMP) {
				startStamp = event.DTSTART_TIMESTAMP;
				stopStamp = event.DTEND_TIMESTAMP;
			}
			else if (event.DTSTART_DATE && event.DTEND_DATE) {
				startStamp = event.DTSTART_DATE;
				stopStamp = event.DTEND_DATE;
			}
			else {
				//this.log("isEventOngoing: Summary: '" + event.SUMMARY + "' :: Start or Stop not present. Skipping event...");
				return false;
			}
			//this.log("isEventOngoing: Summary: '" + event.SUMMARY + "' :: Start: '" + startStamp + "' <--> Stop: '" + stopStamp + "'");

			let now = moment();
			let start = moment(startStamp);
			let stop = moment(stopStamp);
			let startDiff = now.diff(start, 'seconds');
			let stopDiff = now.diff(stop, 'seconds');
			let result = (startDiff >= 0 && stopDiff <= 0);
			//this.log("isEventOngoing: " + startDiff + " minutes since start -- " + stopDiff + " minutes since stop -- Ongoing: " + result);
			this.log("isEventOngoing: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Ongoing: " + result);
			return result;
		});
	}

	isEventIn(events, when) {
		return events.some(event => {
			var startStamp = "";
			if (event.DTSTART_TIMESTAMP) {
				startStamp = event.DTSTART_TIMESTAMP;
			}
			else if (event.DTSTART_DATE) {
				startStamp = event.DTSTART_DATE;
			}
			else {
				//this.log("isEventIn: Summary: '" + event.SUMMARY + "' :: Start not present. Skipping event...")
				return false;
			}
			//this.log("isEventIn: Summary: '" + event.SUMMARY + "' :: Start: '" + startStamp + "'")

			let whenMinutes = parseInt(when);
			whenMinutes = -whenMinutes;
			let now = moment();
			let start = moment(startStamp);
			let startDiff = now.diff(start, 'minutes');
			let result = (startDiff >= when && startDiff <= 0)
			this.log("isEventIn: " + startDiff + " mintes until start -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

	isAnyEventStartingNow(events) {
		var e;
		const starting = events.some(event => {
			var startStamp = "";
			var stopStamp = "";
			if (event.DTSTART_TIMESTAMP && event.DTEND_TIMESTAMP) {
				startStamp = event.DTSTART_TIMESTAMP;
				stopStamp = event.DTEND_TIMESTAMP;
			}
			else if (event.DTSTART_DATE && event.DTEND_DATE) {
				startStamp = event.DTSTART_DATE;
				stopStamp = event.DTEND_DATE;
			}
			else {
				//this.log("isAnyEventStartingNow: Summary: '" + event.SUMMARY + "' :: Start or Stop not present. Skipping event...");
				return false;
			}
			//this.log("isAnyEventStartingNow: Summary: '" + event.SUMMARY + "' :: Start: '" + startStamp + "' <--> Stop: '" + stopStamp + "'");

			let now = moment();
			let start = moment(startStamp);
			let stop = moment(stopStamp);
			let startDiff = now.diff(start, 'seconds');
			let stopDiff = now.diff(stop, 'seconds');
			let result = (startDiff >= 0 && startDiff <= 55 && stopDiff <= 0);
			this.log("isAnyEventStartingNow: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Started now or in the last minute: " + result);
			if (result) e = event;
			return result;
		});

		if (starting) return e;
		else return null;
	}

	getTokenValue(key) {
		if (!key) {
			return '';
		}
		else if (key === "" || key === " " || key === "\n" || key === "\\n" || key === "\n " || key === "\\n " || key === "\r" || key === "\\r" || key === "\r " || key === "\\r " || key === "\r\n" || key === "\\r\\n" || key === "\r\n " || key === "\\r\\n " || key === "\n\r" || key === "\\n\\r" || key === "\n\r " || key === "\\n\\r ") {
			return '';
		}

		return key;
	}
}

module.exports = IcalCalendar;