'use strict';

const Homey = require('homey');
const { ManagerSettings } = require('homey');
const tools = require('./lib/tools');
const moment = require('moment');

const CRONTASK = 'no.runely.calendar.cron';
const CRONTASK_SCHEDULE = '0 */1 * * *'; // run every full hour
const SETTING_ICAL_URI = 'uri';

var events = "";

class IcalCalendar extends Homey.App {
	
	onInit() {
		this.log('IcalCalendar is running...');

		// register condition flow cards
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

		// get ical
		this.getEvents();

		// register callback when a settings has been set
		ManagerSettings.on('set', args => this.getEvents(args));

		// register cron task
		this.registerCronTask();
	}

	onEventAutocomplete(query, args) {
		//this.log("onEventAutocomplete called with query '" + query + "'");

		if (!events) {
			this.log("onEventAutocomplete: Events not set yet. Nothing to show...");
			return Promise.reject(false);
		}
		else {
			// TODO: tools.filterIcalBySummary doesn't handle spaces and another character
			var filtered = tools.filterIcalBySummary(events, query)
			this.log("onEventAutocomplete: Filtered events count: " + filtered.length);
			return Promise.resolve(this.getEventList(filtered));
		}
	}

	async checkEvent(args, state, type) {
		//this.log("checkEvent called from " + type)
		
		var eventCondition = false;
		var filteredEvents = tools.filterIcalByUID(events, args.event.id);
		if (!filteredEvents || !filteredEvents.length) {
			this.log("checkEvent: filteredEvents empty... Rejecting with false");
			return Promise.reject(false);
		}
		this.log("checkEvent: " + filteredEvents.length)
		this.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name);

		if (type === 'ongoing') {
			eventCondition = this.isEventOngoing(filteredEvents);
			 this.log("checkEvent: Ongoing? " + eventCondition);
		}
		else if (type === 'in') {
			eventCondition = this.isEventIn(filteredEvents, args.when);
			this.log("checkEvent: Starting exactly in " + args.when + " minutes? " + eventCondition);
		}

		return Promise.resolve(eventCondition);
	}

	async getEvents(args) {
		// args = the setting name that changed
		if (args) {
			this.log("getEvents: Called from " + args);
			var settingName = args;
		}
		else {
			this.log("getEvents: Called from onInit/cron");
			var settingName = SETTING_ICAL_URI;
		}

		// get URI from settings
		this.log("getEvents: Getting url from setting '" + settingName + "'");
		var uri = ManagerSettings.get(settingName);

		// get ical file
		if (uri) {
			tools.getIcal(uri)
			.then(data => {
				events = tools.parseIcalToJson(data);
				this.log("getEvents: Events updated. Events: " + events.VEVENT.length);
				
				return true;
			})
			.catch(err => {
				this.log("getEvents: Failed to retrieve ical content from '" + uri + "'", err);
				
				return false;
			});
		}
		else {
			this.log("getEvents: '" + settingName + "' has not been set in Settings yet");
			
			return false;
		}
	}

	async unregisterCronTask() {
		try {
			await Homey.ManagerCron.unregisterTask(CRONTASK);
			this.log("unregisterCronTask: Unregistered task '" + CRONTASK + "'");
		}
		catch (err) {
			this.log("unregisterCronTask: Error unregistering task '" + CRONTASK + "'", err);
		}
	}
	
	async registerCronTask() {
		await this.unregisterCronTask();

		try {
			const cronTask = await Homey.ManagerCron.registerTask(CRONTASK, CRONTASK_SCHEDULE);
			cronTask.on('run', () => this.getEvents());
			this.log("registerCronTask: Registered task '" + CRONTASK + "' with cron format '" + CRONTASK_SCHEDULE + "'");
		}
		catch (err) {
			this.log("registerCronTask: Error registering task '" + CRONTASK + "' with cron format '" + CRONTASK_SCHEDULE + "'", err);
		}
	}

	getEventList(filtered) {
		if (filtered.length === 0) {
			this.log("getEventList: No events. Returning empty array");
			return filtered;
		}

		return filtered.map(event => ({ "id": event.UID, "name": event.SUMMARY }));
	}

	isEventOngoing(events) {
		return events.some(event => {
			var startStamp = "";
			var stopStamp = "";
			if (event.DTSTART_TIMESTAMP) {
				this.log("isEventOngoing: Summary: '" + event.SUMMARY + "' <--> Timestamp: '" + event.DTSTART_TIMESTAMP + "'")
				startStamp = event.DTSTART_TIMESTAMP;
				stopStamp = event.DTEND_TIMESTAMP;
			}
			else if (event.DTSTART_DATE) {
				this.log("isEventOngoing: Summary: '" + event.SUMMARY + "' <--> Date: '" + event.DTSTART_DATE + "'")
				startStamp = event.DTSTART_DATE;
				stopStamp = event.DTEND_DATE;
			}

			let now = moment();
			let start = moment(startStamp);
			let stop = moment(stopStamp);
			let startDiff = now.diff(start, 'minutes');
			let stopDiff = now.diff(stop, 'minutes');
			let result = (startDiff >= 0 && stopDiff <= 0);
			this.log("isEventOngoing: " + startDiff + " minutes since start -- " + stopDiff + " minutes since stop -- Ongoing: " + result);
			return result;
		});
	}

	isEventIn(events, when) {
		return events.some(event => {
			var startStamp = "";
			if (event.DTSTART_TIMESTAMP) {
				this.log("isEventIn: Summary: '" + event.SUMMARY + "' <--> Timestamp: '" + event.DTSTART_TIMESTAMP + "'")
				startStamp = event.DTSTART_TIMESTAMP;
			}
			else if (event.DTSTART_DATE) {
				this.log("isEventIn: Summary: '" + event.SUMMARY + "' <--> Date: '" + event.DTSTART_DATE + "'")
				startStamp = event.DTSTART_DATE;
			}

			let whenMinutes = parseInt(when);
			whenMinutes = -whenMinutes;
			let now = moment();
			let start = moment(startStamp);
			let startDiff = now.diff(start, 'minutes');
			let result = (startDiff >= whenMinutes);
			this.log("isEventIn: " + startDiff + " mintes until start -- Expecting " + whenMinutes + " minutes or less -- In: " + result);
			return result;
		});
	}
}

module.exports = IcalCalendar;