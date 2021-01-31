'use strict'

const Homey = require('homey')

module.exports = async app => {
  // register action flow cards
  const registerActionFlowCards = async () => {
    new Homey.FlowCardAction('sync-calendar')
      .register()
      .registerRunListener(async (args, state) => {
        app.log(`sync-calendar: Action card triggered. ${app.isGettingEvents ? 'getEvents already running' : 'Triggering getEvents without reregistering of tokens'}`)
        const getEventsFinished = app.isGettingEvents ? false : await app.getEvents()
        return Promise.resolve(getEventsFinished)
      })
  }

  await registerActionFlowCards()
}
