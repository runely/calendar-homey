'use strict'

const { Device } = require('homey')
const { moment } = require('../../lib/moment-datetime')
const varMgmt = require('../../lib/variable-management')

const calendarsCount = 'meter_calendars_count_ical'
const eventCountPerCalendar = 'meter_event_count_calendar_ical'
const lastSuccessfullSync = 'last_successfull_sync_ical'
const totalEventCount = 'meter_total_event_count_ical'

class MyDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit () {
    // convenience function for getting current timezone
    this.getTimezone = () => this.homey.clock.getTimezone()

    // convenience function for logging warnings
    this.warn = (...args) => this.log('[WARN]', ...args)

    this.log(`Device v${this.homey.manifest.version} is running on firmware ${this.homey.version} with Timezone: '${this.getTimezone()}'`)

    // register variableMgmt to this app class
    this.variableMgmt = varMgmt

    // fill sensors with initial data
    await this.updateCalendarsCount()
    await this.updateCalendarsMetadata()

    this.intervalHandle = this.homey.setInterval(async () => {
      // update sensors with new data every 5 minutes
      await this.updateCalendarsCount()
      await this.updateCalendarsMetadata()
    }, 300000)

    this.homey.on('unload', () => {
      this.log('MyDevice has been unloaded')

      this.homey.clearInterval(this.intervalHandle)
    })
  }

  async onUninit () {
    this.log('MyDevice has been uninited')

    this.homey.clearInterval(this.intervalHandle)
  }

  async updateCalendarsCount () {
    const calendarsConfigured = this.homey.settings.get(this.variableMgmt.setting.icalUris)
    if (Array.isArray(calendarsConfigured)) {
      if (this.hasCapability(calendarsCount)) {
        await this.updateCapabilityValue(calendarsCount, calendarsConfigured.length)
      } else this.warn('updateCalendarsCount -', calendarsCount, 'capability doesnt exist yet....')

      for await (const calendar of calendarsConfigured) {
        const lastSuccessfullSyncLoop = `${lastSuccessfullSync}.${calendar.name}`
        const eventCountPerCalendarLoop = `${eventCountPerCalendar}.${calendar.name}`
        if (!this.hasCapability(lastSuccessfullSyncLoop)) {
          await this.newCapability(lastSuccessfullSyncLoop, `${this.homey.__('device.lastSuccessfullSync')} ${calendar.name}`)
        }
        if (!this.hasCapability(eventCountPerCalendarLoop)) {
          await this.newCapability(eventCountPerCalendarLoop, `${this.homey.__('device.eventCountCalendar')} ${calendar.name}`)
        }
      }
    } else {
      this.warn('updateCalendarsCount - No calendars configured yet')
    }
  }

  async updateCalendarsMetadata () {
    const calendarsMetadataStr = this.homey.settings.get(this.variableMgmt.storage.calendarsMetadata)
    const calendarsMetadata = calendarsMetadataStr ? JSON.parse(calendarsMetadataStr) : undefined

    if (!Array.isArray(calendarsMetadata)) {
      this.warn('updateCalendarsMetadata - Calendar meta data not configured yet')
      return
    }

    calendarsMetadata.forEach(async (calendar) => {
      const lastSuccessfullSyncLoop = `${lastSuccessfullSync}.${calendar.name}`
      const eventCountPerCalendarLoop = `${eventCountPerCalendar}.${calendar.name}`
      if (this.hasCapability(eventCountPerCalendarLoop)) {
        await this.updateCapabilityValue(eventCountPerCalendarLoop, calendar.eventCount)
      } else this.warn('updateCalendarsMetadata -', eventCountPerCalendarLoop, 'capability doesnt exist yet....')

      if (this.hasCapability(lastSuccessfullSyncLoop)) {
        await this.updateCapabilityValue(lastSuccessfullSyncLoop, moment({ timezone: this.getTimezone(), date: new Date(calendar.lastSuccessfullSync || '01.01.1970 00:00:00') }).format('DD.MM.YYYY HH:mm:ss'))
      } else this.warn('updateCalendarsMetadata -', lastSuccessfullSyncLoop, 'capability doesnt exist yet....')
    })

    if (this.hasCapability(totalEventCount)) {
      const eventCount = calendarsMetadata.reduce((prev, acc) => {
        prev += acc.eventCount
        return prev
      }, 0)
      await this.updateCapabilityValue(totalEventCount, eventCount)
    } else this.warn('updateCalendarsMetadata -', totalEventCount, 'capability doesnt exist yet....')
  }

  async updateCapabilityValue (id, value) {
    try {
      await this.setCapabilityValue(id, value)
    } catch {
      this.error('setCapabilityValue - Failed to set', id, 'to', value)
    }
  }

  async newCapability (id, title) {
    try {
      await this.addCapability(id)
      await this.setCapabilityOptions(id, { title })
      this.log('newCapability -', id, 'has been added')
    } catch {
      this.error('newCapability - Failed to add', id, 'and/or set title to', title)
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded () {
    this.log('MyDevice has been added')
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings ({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed')
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed (name) {
    this.log('MyDevice was renamed')
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted () {
    this.log('MyDevice has been deleted')

    this.homey.clearInterval(this.intervalHandle)
  }
}

module.exports = MyDevice
