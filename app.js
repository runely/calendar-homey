'use strict'

const Homey = require('homey')
const ical = require('node-ical')
const { Blob } = require('node:buffer')

const varMgmt = require('./lib/variable-management')
const getDateTimeFormat = require('./lib/get-datetime-format')
const hasData = require('./lib/has-data')
const getActiveEvents = require('./lib/get-active-events')
const getFallbackUri = require('./lib/get-fallback-uri')
const filterUpdatedCalendars = require('./lib/filter-updated-calendars')
const getEventUids = require('./lib/get-event-uids')
const getNewEvents = require('./lib/get-new-events')
const { getLocalActiveEvents, saveLocalEvents } = require('./lib/local-events')
const sortCalendarsEvents = require('./lib/sort-calendars')
const { generateTokens, generatePerCalendarTokens, generateNextEventTokens } = require('./lib/generate-token-configuration')

const { triggerChangedCalendars, triggerEvents, triggerSynchronizationError } = require('./handlers/trigger-cards')
const setupTriggers = require('./handlers/setup-triggers')
const setupFlowTokens = require('./handlers/setup-flow-tokens')
const { setupConditions } = require('./handlers/setup-conditions')
const setupActions = require('./handlers/setup-actions')
const { updateTokens } = require('./handlers/update-tokens')
const { addJob } = require('./handlers/cron')
const { moment } = require('./lib/moment-datetime')

class IcalCalendar extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit () {
    // convenience function for getting current timezone
    this.getTimezone = () => this.homey.clock.getTimezone()

    // convenience functions for logging
    this.warn = (...args) => this.log('[WARN]', ...args)
    this.logError = (...args) => {
      this.error('[ERROR]', ...args)
    }

    this.log(`${Homey.manifest.name.en} v${Homey.manifest.version} is running on firmware ${this.homey.version} with Timezone: '${this.getTimezone()}'`)

    // set a variable to control if getEvents is already running
    this.isGettingEvents = false

    // register variableMgmt to this app class
    this.variableMgmt = varMgmt

    // get date and time format as an object
    this.variableMgmt.dateTimeFormat = getDateTimeFormat(this)

    // setup triggers
    setupTriggers(this)

    // setup flow tokens
    await setupFlowTokens(this)

    // setup conditions
    setupConditions({ timezone: this.getTimezone(), app: this })

    // setup actions
    setupActions(this)

    // get ical events
    this.log('onInit: Triggering getEvents and reregistering tokens')
    this.getEvents(true)

    // register callback when settings has been set
    this.homey.settings.on('set', (args) => {
      if (args && [this.variableMgmt.setting.icalUris, this.variableMgmt.setting.eventLimit, this.variableMgmt.setting.nextEventTokensPerCalendar].includes(args)) {
        // sync calendars when calendar specific settings have been changed
        if (!this.isGettingEvents) {
          this.log(`onInit/${args}: Triggering getEvents and reregistering tokens`)
          this.getEvents(true)
        } else {
          this.log(`onInit/${args}: "getEvents" is currently running. Updated settings won't be applied until the next 15th minute!`)
        }
      } else if (args && [this.variableMgmt.setting.dateFormatLong, this.variableMgmt.setting.dateFormatShort, this.variableMgmt.setting.timeFormat].includes(args)) {
        // get new date/time format
        this.variableMgmt.dateTimeFormat = getDateTimeFormat(this)
      }
    })

    this._unload = () => {
      this.variableMgmt = null

      if (!this.jobs) return

      // unload cron jobs
      Object.getOwnPropertyNames(this.jobs).forEach((prop) => {
        if (typeof this.jobs[prop].stop === 'function') {
          this.log('onInit/_unload: Job', prop, 'will be stopped')
          this.jobs[prop].stop()
        }
      })
    }

    this.homey.on('unload', () => {
      if (typeof this._unload === 'function') {
        this.log('unload -- calling this._unload')
        this._unload()
      } else this.warn('unload -- this._unload is not a function')
    })

    // register cron jobs
    this.startJobs()
  }

  getWorkTime (start, end) {
    const seconds = (end - start) / 1000
    if (seconds > 60) return `${seconds / 60} minutes`
    return `${seconds} seconds`
  }

  async getEvents (reregisterCalendarTokens = false) {
    this.isGettingEvents = true

    // errors to return
    const errors = []
    // get URI from settings
    const calendars = this.homey.settings.get(this.variableMgmt.setting.icalUris)

    // calendars not entered in settings page yet
    if (!calendars) {
      this.warn('getEvents: Calendars has not been set in Settings yet')
      this.isGettingEvents = false
      this.gettingEventsLastRun = new Date()
      return
    }

    // is debug logAllEvents activated
    const logAllEvents = this.homey.settings.get(this.variableMgmt.setting.logAllEvents) ?? false
    // get event limit from settings or use the default
    const eventLimit = this.homey.settings.get(this.variableMgmt.setting.eventLimit) || this.variableMgmt.setting.eventLimitDefault
    const oldCalendarsUidsStorage = this.homey.settings.get(this.variableMgmt.storage.eventUids)
    const oldCalendarsUids = hasData(oldCalendarsUidsStorage) ? JSON.parse(oldCalendarsUidsStorage) : []
    this.log('getEvents: oldCalendarsUids --', oldCalendarsUids.length)
    const calendarsEvents = []
    const calendarsMetadata = []

    // get ical events
    this.log(`getEvents: Getting ${calendars.length} calendars in timezone '${this.getTimezone()}'`)
    if (logAllEvents) this.log('getEvents: Debug - logAllEvents active')
    const retrieveCalendarsStart = new Date()

    for (let i = 0; i < calendars.length; i++) {
      const { name } = calendars[i]
      let { uri } = calendars[i]
      if (uri === '') {
        this.warn(`getEvents: Calendar '${name}' has empty uri. Skipping...`)
        continue
      } else if (!/(http|https|webcal):\/\/.+/gi.exec(uri)) {
        this.warn(`getEvents: Uri for calendar '${name}' is invalid. Skipping...`)
        calendars[i] = { name, uri, failed: `Uri for calendar '${name}' is invalid. Missing "http://", "https://" or "webcal://"` }
        errors.push(calendars[i].failed)
        this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
        this.warn(`getEvents: Added 'error' setting value to calendar '${name}' : ${calendars[i].failed}`)
        await triggerSynchronizationError({ app: this, calendar: name, error: calendars[i].failed })
        continue
      }

      if (/webcal:\/\//gi.exec(uri)) {
        uri = uri.replace(/webcal:\/\//gi, 'https://')
        this.log(`getEvents: Calendar '${name}': webcal:// found and replaced with https://`)
        calendars[i] = { name, uri }
        this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
      }

      this.log(`getEvents: Getting events (${eventLimit.value} ${eventLimit.type} ahead) for calendar`, name, uri)
      const retrieveCalendarStart = new Date()

      let data
      try {
        data = await ical.fromURL(uri)
      } catch (error) {
        const { fallbackUri } = getFallbackUri(this, uri)
        const errorString = typeof error === 'object' ? error.message : error
        this.logError(`getEvents: Failed to get events for calendar '${name}' with uri '${uri}' :`, error)
        try {
          this.warn(`getEvents: Getting events (${eventLimit.value} ${eventLimit.type} ahead) for calendar`, name, 'with fallback uri', fallbackUri)
          data = await ical.fromURL(uri)
        } catch (innerError) {
          const fallbackErrorString = typeof innerError === 'object' ? innerError.message : innerError
          this.logError(`getEvents: Failed to get events for calendar '${name}' with fallback uri '${fallbackUri}' :`, innerError)

          errors.push(`Failed to get events for calendar '${name}' with uri '${uri}' (${errorString}) and '${fallbackUri}' (${fallbackErrorString})`)
          await triggerSynchronizationError({ app: this, calendar: name, error: innerError })
          calendarsMetadata.push({ name, eventCount: 0, lastFailedSync: moment({ timezone: this.getTimezone() }) })

          // set a failed setting value to show a error message on settings page
          calendars[i] = { name, uri, failed: fallbackErrorString }
          this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
          this.warn(`getEvents: Added 'error' setting value to calendar '${name}'`)
        }
      }

      if (typeof data === 'object') {
        // remove failed setting if it exists for calendar
        if (calendars[i].failed) {
          calendars[i] = { name, uri }
          this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
          this.log(`getEvents: Removed 'error' setting value from calendar '${name}'`)
        }

        const retrieveCalendarEnd = new Date()
        try {
          const totalEventsSize = new Blob([JSON.stringify(data)]).size / 1000
          this.log(`getEvents: Events for calendar '${name}' retrieved. Total event count for calendar: ${Object.keys(data).length}. Total event size for calendar: ${totalEventsSize}KB. Time used: ${this.getWorkTime(retrieveCalendarStart, retrieveCalendarEnd)}`)
          let activeEvents = getActiveEvents({ timezone: this.getTimezone(), data, eventLimit, calendarName: name, app: this, logAllEvents })
          const activeEventsSize = new Blob([JSON.stringify(activeEvents)]).size / 1000
          this.log(`getEvents: Active events for calendar '${name}' updated. Event count: ${activeEvents.length}. Event size: ${activeEventsSize}KB. Time used: ${this.getWorkTime(retrieveCalendarEnd, new Date())}`)
          calendarsEvents.push({ name, events: activeEvents })
          calendarsMetadata.push({ name, eventCount: activeEvents.length, lastSuccessfullSync: moment({ timezone: this.getTimezone() }) })
          activeEvents = null
        } catch (error) {
          const errorString = typeof error === 'object' ? error.message : error
          this.logError(`getEvents: Failed to get active events for calendar '${name}'. Time used: ${this.getWorkTime(retrieveCalendarEnd, new Date())} :`, error)
          errors.push(`Failed to get active events for calendar '${name}' : ${errorString})`)
          await triggerSynchronizationError({ app: this, calendar: name, error })
          calendarsMetadata.push({ name, eventCount: 0, lastFailedSync: moment({ timezone: this.getTimezone() }) })

          // set a failed setting value to show a error message on settings page
          calendars[i] = { name, uri, failed: errorString }
          this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
          this.warn(`getEvents: Added 'error' setting value to calendar '${name}'`)
        }
      } else {
        this.warn(`getEvents: Calendar '${name}' not reachable! Giving up... Time used: ${this.getWorkTime(retrieveCalendarStart, new Date())}`)
      }

      data = null
    }

    try {
      if (this.variableMgmt.calendars && this.variableMgmt.calendars.length > 0 && calendarsEvents.length > 0) {
        const updatedCalendars = filterUpdatedCalendars({ app: this, oldCalendars: this.variableMgmt.calendars, newCalendars: calendarsEvents })
        await triggerChangedCalendars({ app: this, calendars: updatedCalendars })
      }
    } catch (error) {
      const errorString = typeof error === 'object' ? error.message : error
      this.logError('getEvents: Failed to filter/trigger changed calendars', errorString)
      await triggerSynchronizationError({ app: this, calendar: 'Changed calendars', error })
    }

    const newCalendarsUids = getEventUids(calendarsEvents)
    this.log('getEvents: newCalendarsUids --', newCalendarsUids.length)
    const newlyAddedEvents = getNewEvents({ timezone: this.getTimezone(), oldCalendarsUids, newCalendarsUids, calendarsEvents, app: this })
    this.log('getEvents: newlyAddedEvents --', newlyAddedEvents.length)
    for await (const event of newlyAddedEvents) {
      await triggerEvents({ timezone: this.getTimezone(), app: this, event: { calendarName: event.calendarName, event, triggerId: 'event_added' } })
      await triggerEvents({ timezone: this.getTimezone(), app: this, event: { calendarName: event.calendarName, event, triggerId: 'event_added_calendar', state: { calendarName: event.calendarName } } })
    }
    this.homey.settings.set(this.variableMgmt.storage.eventUids, JSON.stringify(newCalendarsUids))

    // get local events (only the ones that are not started yet or is ongoing)
    const localEventsJSON = this.homey.settings.get(this.variableMgmt.storage.localEvents)
    const localEvents = localEventsJSON ? JSON.parse(localEventsJSON) : []
    this.variableMgmt.localEvents = getLocalActiveEvents({ app: this, eventLimit, events: localEvents, timezone: this.getTimezone(), logAllEvents })

    // save local events returned
    saveLocalEvents(this, this.variableMgmt.localEvents)

    // add local events to the correct calendar
    this.variableMgmt.localEvents.forEach((event) => {
      const calendar = calendarsEvents.find((c) => c.name === event.calendar)
      if (calendar) {
        calendar.events.push(event)
      }
    })

    this.variableMgmt.calendars = calendarsEvents
    sortCalendarsEvents(this.variableMgmt.calendars)
    const allEventSize = new Blob([JSON.stringify(this.variableMgmt.calendars)]).size / 1000
    const allEventCount = this.variableMgmt.calendars.reduce((curr, acu) => {
      curr += acu.events.length
      return curr
    }, 0)
    this.log(`getEvents: All events count: ${allEventCount}. All event size: ${allEventSize}KB. Time used: ${this.getWorkTime(retrieveCalendarsStart, new Date())}`)
    this.homey.settings.set(this.variableMgmt.storage.calendarsMetadata, JSON.stringify(calendarsMetadata))

    if (reregisterCalendarTokens) {
      // unregister calendar tokens
      if (this.variableMgmt.calendarTokens.length > 0) {
        this.log('getEvents: Calendar tokens starting to flush')
        await Promise.all(this.variableMgmt.calendarTokens.map(async (tokenId) => {
          try {
            const token = this.homey.flow.getToken(tokenId)
            if (token) {
              this.log(`getEvents: Calendar token '${token.id}' starting to flush`)
              return token.unregister()
            } else {
              this.warn(`getEvents: Calendar token '${tokenId}' not found`)
              return Promise.resolve()
            }
          } catch (ex) {
            this.logError(`getEvents: Failed to get calendar token '${tokenId}'`, ex)
          }
        }))
        this.variableMgmt.calendarTokens = []
        this.log('getEvents: Calendar tokens flushed')
      }

      // unregister next event with tokens
      if (Array.isArray(this.variableMgmt.nextEventWithTokens) && this.variableMgmt.nextEventWithTokens.length > 0) {
        this.log('getEvents: Next event with tokens starting to flush')
        await Promise.all(this.variableMgmt.nextEventWithTokens.map(async (tokenId) => {
          try {
            const token = this.homey.flow.getToken(tokenId)
            if (token) {
              this.log(`getEvents: Next event with token '${tokenId}' starting to flush`)
              return token.unregister()
            } else {
              this.warn(`getEvents: Next event with token '${tokenId}' not found`)
              return Promise.resolve()
            }
          } catch (ex) {
            this.logError(`getEvents: Failed to get next event with token '${tokenId}'`, ex)
          }
        }))
        this.variableMgmt.nextEventWithTokens = []
        this.log('getEvents: Next event with tokens flushed')
      }

      // get settings for adding extra tokens
      const nextEventTokensPerCalendar = this.homey.settings.get(this.variableMgmt.setting.nextEventTokensPerCalendar)

      // register calendar tokens
      if (this.variableMgmt.calendars.length > 0) {
        await Promise.all(this.variableMgmt.calendars.map(async (calendar) => {
          // register todays and tomorrows events pr calendar
          generateTokens({ app: this, variableMgmt: this.variableMgmt, calendarName: calendar.name }).map(async ({ id, type, title }) => {
            try {
              const token = await this.homey.flow.createToken(id, { type, title })
              if (token) {
                this.variableMgmt.calendarTokens.push(id)
                this.log(`getEvents: Created calendar token '${id}'`)
              } else {
                this.warn(`getEvents: Calendar token '${id}' not created`)
              }
            } catch (ex) {
              this.logError(`getEvents: Failed to create calendar token '${id}'`, ex)
            }
            return Promise.resolve()
          })

          // register next event title, next event start, next event start time, next event end date and next event end time pr calendar
          if (nextEventTokensPerCalendar) {
            generatePerCalendarTokens({ app: this, variableMgmt: this.variableMgmt, calendarName: calendar.name }).map(async ({ id, type, title }) => {
              try {
                const token = await this.homey.flow.createToken(id, { type, title })
                if (token) {
                  this.variableMgmt.calendarTokens.push(id)
                  this.log(`getEvents: Created per calendar token '${id}'`)
                } else {
                  this.warn(`getEvents: Per calendar token '${id}' not created`)
                }
              } catch (ex) {
                this.logError(`getEvents: Failed to create per calendar token '${id}'`, ex)
              }
              return Promise.resolve()
            })
          }
        }))

        // register next event with text tokens
        this.variableMgmt.nextEventWithTokens = []
        for await (const { id, type, title } of generateNextEventTokens({ app: this, variableMgmt: this.variableMgmt })) {
          try {
            const token = await this.homey.flow.createToken(id, { type, title })
            if (token) {
              this.variableMgmt.nextEventWithTokens.push(id)
              this.log(`getEvents: Created next event with token '${id}'`)
            } else {
              this.warn(`getEvents: Failed to create next event with token '${id}'`)
            }
          } catch (ex) {
            this.logError(`getEvents: Failed to create next event with token '${id}'`, ex)
          }
        }
      }
    }

    this.isGettingEvents = false
    this.gettingEventsLastRun = new Date()

    if (errors.length > 0) return errors
  }

  startJobs () {
    this.jobs = {
      // calendar update every 15th minute
      update: addJob('5 */15 * * * *', () => {
        if (this.isGettingEvents) {
          this.warn('startJobs/update: Wont update calendars from this job since getEvents is already running')
          return
        } else if (this.gettingEventsLastRun && ((new Date() - this.gettingEventsLastRun) / 1000 / 60) < 5) {
          this.warn('startJobs/update: Wont update calendars from this job since there\'s less than 5 minutes since getEvents was last executed:', this.gettingEventsLastRun)
          return
        }

        this.log('startJobs/update: Updating calendars without reregistering tokens')
        this.getEvents()
      }),
      // trigger events every 1th minute
      trigger: addJob('*/1 * * * *', async () => {
        if (this.isGettingEvents) {
          this.warn('startJobs/trigger: Wont trigger events and update tokens since getEvents is running. Will trigger in one minute')
          return
        }

        if (this.variableMgmt.calendars && this.variableMgmt.calendars.length > 0) {
          this.log('startJobs/trigger: Triggering events and updating tokens')
          await triggerEvents({ timezone: this.getTimezone(), app: this })
          await updateTokens({ timezone: this.getTimezone(), app: this })
        } else if (this.variableMgmt.calendars && this.variableMgmt.calendars.length === 0) this.warn('startJobs/trigger: Wont trigger events and update tokens since theres no calendars. Calendars:', this.variableMgmt.calendars)
      })
    }
  }

  /**
   * onUninit method is called when your app is destroyed
   */
  async onUninit () {
    if (typeof this._unload === 'function') {
      this.log('onUninit -- calling this._unload')
      this._unload()
    } else this.warn('onUninit -- this._unload is not a function')
  }
}

module.exports = IcalCalendar
