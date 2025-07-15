'use strict'

/**
 * @param {string} formatLong
 *
 * @returns string
 */
const getDateFormatShort = (formatLong) => {
  let dateFormat = formatLong
  let dateLong = dateFormat
  const legacyPatternResult = /[d \-.,/:]{0,7}([DM]{1,2}[/.-][DM]{1,2}[/.-]Y{2,4})|[d \-.,/:]{0,7}(Y{2,4}[/.-][DM]{1,2}[/.-][DM]{1,2})/.exec(dateFormat)
  if (Array.isArray(legacyPatternResult) && legacyPatternResult.length > 0) {
    dateFormat = legacyPatternResult[0] // use dateFormat parsed from settings
    dateLong = legacyPatternResult[1] || legacyPatternResult[2] // use dateLong parsed from settings
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

  return !dateLong.toLowerCase().startsWith('y') ? `${dateFormatSplit[0]}${dateSplitter}${dateFormatSplit[1]}` : `${dateFormatSplit[1]}${dateSplitter}${dateFormatSplit[2]}`
}

/**
 * @typedef {import('../types/VariableMgmt.type').VariableManagementDateTimeFormat} VariableMgmtDateTimeFormat
 */

/**
 * @param {import('../types/ExtendedHomeyApp.type').ExtHomeyApp|import('../types/AppTests.type').AppTests} app - App class init by Homey
 *
 * @returns VariableMgmtDateTimeFormat
 */
module.exports = (app) => {
  const time = app.homey.settings.get(app.variableMgmt.setting.timeFormat) || app.homey.__('settings.datetime.time.default')
  const long = app.homey.settings.get(app.variableMgmt.setting.dateFormatLong) || app.homey.settings.get(app.variableMgmt.setting.dateFormat) || app.homey.__('settings.datetime.date.default')
  let short = app.homey.settings.get(app.variableMgmt.setting.dateFormatShort)
  if (!short) {
    short = getDateFormatShort(long)
    app.homey.settings.set(app.variableMgmt.setting.timeFormat, time)
    app.homey.settings.set(app.variableMgmt.setting.dateFormatLong, long)
    app.homey.settings.set(app.variableMgmt.setting.dateFormatShort, short)
    app.log('DateTimeFormat saved to settings the first time')
  }

  const format = {
    long,
    short,
    time
  }

  app.log('DateTimeFormat:', format)

  return format
}
