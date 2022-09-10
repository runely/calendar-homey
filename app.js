'use strict'

const Homey = require('homey')

const varMgmt = require('./lib/variable-management')
const getDateTimeFormat = require('./lib/get-datetime-format')
const hasData = require('./lib/has-data')
const getContent = require('./lib/get-ical-content')
const getActiveEvents = require('./lib/get-active-events')
const filterUpdatedCalendars = require('./lib/filter-updated-calendars')
const { triggerChangedCalendars, triggerEvents, triggerSynchronizationError } = require('./handlers/trigger-cards')
const getEventUids = require('./lib/get-event-uids')
const getNewEvents = require('./lib/get-new-events')
const sortCalendarsEvents = require('./lib/sort-calendars')
const { generateTokens, generatePerCalendarTokens, generateNextEventTokens } = require('./lib/generate-token-configuration')

const setupTriggers = require('./handlers/setup-triggers')
const setupFlowTokens = require('./handlers/setup-flow-tokens')
const setupConditions = require('./handlers/setup-conditions')
const setupActions = require('./handlers/setup-actions')
const { updateTokens } = require('./handlers/update-tokens')
const { addJob } = require('./handlers/cron')

class IcalCalendar extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit () {
    // convenience function for getting current timezone
    this.getTimezone = () => this.homey.clock.getTimezone()

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
    await this.getEvents(true)

    // register callback when settings has been set
    this.homey.settings.on('set', args => {
      if (args && [this.variableMgmt.setting.icalUris, this.variableMgmt.setting.eventLimit, this.variableMgmt.setting.nextEventTokensPerCalendar].includes(args)) {
        // sync calendars when calendar specific settings have been changed
        if (!this.isGettingEvents) {
          this.log(`onInit/${args}: Triggering getEvents and reregistering tokens`)
          this.getEvents(true)
        }
      } else if (args && [this.variableMgmt.setting.dateFormatLong, this.variableMgmt.setting.dateFormatShort, this.variableMgmt.setting.timeFormat].includes(args)) {
        // get new date/time format
        this.variableMgmt.dateTimeFormat = getDateTimeFormat(this)
      }
    })

    this.homey.on('unload', () => {
      if (!this.jobs) return

      Object.getOwnPropertyNames(this.jobs).forEach(prop => {
        if (typeof this.jobs[prop].stop === 'function') {
          this.log('onInit/unload: Job', prop, 'will be stopped')
          this.jobs[prop].stop()
        }
      })
    })

    // register cron jobs
    this.startJobs()
  }

  async getEvents (reregisterCalendarTokens = false) {
    this.isGettingEvents = true

    // errors to return
    const errors = []
    // get URI from settings
    const calendars = this.homey.settings.get(this.variableMgmt.setting.icalUris)
    // get event limit from settings or use the default
    const eventLimit = this.homey.settings.get(this.variableMgmt.setting.eventLimit) || this.variableMgmt.setting.eventLimitDefault
    const oldCalendarsUidsStorage = this.homey.settings.get(this.variableMgmt.storage.eventUids)
    const oldCalendarsUids = hasData(oldCalendarsUidsStorage) ? JSON.parse(oldCalendarsUidsStorage) : []
    this.log('getEvents: oldCalendarsUids --', oldCalendarsUids.length)
    const calendarsEvents = []

    // calendars not entered in settings page yet
    if (!calendars) {
      this.log('getEvents: Calendars has not been set in Settings yet')
      this.isGettingEvents = false
      return
    }

    // get ical events
    this.log(`getEvents: Getting ${calendars.length} calendars in timezone '${this.getTimezone()}'`)
    for (let i = 0; i < calendars.length; i++) {
      const { name } = calendars[i]
      let { uri } = calendars[i]
      if (uri === '') {
        this.log(`getEvents: Calendar '${name}' has empty uri. Skipping...`)
        continue
      } else if (!/(http|https|webcal):\/\/.+/gi.exec(uri)) {
        this.log(`getEvents: Uri for calendar '${name}' is invalid. Skipping...`)
        calendars[i] = { name, uri, failed: `Uri for calendar '${name}' is invalid. Missing "http://", "https://" or "webcal://"` }
        errors.push(calendars[i].failed)
        this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
        this.log(`getEvents: Added 'error' setting value to calendar '${name}'`)
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

      try {
        const data = await getContent(uri)
        // remove failed setting if it exists for calendar
        if (calendars[i].failed) {
          calendars[i] = { name, uri }
          this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
          this.log(`getEvents: Removed 'error' setting value from calendar '${name}'`)
        }

        const activeEvents = getActiveEvents({ timezone: this.getTimezone(), data, eventLimit, calendarName: name, app: this })
        this.log(`getEvents: Events for calendar '${name}' updated. Event count: ${activeEvents.length}`)
        calendarsEvents.push({ name, events: activeEvents })
      } catch (error) {
        const errorString = typeof error === 'object' ? error.message : error

        this.log('getEvents: Failed to get events for calendar', name, uri, errorString)
        errors.push(`Failed to get events for calendar '${name}' with uri '${uri}' : ${errorString}`)
        await triggerSynchronizationError({ app: this, calendar: name, error })

        // set a failed setting value to show a error message on settings page
        calendars[i] = { name, uri, failed: errorString }
        this.homey.settings.set(this.variableMgmt.setting.icalUris, calendars)
        this.log(`getEvents: Added 'error' setting value calendar '${name}'`)
      }
    }

    if (this.variableMgmt.calendars && this.variableMgmt.calendars.length > 0 && calendarsEvents.length > 0) {
      const updatedCalendars = filterUpdatedCalendars({ app: this, oldCalendars: this.variableMgmt.calendars, newCalendars: calendarsEvents })
      await triggerChangedCalendars({ app: this, calendars: updatedCalendars })
    }

    const newCalendarsUids = getEventUids(calendarsEvents)
    this.log('getEvents: newCalendarsUids --', newCalendarsUids.length)
    const newlyAddedEvents = getNewEvents({ timezone: this.getTimezone(), oldCalendarsUids, newCalendarsUids, calendarsEvents, app: this })
    this.log('getEvents: newlyAddedEvents --', newlyAddedEvents.length)
    for await (const event of newlyAddedEvents) {
      await triggerEvents({ timezone: this.getTimezone(), app: this, event: { calendarName: event.calendarName, event, triggerId: 'event_added' } })
    }
    this.homey.settings.set(this.variableMgmt.storage.eventUids, JSON.stringify(newCalendarsUids))

    this.variableMgmt.calendars = calendarsEvents
    sortCalendarsEvents(this.variableMgmt.calendars)

    if (reregisterCalendarTokens) {
      // unregister calendar tokens
      if (this.variableMgmt.calendarTokens.length > 0) {
        this.log('getEvents: Calendar tokens starting to flush')
        await Promise.all(this.variableMgmt.calendarTokens.map(async token => {
          this.log(`getEvents: Calendar token '${token.id}' starting to flush`)
          return token.unregister()
        }))
        this.variableMgmt.calendarTokens = []
        this.log('getEvents: Calendar tokens flushed')
      }

      // unregister next event with tokens
      if (Array.isArray(this.variableMgmt.nextEventWithTokens) && this.variableMgmt.nextEventWithTokens.length > 0) {
        this.log('getEvents: Next event with tokens starting to flush')
        await Promise.all(this.variableMgmt.nextEventWithTokens.map(async token => {
          this.log(`getEvents: Next event with token '${token.id}' starting to flush`)
          return token.unregister()
        }))
        this.variableMgmt.nextEventWithTokens = []
        this.log('getEvents: Next event with tokens flushed')
      }

      // get settings for adding extra tokens
      const nextEventTokensPerCalendar = this.homey.settings.get(this.variableMgmt.setting.nextEventTokensPerCalendar)

      // register calendar tokens
      if (this.variableMgmt.calendars.length > 0) {
        await Promise.all(this.variableMgmt.calendars.map(async calendar => {
          // register todays and tomorrows events pr calendar
          generateTokens({ app: this, variableMgmt: this.variableMgmt, calendarName: calendar.name }).map(async ({ id, type, title }) => {
            this.variableMgmt.calendarTokens.push(await this.homey.flow.createToken(id, { type, title }))
            this.log(`getEvents: Created calendar token '${id}'`)
          })

          // register next event title, next event start, next event start time, next event end date and next event end time pr calendar
          if (nextEventTokensPerCalendar) {
            generatePerCalendarTokens({ app: this, variableMgmt: this.variableMgmt, calendarName: calendar.name }).map(async ({ id, type, title }) => {
              this.variableMgmt.calendarTokens.push(await this.homey.flow.createToken(id, { type, title }))
              this.log(`getEvents: Created per calendar token '${id}'`)
            })
          }
        }))

        // register next event with text tokens
        this.variableMgmt.nextEventWithTokens = []
        for await (const { id, type, title } of generateNextEventTokens({ app: this, variableMgmt: this.variableMgmt })) {
          this.variableMgmt.nextEventWithTokens.push(await this.homey.flow.createToken(id, { type, title }))
          this.log(`getEvents: Created next event with token '${id}'`)
        }
      }
    }

    this.isGettingEvents = false

    if (errors.length > 0) return errors
  }

  startJobs () {
    this.jobs = {
      // calendar update every 15th minute
      update: addJob('*/15 * * * *', () => {
        if (this.isGettingEvents) return

        this.log('startJobs/update: Updating calendars without reregistering tokens')
        this.getEvents()
      }),
      // trigger events every 1th minute
      trigger: addJob('*/1 * * * *', () => {
        if (this.variableMgmt.calendars && this.variableMgmt.calendars.length > 0) {
          this.log('startJobs/trigger: Triggering events and updating tokens')
          triggerEvents({ timezone: this.getTimezone(), app: this })
          updateTokens({ timezone: this.getTimezone(), app: this })
        }
      })
    }
  }
}

module.exports = IcalCalendar
