'use strict';

const Homey = require('homey');
const tools = require('./lib/tools');
const variableMgmt = require('./lib/variableMgmt');

class IcalCalendar extends Homey.App {
	
	onInit() {
		this.log(Homey.manifest.name.en + " v" + Homey.manifest.version + " is running...");

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
			if (args && args === variableMgmt.SETTING.ICAL_URI) {
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
		this.log("getEvents: Getting url from setting '" + variableMgmt.SETTING.ICAL_URI + "'");
		var uri = Homey.ManagerSettings.get(variableMgmt.SETTING.ICAL_URI);

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
			this.log("getEvents: '" + variableMgmt.SETTING.ICAL_URI + "' has not been set in Settings yet");
			
			return false;
		}
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