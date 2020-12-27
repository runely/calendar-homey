'use strict';

const Homey = require('homey');

const logger = require('../lib/logger');

module.exports = async (app) => {
    // register action flow cards
    const registerActionFlowCards = async () => {
        new Homey.FlowCardAction('sync-calendar')
            .register()
            .registerRunListener(async (args, state) => {
                let getEventsFinished = await app.getEvents();
                return Promise.resolve(getEventsFinished);
            });
    }

    await registerActionFlowCards();
}