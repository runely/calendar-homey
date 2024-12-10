'use strict'

const { flow: { triggers } } = require('../app.json')
const { moment } = require('./moment-datetime')

const generateLastTriggered = (app) => {
  let now = moment({ timezone: app.getTimezone() })
  now.locale(app.homey.__('locale.moment'))
  const lastTriggered = now.format(`${app.variableMgmt.dateTimeFormat.long} ${app.variableMgmt.dateTimeFormat.time}`)

  now = null
  return lastTriggered
}

const getHitCountData = (app) => {
  const temp = app.homey.settings.get(app.variableMgmt.hitCount.data)
  return !temp ? undefined : JSON.parse(temp)
}

const saveHitCountData = (app, data) => {
  app.homey.settings.set(app.variableMgmt.hitCount.data, JSON.stringify(data))
}

const resetTodayHitCount = (app) => {
  const data = getHitCountData(app)

  if (!data) {
    app.warn('resetTodayHitCount : Tried to reset hit count for today but hit count data hasnt been populated yet')
    return
  }

  app.log('resetTodayHitCount : Starting to reset today hit count')
  for (const trigger of data) {
    for (const variant of trigger.variants) {
      variant.today = 0
    }
  }

  app.log('resetTodayHitCount : Finished reseting today hit count')
  saveHitCountData(app, data)
}

const setupHitCount = (app) => {
  let data = getHitCountData(app)
  const lang = app.homey.i18n.getLanguage() ?? 'en'

  if (!Array.isArray(data)) {
    data = triggers.map((trigger) => {
      return {
        id: trigger.id,
        name: trigger.titleFormatted?.[lang] ?? trigger.title[lang],
        variants: []
      }
    })

    saveHitCountData(app, data)
    app.log(`setupHitCount: Hit count data generated for ${data.length} triggers`)
    return
  }

  const triggersAdded = []
  triggers.forEach((trigger) => {
    if (!data.find((hitCount) => hitCount.id === trigger.id)) {
      data.push({
        id: trigger.id,
        name: trigger.titleFormatted?.[lang] ?? trigger.title[lang],
        variants: []
      })

      triggersAdded.push(trigger.id)
    }
  })

  if (triggersAdded.length > 0) {
    saveHitCountData(app, data)
    app.log(`setupHitCount: Added trigger(s) ${triggersAdded.join(',')} to hit count data`)
  }
}

const updateHitCount = (app, id, args = undefined) => {
  const data = getHitCountData(app)

  if (!data) {
    app.warn('updateHitCount : Tried to update hit count for', id, 'but hit count data hasnt been populated yet')
    return
  }

  const trigger = data.find((t) => t.id === id)
  if (!trigger) {
    app.warn('updateHitCount :', id, 'doesnt exist as hit count data yet')
    return
  }

  if (args === undefined) {
    if (trigger.variants.length === 0) {
      trigger.variants.push({
        lastTriggered: generateLastTriggered(app),
        today: 1,
        total: 1
      })
      app.log(`updateHitCount : Trigger variant added for ${id} :`, trigger.variants[0])

      saveHitCountData(app, data)
      return
    }

    trigger.variants[0].lastTriggered = generateLastTriggered(app)
    trigger.variants[0].today++
    trigger.variants[0].total++
    app.log(`updateHitCount : Trigger variant for ${id} updated`, trigger.variants[0])

    saveHitCountData(app, data)
    return
  }

  const argKeys = Object.keys(args)
  const argValues = Object.values(args)
  let variant
  if (argKeys.length === 1) {
    variant = trigger.variants.find((v) => {
      const variantKeys = Object.keys(v).filter((v) => v !== 'total' && v !== 'today')
      return variantKeys[0] === argKeys[0] && v[argKeys[0]] === argValues[0]
    })
  } else if (argKeys.length === 2) {
    variant = trigger.variants.find((v) => {
      const variantKeys = Object.keys(v).filter((v) => v !== 'total' && v !== 'today')
      return (variantKeys[0] === argKeys[0] && v[variantKeys[0]] === argValues[0] && variantKeys[1] === argKeys[1] && v[variantKeys[1]] === argValues[1]) || (variantKeys[0] === argKeys[1] && v[variantKeys[0]] === argValues[1] && variantKeys[1] === argKeys[0] && v[variantKeys[1]] === argValues[0])
    })
  }

  if (!variant) {
    trigger.variants.push({
      ...args,
      lastTriggered: generateLastTriggered(app),
      today: 1,
      total: 1
    })
    app.log(`updateHitCount : Trigger variant added for ${id} :`, trigger.variants[trigger.variants.length - 1])

    saveHitCountData(app, data)
    return
  }

  variant.lastTriggered = generateLastTriggered(app)
  variant.today++
  variant.total++
  app.log(`updateHitCount : Trigger variant for ${id} updated`, variant)

  saveHitCountData(app, data)
}

module.exports = {
  getHitCountData,
  resetTodayHitCount,
  setupHitCount,
  updateHitCount
}
