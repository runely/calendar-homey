'use strict';

const Homey = require('homey');

module.exports = async (app) => {
    // register action flow cards
    const registerActionFlowCards = async () => {
        new Homey.FlowCardAction('sync-calendar')
            .register()
            .registerRunListener((args, state) => {
                return Promise.resolve(app.getEvents());
            });
    }

    await registerActionFlowCards();
}