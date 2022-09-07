'use strict'

module.exports = app => {
  const pattern = new RegExp(app.variableMgmt.setting.dateFormatPattern)
  let dateFormat = app.homey.settings.get(app.variableMgmt.setting.dateFormat) || app.homey.__('settings.datetime.date.default')
  let dateLong = dateFormat
  const timeFormat = app.homey.settings.get(app.variableMgmt.setting.timeFormat) || app.homey.__('settings.datetime.time.default')
  const patternResult = dateFormat.match(pattern)
  if (Array.isArray(patternResult) && patternResult.length > 0) {
    dateFormat = patternResult[0] // use dateFormat parsed from settings
    dateLong = patternResult[1] || patternResult[2] // use dateLong parsed from settings
  }
  const dateFormatSplit = dateLong.split(/[./-]/)

  let dateSplitter
  if (dateFormat.includes('.')) {
    dateSplitter = '.'
  } else if (dateFormat.includes('/')) {
    dateSplitter = '/'
  } else if (dateFormat.includes('-')) {
    dateSplitter = '-'
  } else {
    dateSplitter = '.'
  }

  let timeSplitter
  if (timeFormat.includes(':')) {
    timeSplitter = ':'
  } else if (timeFormat.includes('.')) {
    timeSplitter = '.'
  } else {
    timeSplitter = ':'
  }

  const result = {
    date: {
      short: !dateLong.toLowerCase().startsWith('y') ? `${dateFormatSplit[0]}${dateSplitter}${dateFormatSplit[1]}` : `${dateFormatSplit[1]}${dateSplitter}${dateFormatSplit[2]}`,
      long: dateFormat,
      splitter: dateSplitter
    },
    time: {
      time: timeFormat,
      splitter: timeSplitter
    }
  }
  app.log('DateTimeFormat:', result)

  return result
}
