'use strict';

const Homey = require('homey');
const tools = require('./lib/tools');
const variableMgmt = require('./lib/variableMgmt');

const triggersHandler = require('./handlers/triggers');
const conditionsHandler = require('./handlers/conditions');
const actionsHandler = require('./handlers/actions');

class IcalCalendar extends Homey.App {
	
	onInit() {
		this.log(Homey.manifest.name.en + " v" + Homey.manifest.version + " is running...");

		// move uri value to uris (support version <= v0.0.4)
		let legacyCalendar = Homey.ManagerSettings.get(variableMgmt.setting.icalUri);
		if (legacyCalendar) {
			this.log("onInit: Moving legacy calendar to new calendar!");
			Homey.ManagerSettings.set(variableMgmt.setting.icalUris, [{ name: 'Default', uri: legacyCalendar }]);
			Homey.ManagerSettings.unset(variableMgmt.setting.icalUri);
			this.log("onInit: Legacy calendar moved");
		}

		// instantiate triggers
		this.Triggers = triggersHandler(this);
		
		// instantiate conditions
		this.Conditions = conditionsHandler(this);

		// instantiate actions
		this.Actions = actionsHandler(this);

		// register variableMgmt to this app class
		this.variableMgmt = variableMgmt;

		// get ical events
		this.getEvents();

		// register callback when a settings has been set
		Homey.ManagerSettings.on('set', args => {
			if (args && args === variableMgmt.setting.icalUris) {
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
		var calendars = Homey.ManagerSettings.get(variableMgmt.setting.icalUris);
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
						Homey.ManagerSettings.set(variableMgmt.setting.icalUris, calendars);
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
					calendars[i] = { name, uri, failed: err.message };
					Homey.ManagerSettings.set(variableMgmt.setting.icalUris, calendars);
					this.log("getEvents: 'failed' setting value added to calendar '" + name + "'");
				});
			}
		}
		else {
			this.log("getEvents: Calendars has not been set in Settings yet");
		}

		variableMgmt.events = events;
		return true;
	}

	async triggerEvents() {
		// trigger events
		triggersHandler.triggerEvents(this);

		// update flow tokens
		triggersHandler.updateTokens(this);
	}

	async unregisterCronTasks() {
		try {
			await Homey.ManagerCron.unregisterTask(variableMgmt.crontask.id.updateCalendar);
			this.log("unregisterCronTask: Unregistered task '" + variableMgmt.crontask.id.updateCalendar + "'");
		}
		catch (err) {
			this.log("unregisterCronTask: Error unregistering task '" + variableMgmt.crontask.id.updateCalendar + "':", err);
		}

		try {
			await Homey.ManagerCron.unregisterTask(variableMgmt.crontask.id.triggerEvents);
			this.log("unregisterCronTask: Unregistered task '" + variableMgmt.crontask.id.triggerEvents + "'");
		}
		catch (err) {
			this.log("unregisterCronTask: Error unregistering task '" + variableMgmt.crontask.id.triggerEvents + "':", err);
		}
	}
	
	async registerCronTasks() {
		await this.unregisterCronTasks();

		try {
			const cronTaskUpdateCalendar = await Homey.ManagerCron.registerTask(variableMgmt.crontask.id.updateCalendar, variableMgmt.crontask.schedule.updateCalendar);
			cronTaskUpdateCalendar.on('run', () => this.getEvents());
			this.log("registerCronTask: Registered task '" + variableMgmt.crontask.id.updateCalendar + "' with cron format '" + variableMgmt.crontask.schedule.updateCalendar + "'");
		}
		catch (err) {
			this.log("registerCronTask: Error registering task '" + variableMgmt.crontask.id.updateCalendar + "' with cron format '" + variableMgmt.crontask.schedule.updateCalendar + "':", err);
		}

		try {
			const cronTaskTriggerEvents = await Homey.ManagerCron.registerTask(variableMgmt.crontask.id.triggerEvents, variableMgmt.crontask.schedule.triggerEvents);
			cronTaskTriggerEvents.on('run', () => this.triggerEvents());
			this.log("registerCronTask: Registered task '" + variableMgmt.crontask.id.triggerEvents + "' with cron format '" + variableMgmt.crontask.schedule.triggerEvents + "'");
		}
		catch (err) {
			this.log("registerCronTask: Error registering task '" + variableMgmt.crontask.id.triggerEvents + "' with cron format '" + variableMgmt.crontask.schedule.triggerEvents + "':", err);
		}
	}
}

module.exports = IcalCalendar;