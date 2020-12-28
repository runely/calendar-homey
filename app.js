'use strict';

const { sentry, init, startTransaction } = require('./lib/sentry-io');

const Homey = require('homey');

const logger = require('./lib/logger');
const getDateTimeFormat = require('./lib/get-datetime-format');
const getContent = require('./lib/get-ical-content');
const getActiveEvents = require('./lib/get-active-events');
const sortCalendarsEvents = require('./lib/sort-calendars');

const triggersHandler = require('./handlers/triggers');
const conditionsHandler = require('./handlers/conditions');
const actionsHandler = require('./handlers/actions');

class IcalCalendar extends Homey.App {
	
	onInit() {
		// set a variable to control if getEvents is already running
		this.isGettingEvents = false;

		// initialize sentry.io
		init(Homey);
		this.sentry = sentry;

		// register variableMgmt to this app class
		this.variableMgmt = require('./lib/variableMgmt');

		// get date and time format as an object
		this.variableMgmt.dateTimeFormat = getDateTimeFormat(this);

		// should we log to file as well?
		const loggingActive = Homey.ManagerSettings.get(this.variableMgmt.setting.logging.logToFile.active);
		if (loggingActive !== null) {
			this.logToFile = loggingActive;
		}
		else {
			this.logToFile = this.variableMgmt.setting.logging.logToFile.default;
		}

		logger.info(this, `${Homey.manifest.name.en} v${Homey.manifest.version} is running...`);

		// instantiate triggers
		triggersHandler(this);
		
		// instantiate conditions
		conditionsHandler(this);

		// instantiate actions
		actionsHandler(this);

		// get ical events
		this.getEvents(true);

		// register callback when settings has been set
		Homey.ManagerSettings.on('set', args => {
			if (args && (args === this.variableMgmt.setting.icalUris || args === this.variableMgmt.setting.eventLimit || args === this.variableMgmt.setting.nextEventTokensPerCalendar)) {
				// sync calendars when calendar specific settings have been changed
				if (!this.isGettingEvents) {
					this.getEvents(true);
				}
			}
			else if (args && (args === this.variableMgmt.setting.dateFormat || args === this.variableMgmt.setting.timeFormat)) {
				// get new date/time format
				this.variableMgmt.dateTimeFormat = getDateTimeFormat(this);
			}
			else if (args && args === this.variableMgmt.setting.logging.logToFile.active) {
				// get whether logging is active or not
				this.logToFile = Homey.ManagerSettings.get(this.variableMgmt.setting.logging.logToFile.active);
			}
		});

		// remove cron tasks on unload
		Homey.on('unload', () => this.unregisterCronTasks());

		// register cron tasks for updateCalendar and triggerEvents
		this.registerCronTasks();
	}

	async getEvents(reregisterCalendarTokens = false) {
		this.isGettingEvents = true;

		// get URI from settings
		let calendars = Homey.ManagerSettings.get(this.variableMgmt.setting.icalUris);
		// get event limit from settings or use the default
		let eventLimit = Homey.ManagerSettings.get(this.variableMgmt.setting.eventLimit) || this.variableMgmt.setting.eventLimitDefault;
		let calendarsEvents = [];

		// get ical events
		if (calendars) {
			logger.info(this, 'getEvents: Getting calendars:', calendars.length);

			for (var i = 0; i < calendars.length; i++) {
				let { name, uri } = calendars[i];
				if (uri === '') {
					logger.warn(this, `getEvents: Calendar '${name}' has empty uri. Skipping...`);
					continue;
				}
				else if (uri.indexOf('http://') === -1 && uri.indexOf('https://') === -1 && uri.indexOf('webcal://') === -1) {
					logger.warn(this, `getEvents: Uri for calendar '${name}' is invalid. Skipping...`);
					calendars[i] = { name, uri, failed: `Uri for calendar '${name}' is invalid` };
					Homey.ManagerSettings.set(this.variableMgmt.setting.icalUris, calendars);
					logger.info(this, `getEvents: 'failed' setting value added to calendar '${name}'`);
					continue;
				}
				
				if (uri.indexOf('webcal://') === 0) {
					uri = uri.replace('webcal://', 'https://');
					logger.info(this, `getEvents: Calendar '${name}': webcal found and replaced with https://`);
				}
				
				//logger.info(this, `getEvents: Getting events (${eventLimit.value} ${eventLimit.type} ahead) for calendar '${name}' with uri '${uri}'`);
				logger.info(this, `getEvents: Getting events (${eventLimit.value} ${eventLimit.type} ahead) for calendar`, name, uri);

				await getContent(uri)
				.then(data => {
					// remove failed setting if it exists for calendar
					if (calendars[i].failed) {
						calendars[i] = { name, uri };
						Homey.ManagerSettings.set(this.variableMgmt.setting.icalUris, calendars);
						logger.info(this, `getEvents: 'failed' setting value removed from calendar '${name}'`);
					}

					let activeEvents = getActiveEvents(data, eventLimit);
					logger.info(this, `getEvents: Events for calendar '${name}' updated. Event count: ${activeEvents.length}`);
					calendarsEvents.push({ name, events: activeEvents });
				})
				.catch(err => {
					const errorStr = typeof err === 'object' ? err.message : err;

					//logger.error(this, `getEvents: Failed to get events for calendar '${name}', using url '${uri}':`, errorStr);
					logger.error(this, `getEvents: Failed to get events for calendar`, name, uri, errorStr);

					// send exception to sentry (don't think this actually is useful)
					//sentry.captureException(err);

					// set a failed setting value to show a error message on settings page
					calendars[i] = { name, uri, failed: errorStr };
					Homey.ManagerSettings.set(this.variableMgmt.setting.icalUris, calendars);
					logger.info(this, `getEvents: 'failed' setting value added to calendar '${name}'`);
				});
			}
		}
		else {
			logger.info(this, 'getEvents: Calendars has not been set in Settings yet');
		}

		this.variableMgmt.calendars = calendarsEvents;
		sortCalendarsEvents(this.variableMgmt.calendars);

		if (reregisterCalendarTokens) {
			// unregister calendar tokens
			if (this.variableMgmt.calendarTokens.length > 0) {
				await Promise.all(this.variableMgmt.calendarTokens.map(async (token) => await token.unregister()));
				this.variableMgmt.calendarTokens = [];
				logger.info(this, 'getEvents: Calendar tokens flushed');
			}

			// get setting for adding nextEventTokensPerCalendar
			let nextEventTokensPerCalendar = Homey.ManagerSettings.get(this.variableMgmt.setting.nextEventTokensPerCalendar);

			// register calendar tokens
			if (this.variableMgmt.calendars.length > 0) {
				await Promise.all(this.variableMgmt.calendars.map(async (calendar) => {
					// todays events pr calendar
					new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostTodayId}`, { type: 'string', title: `${Homey.__('calendarTokens.events_today_calendar_title_stamps')} ${calendar.name}`}).register()
						.then(token => {
							this.variableMgmt.calendarTokens.push(token);
							logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
					});
					// tomorrows events pr calendar
					new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostTomorrowId}`, { type: 'string', title: `${Homey.__('calendarTokens.events_tomorrow_calendar_title_stamps')} ${calendar.name}`}).register()
						.then(token => {
							this.variableMgmt.calendarTokens.push(token);
							logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
					});

					if (nextEventTokensPerCalendar) {
						// next event title pr calendar
						new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostNextTitleId}`, { type: 'string', title: `${Homey.__('calendarTokens.event_next_title_calendar')} ${calendar.name}`}).register()
							.then(token => {
								this.variableMgmt.calendarTokens.push(token);
								logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
						});
						// next event start date pr calendar
						new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostNextStartDateId}`, { type: 'string', title: `${Homey.__('calendarTokens.event_next_startdate_calendar')} ${calendar.name}`}).register()
							.then(token => {
								this.variableMgmt.calendarTokens.push(token);
								logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
						});
						// next event start time pr calendar
						new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostNextStartTimeId}`, { type: 'string', title: `${Homey.__('calendarTokens.event_next_startstamp_calendar')} ${calendar.name}`}).register()
							.then(token => {
								this.variableMgmt.calendarTokens.push(token);
								logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
						});
						// next event end date pr calendar
						new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostNextEndDateId}`, { type: 'string', title: `${Homey.__('calendarTokens.event_next_enddate_calendar')} ${calendar.name}`}).register()
							.then(token => {
								this.variableMgmt.calendarTokens.push(token);
								logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
						});
						// next event end time pr calendar
						new Homey.FlowToken(`${this.variableMgmt.calendarTokensPreId}${calendar.name}${this.variableMgmt.calendarTokensPostNextEndTimeId}`, { type: 'string', title: `${Homey.__('calendarTokens.event_next_endstamp_calendar')} ${calendar.name}`}).register()
							.then(token => {
								this.variableMgmt.calendarTokens.push(token);
								logger.info(this, `getEvents: Registered calendarToken '${token.id}'`);
						});
					}
				}));
			}
		}

		this.isGettingEvents = false;

		return true;
	}

	async triggerEvents() {
		
		// update flow tokens and trigger events IF events exists 
		if (this.variableMgmt.calendars && this.variableMgmt.calendars.length > 0) {
			// first, update flow tokens, then trigger events
			await triggersHandler.updateTokens(this)
				.catch(error => {
					logger.error(this, 'app.triggerEvents: Failed in updateTokens Promise:', error)

					// send exception to sentry
					sentry.captureException(error);
				});

			await triggersHandler.triggerEvents(this)
				.catch(error => {
					logger.error(this, 'app.triggerEvents: Failed in triggerEvents Promise:', error)

					// send exception to sentry
					sentry.captureException(error);
				});
		}
	}

	async unregisterCronTasks() {
		try {
			await Homey.ManagerCron.unregisterTask(this.variableMgmt.crontask.id.updateCalendar);
		}
		catch (err) {
		}

		try {
			await Homey.ManagerCron.unregisterTask(this.variableMgmt.crontask.id.triggerEvents);
		}
		catch (err) {
		}
	}
	
	async registerCronTasks() {
		await this.unregisterCronTasks();

		try {
			const cronTaskUpdateCalendar = await Homey.ManagerCron.registerTask(this.variableMgmt.crontask.id.updateCalendar, this.variableMgmt.crontask.schedule.updateCalendar);
			cronTaskUpdateCalendar.on('run', () => {
				if (!this.isGettingEvents) {
					this.getEvents();
				}
			});
			//logger.info(this, `registerCronTask: Registered task '${this.variableMgmt.crontask.id.updateCalendar}' with cron format '${this.variableMgmt.crontask.schedule.updateCalendar}'`);
		}
		catch (err) {
		}

		try {
			//const cronTaskTriggerEvents = await Homey.ManagerCron.registerTask(variableMgmt.crontask.id.triggerEvents, variableMgmt.crontask.schedule.triggerEvents);
			const cronTaskTriggerEvents = await Homey.ManagerCron.registerTask(this.variableMgmt.crontask.id.triggerEvents, this.variableMgmt.crontask.schedule.triggerEvents);
			cronTaskTriggerEvents.on('run', () => this.triggerEvents());
			//logger.info(this, `registerCronTask: Registered task '${this.variableMgmt.crontask.id.triggerEvents}' with cron format '${this.variableMgmt.crontask.schedule.triggerEvents}'`);
		}
		catch (err) {
		}
	}
}

module.exports = IcalCalendar;
