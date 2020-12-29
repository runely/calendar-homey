'use strict';

const Homey = require('homey');

const logger = require('../lib/logger');

module.exports = async (app) => {
    // register action flow cards
    const registerActionFlowCards = async () => {
        new Homey.FlowCardAction('sync-calendar')
            .register()
            .registerRunListener(async (args, state) => {
                logger.info(app, 'sync-calendar: Action card triggered');
                let getEventsFinished;
                if (!app.isGettingEvents) {
					getEventsFinished = await app.getEvents();
                }
                else getEventsFinished = false;
                
                return Promise.resolve(getEventsFinished);
            });
    }

    await registerActionFlowCards();
}