'use strict';

const pkg = require('../app.json');
const pkgName = pkg.name.en;
const pkgVersion = pkg.version;
const sentryDsn = pkg.sentry.dsn;
const sentryTraceSampleRate = pkg.sentry.traceSampleRate;
const sentryEnv = pkg.sentry.environment;

const sentry = require('@sentry/node');
const tracing = require('@sentry/tracing');

const init = (Homey) => {
    sentry.init({
        dsn: sentryDsn,
        release: `${pkgName}@${pkgVersion}`,
        // We recommend adjusting this value in production, or using tracesSampler for finer control
        tracesSampleRate: sentryTraceSampleRate,
        environment: sentryEnv
    });

    if (Homey) {
        // additional tags
        if (Homey.version) sentry.setTag('firmware', Homey.version);
        if (Homey.ManagerI18n._language) sentry.setTag('language', Homey.ManagerI18n._language);

        // add Homey id
        Homey.ManagerCloud.getHomeyId()
            .then(homeyId => sentry.setUser({ id: homeyId }))
            .catch(err => console.error("Failed to get Homey ID:", err));
    }
}

const startTransaction = (op = 'transactionRun', name = pkgName) => {
    return sentry.startTransaction({
        op,
        name
    });
}

module.exports.sentry = sentry;
module.exports.init = init;
module.exports.startTransaction = startTransaction;
