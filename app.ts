import Homey from 'homey';
import { Moment } from "moment";

import { varMgmt } from './lib/variable-management.js';
import { getDateTimeFormat } from './lib/get-datetime-format.js';
import { resetTodayHitCount } from './lib/hit-count.js';
import { getMoment } from './lib/moment-datetime.js';

import { addJob, isValidCron } from './handlers/cron.js';
import { getEvents } from './handlers/get-events.js';
import { setupActions } from './handlers/setup-actions.js';
import { setupConditions } from './handlers/setup-conditions.js';
import { setupFlowTokens } from './handlers/setup-flow-tokens.js';
import { setupTriggers } from './handlers/setup-triggers.js';
import { triggerEvents, triggerSynchronizationError } from './handlers/trigger-cards.js';
import { updateTokens } from './handlers/update-tokens.js';

import { SyncInterval } from "./types/IcalCalendar.type";
import { VariableManagement } from "./types/VariableMgmt.type";

let variableMgmt: VariableManagement | null = null;

class IcalCalendar extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit(): Promise<void> {
    /* if (process.env.DEBUG === '1') {
      try {
        require('inspector').waitForDebugger();
        this.log('Attached inspector');
      } catch (error) {
        require('inspector').open(9222, '0.0.0.0', true);
        this.log('Attached inspector:9222');
      }
    } */

    this.log(`${Homey.manifest.name.en} v${Homey.manifest.version} is running on firmware ${this.homey.version} with Timezone: '${this.homey.clock.getTimezone()}'`);

    // set a variable to control if getEvents is already running
    //isGettingEvents = false;

    variableMgmt = varMgmt;
    if (variableMgmt === null) {
      this.error('[ERROR] onInit: Variable management initialization failed! App halted.');
      throw new Error('Variable management initialization failed');
    }

    // get date and time format as an object
    variableMgmt.dateTimeFormat = getDateTimeFormat(this, variableMgmt);

    setupTriggers(this, variableMgmt);

    await setupFlowTokens(this, variableMgmt);

    this.getSyncInterval();

    // register cron jobs
    await this.startJobs();

    // setup conditions
    setupConditions(this, variableMgmt, this.homey.clock.getTimezone());

    // setup actions
    setupActions(this, variableMgmt);

    // get ical events
    this.log('onInit: Triggering getEvents and reregistering tokens')
    getEvents(this, variableMgmt, true)
      .catch(err => this.error('[ERROR] onInit: Failed to complete getEvents(true):', err))

    // register callback when settings has been set
    this.registerSettingCallbacks();

    this.homey.on('unload', () => {
      if (typeof this._unload !== 'function') {
        this.log('[WARN] unload -- this._unload is not a function');
        return;
      }

      this.log('unload -- calling this._unload');
      this._unload('unload');
    })
  }

  getSyncInterval (): void {
    if (!variableMgmt) {
      this.error('[ERROR] onInit/getSyncInterval: Variable management initialization failed. App halted!');
      throw new Error('Variable management initialization failed');
    }

    const syncInterval: SyncInterval | null = this.homey.settings.get(variableMgmt.setting.syncInterval) as SyncInterval || null;
    if (syncInterval) {
      this.log('onInit/getSyncInterval: Sync interval settings:', syncInterval);
      return;
    }

    const syncIntervalDefault: SyncInterval = {
      auto: true,
      cron: '15 */15 * * * *'
    };
    this.homey.settings.set(variableMgmt.setting.syncInterval, syncIntervalDefault);
    this.log('onInit/getSyncInterval: Default sync interval settings set:', syncIntervalDefault);
  }

  registerSettingCallbacks (): void {
    this.homey.settings.on('set', (args: string): void => {
      if (!variableMgmt) {
        this.error('[ERROR] registerSettingCallbacks: Variable management initialization failed. App halted!');
        throw new Error('Variable management initialization failed');
      }

      if ([variableMgmt.setting.icalUris, variableMgmt.setting.eventLimit, variableMgmt.setting.nextEventTokensPerCalendar].includes(args)) {
        // sync calendars when calendar specific settings have been changed
        if (variableMgmt.gettingEventsRunning) {
          this.log(`registerSettingCallbacks/${args}: "getEvents" is currently running. Updated settings won't be applied until the next 15th minute!`);
          return;
        }

        this.log(`registerSettingCallbacks/${args}: Triggering getEvents and reregistering tokens`);
        getEvents(this, variableMgmt, true)
          .catch(err => this.error(`[ERROR] registerSettingCallbacks/${args}: Failed to complete getEvents(true):`, err));
        return;
      }

      if ([variableMgmt.setting.dateFormatLong, variableMgmt.setting.dateFormatShort, variableMgmt.setting.timeFormat].includes(args)) {
        // get new date/time format
        variableMgmt.dateTimeFormat = getDateTimeFormat(this, variableMgmt);
        return;
      }

      if ([variableMgmt.setting.syncInterval].includes(args)) {
        // adjust synchronization interval
        this.startJobs('update')
          .catch(err => this.error(`[ERROR] registerSettingCallbacks/${args}: Failed to complete startJobs('update'):`, err));
      }
    });
  }

  async startJobs (type?: string): Promise<void> {
    const updateFunc = (): void => {
      if (!variableMgmt) {
        this.error('[ERROR] startJobs/update: Variable management initialization failed. App halted!');
        throw new Error('Variable management initialization failed');
      }

      if (variableMgmt.gettingEventsRunning) {
        this.log('[WARN] startJobs/update: Wont update calendars from this job since getEvents is already running');
        return;
      }

      if (variableMgmt.gettingEventsLastRun && ((Date.now() - variableMgmt.gettingEventsLastRun.getTime()) / 1000 / 60) < 5) {
        this.log('[WARN] startJobs/update: Wont update calendars from this job since there\'s less than 5 minutes since getEvents was last executed:', variableMgmt.gettingEventsLastRun);
        return;
      }

      this.log('startJobs/update: Updating calendars without reregistering tokens');
      getEvents(this, variableMgmt)
        .catch(err => this.error('[ERROR] startJobs/updateFunc: Failed to complete getEvents():', err));
    };

    if (!variableMgmt) {
      this.error('[ERROR] startJobs: Variable management initialization failed. App halted!');
      throw new Error('Variable management initialization failed');
    }
    const interval: SyncInterval = this.homey.settings.get(variableMgmt.setting.syncInterval) as SyncInterval;

    if (!type) {
      if (variableMgmt.jobs) {
        this._unloadCronJobs('startJobs');
      }

      variableMgmt.jobs = {};

      // trigger events every 1th minute
      variableMgmt.jobs.trigger = addJob('*/1 * * * *', async (): Promise<void> => {
        if (!variableMgmt) {
          this.error('[ERROR] startJobs/trigger: Variable management initialization failed. App halted!');
          throw new Error('Variable management initialization failed');
        }

        let now: Moment = getMoment({ timezone: this.homey.clock.getTimezone() });
        if (now.get('hours') === 0 && now.get('minutes') === 0) {
          resetTodayHitCount(this, variableMgmt);
        }

        if (variableMgmt.gettingEventsRunning) {
          this.log('[WARN] startJobs/trigger: Wont update tokens and trigger events since getEvents is running. Will update/trigger in one minute');
          return;
        }

        if (!variableMgmt?.calendars || variableMgmt.calendars.length === 0) {
          this.log('[WARN] startJobs/trigger: Can\'t update tokens and trigger events since theres no calendars.');
          return;
        }

        this.log('startJobs/trigger: Updating tokens and triggering events');
        await updateTokens(this, variableMgmt, this.homey.clock.getTimezone());
        await triggerEvents(this, variableMgmt, this.homey.clock.getTimezone());
      });

      // calendar update by cron syntax
      if (!interval.auto) {
        this.log('startJobs: Auto update is disabled. Synchronization can only be performed by flow card!');
        return;
      }

      if (!isValidCron(interval.cron)) {
        this.error(`[ERROR] startJobs: Auto update will be disabled. Invalid cron value specified in settings: '${interval.cron}'`);
        try {
          await triggerSynchronizationError({ app: this, variableMgmt, calendar: 'cron syntax', error: `Invalid cron value specified in settings: '${interval.cron}'` });
        } catch (err) {
          this.error('[ERROR] startJobs: Failed to complete triggerSynchronizationError(...):', err);
        }
        interval.error = `Invalid cron value specified in settings: '${interval.cron}'`;
        this.homey.settings.set(variableMgmt.setting.syncInterval, interval);
        return;
      }

      if (interval.error) {
        delete interval.error;
        this.homey.settings.set(variableMgmt.setting.syncInterval, interval);
        this.log('startJobs: Previous cron syntax error removed from settings since cron value is now valid');
      }

      variableMgmt.jobs.update = addJob(interval.cron, updateFunc);
      if (!variableMgmt.jobs.update) {
        this.error('[ERROR] startJobs: Failed to create update job!');
        return;
      }
      this.log(`startJobs: Auto update enabled with cron value '${interval.cron}'. Next update in UTC: ${variableMgmt.jobs.update.nextRun()}`);

      return;
    }

    if (type === 'update') {
      if (variableMgmt.jobs.update) {
        variableMgmt.jobs.update.stop();
      }

      if (!interval.auto) {
        this.log('startJobs(update): Auto update is disabled. Synchronization can only be performed by flow card!');
        delete variableMgmt.jobs.update;
        return;
      }

      if (!isValidCron(interval.cron)) {
        this.error(`[ERROR] startJobs(update): Auto update will be disabled. Invalid cron value specified in settings: '${interval.cron}'`);
        delete variableMgmt.jobs.update;
        try {
          await triggerSynchronizationError({ app: this, variableMgmt, calendar: 'cron syntax', error: `Invalid cron value specified in settings: '${interval.cron}'` });
        } catch (err) {
          this.error('[ERROR] startJobs(update): Failed to complete triggerSynchronizationError(...):', err);
        }
        interval.error = `Invalid cron value specified in settings: '${interval.cron}'`;
        this.homey.settings.set(variableMgmt.setting.syncInterval, interval);
        return;
      }

      if (interval.error) {
        delete interval.error;
        this.homey.settings.set(variableMgmt.setting.syncInterval, interval);
        this.log('startJobs: Previous cron syntax error removed from settings since cron value is now valid');
      }

      variableMgmt.jobs.update = addJob(interval.cron, updateFunc);
      if (!variableMgmt.jobs.update) {
        this.error('[ERROR] startJobs: Failed to create update job!');
        return;
      }
      this.log(`startJobs(update): Auto update enabled with cron value '${interval.cron}'. Next update in UTC: ${variableMgmt.jobs.update.nextRun()}`);
    }
  }

  /**
   * onUninit method is called when your app is destroyed
   */
  async onUninit (): Promise<void> {
    if (typeof this._unload !== 'function') {
      this.log('[WARN] onUninit -- this._unload is not a function');
      return;
    }

    this.log('onUninit -- calling this._unload');
    this._unload('onUninit');
  }

  _unload (name: string): void {
    if (!variableMgmt?.jobs || Object.keys(variableMgmt.jobs).length === 0) {
      return;
    }

    this._unloadCronJobs(name);

    variableMgmt = null;
  }
  
  _unloadCronJobs (name: string): void {
    if (!variableMgmt) {
      return;
    }

    if (variableMgmt.jobs.trigger) {
      this.log(`${name}: Job 'trigger' will be stopped`);
      variableMgmt.jobs.trigger.stop();
    }

    if (variableMgmt.jobs.update) {
      this.log(`${name}: Job 'update' will be stopped`);
      variableMgmt.jobs.update.stop();
    }
    
    variableMgmt.jobs = {};
  }
}

module.exports = IcalCalendar
