'use strict';

const Homey = require('homey');
const tools = require('./lib/tools');
const variableMgmt = require('./lib/variableMgmt');

class IcalCalendar extends Homey.App {
	
	onInit() {
		this.log(Homey.manifest.name.en + " v" + Homey.manifest.version + " is running...");

		// move uri value to uris (support version <= v0.0.4)
		let legacyCalendar = Homey.ManagerSettings.get(variableMgmt.SETTING.ICAL_URI);
		if (legacyCalendar) {
			this.log("onInit: Moving legacy calendar to new calendar!");
			Homey.ManagerSettings.set(variableMgmt.SETTING.ICAL_URIS, [{ name: 'Default', uri: legacyCalendar }]);
			Homey.ManagerSettings.unset(variableMgmt.SETTING.ICAL_URI);
			this.log("onInit: Legacy calendar moved");
		}

		// instantiate triggers
		this.Triggers = require('./handlers/triggers')(this);
		
		// instantiate conditions
		this.Conditions = require('./handlers/conditions')(this);

		// instantiate actions
		this.Actions = require('./handlers/actions')(this);

		// register variableMgmt to this app class
		this.variableMgmt = variableMgmt;

		// get ical events
		this.getEvents();

		// register callback when a settings has been set
		Homey.ManagerSettings.on('set', args => {
			if (args && args === variableMgmt.SETTING.ICAL_URIS) {
				this.log("Homey.ManagerSettings.on:", args);
				this.getEvents();
			}
		});

		// remove cron tasks on unload
		Homey.on('unload', () => {
			this.unregisterCronTasks()
		});

		// register cron tasks for updateCalendar and triggerEvents
		this.registerCronTasks();
	}

	async getEvents() {
		// get URI from settings
		var calendars = Homey.ManagerSettings.get(variableMgmt.SETTING.ICAL_URIS);
		var events = [];

		// get ical events
		if (calendars) {
			this.log("getEvents: Getting calendars:", calendars.length);
			for (var i = 0; i < calendars.length; i++) {
				var { name, uri } = calendars[i];
				this.log(`getEvents: Getting events for calendar '${name}', using url '${uri}'`);

				await tools.getIcal(uri)
				.then(data => {
					// remove failed setting if it exists for calendar
					if (calendars[i].failed) {
						calendars[i] = { name, uri };
						Homey.ManagerSettings.set(variableMgmt.SETTING.ICAL_URIS, calendars);
						this.log("getEvents: 'failed' setting value removed from calendar '" + name + "'");
					}

					let json = tools.parseIcalToJson(data);
					let activeEvents = tools.filterActiveEvents(json);
					this.log(`getEvents: Events for calendar '${name}' updated. Event count: ${activeEvents.length}`);
					events.push({ name, events: activeEvents });
				})
				.catch(err => {
					this.log(`getEvents: Failed to get events for calendar '${name}', using url '${uri}': ${err.statusCode} (${err.message})`);

					// set a failed setting value to show a error message on settings page
					calendars[i] = { name, uri, failed: err.statusCode };
					Homey.ManagerSettings.set(variableMgmt.SETTING.ICAL_URIS, calendars);
					this.log("getEvents: 'failed' setting value added to calendar '" + name + "'");
				});
			}
		}
		else {
			this.log("getEvents: Calendars has not been set in Settings yet");
		}

		variableMgmt.EVENTS = events;
		return true;
	}

	async triggerEvents() {
		require('./handlers/triggers').triggerEvents(this);
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
}

module.exports = IcalCalendar;