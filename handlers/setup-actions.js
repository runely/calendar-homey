'use strict'

module.exports = app => {
  // register run listener on action flow cards
  app.homey.flow.getActionCard('sync-calendar').registerRunListener(async (args, state) => {
    app.log(`sync-calendar: Action card triggered. ${app.isGettingEvents ? 'getEvents already running' : 'Triggering getEvents without reregistering tokens'}`)
    const getEventsFinished = app.isGettingEvents ? true : await app.getEvents()
    return Promise.resolve(getEventsFinished)
  })
}
