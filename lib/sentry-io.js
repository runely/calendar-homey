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

        // additional extra information
        if (Homey.ManagerSettings._settings.eventLimit.value) sentry.setExtra('eventLimitValue', Homey.ManagerSettings._settings.eventLimit.value);
        if (Homey.ManagerSettings._settings.eventLimit.type) sentry.setExtra('eventLimitType', Homey.ManagerSettings._settings.eventLimit.type);
        if (Homey.ManagerSettings._settings.dateFormat) sentry.setExtra('dateFormat', Homey.ManagerSettings._settings.dateFormat);
        if (Homey.ManagerSettings._settings.timeFormat) sentry.setExtra('timeFormat', Homey.ManagerSettings._settings.timeFormat);
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
