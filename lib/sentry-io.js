'use strict'

const nodeSentry = require('@sentry/node')

const { name, version } = require('../app.json')

const pkgName = name.en

const sentryInit = Homey => {
  const { DSN: dsn, TRACE_SAMPLE_RATE: traceSampleRate, ENV: environment } = Homey.env
  nodeSentry.init({
    // We recommend adjusting traceSampleRate value in production, or using tracesSampler for finer control
    dsn,
    traceSampleRate: Number.parseInt(traceSampleRate, 10),
    environment,
    release: `${pkgName}@${version}`
  })

  if (Homey) {
    // additional tags
    if (Homey.version) {
      nodeSentry.setTag('firmware', Homey.version)
    }

    if (Homey.i18n._language) {
      nodeSentry.setTag('language', Homey.i18n._language)
    }

    if (Homey.clock) {
      nodeSentry.setTag('timezone', Homey.clock.getTimezone())
    }

    // add Homey id
    Homey.cloud.getHomeyId()
      .then(homeyId => nodeSentry.setUser({ id: homeyId }))
      .catch(error => console.error('Failed to get Homey ID:', error))
  }
}

const startTransaction = (op = 'transactionRun', transactionName = pkgName) => {
  return nodeSentry.startTransaction({
    op,
    transactionName
  })
}

module.exports.sentry = nodeSentry
module.exports.sentryInit = sentryInit
module.exports.startTransaction = startTransaction
