'use strict';

const nodeSentry = require('@sentry/node');

const { name, version, sentry } = require('../app.json');
const pkgName = name.en;

const init = Homey => {
  nodeSentry.init({
    // We recommend adjusting traceSampleRate value in production, or using tracesSampler for finer control
    ...sentry,
    release: `${pkgName}@${version}`
  });

  if (Homey) {
    // additional tags
    if (Homey.version) {
      nodeSentry.setTag('firmware', Homey.version);
    }

    if (Homey.ManagerI18n._language) {
      nodeSentry.setTag('language', Homey.ManagerI18n._language);
    }

    // add Homey id
    Homey.ManagerCloud.getHomeyId()
      .then(homeyId => nodeSentry.setUser({ id: homeyId }))
      .catch(error => console.error('Failed to get Homey ID:', error));
  }
};

const startTransaction = (op = 'transactionRun', transactionName = pkgName) => {
  return nodeSentry.startTransaction({
    op,
    transactionName
  });
};

module.exports.sentry = nodeSentry;
module.exports.init = init;
module.exports.startTransaction = startTransaction;
