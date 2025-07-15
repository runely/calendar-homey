// a method named 'onHomeyReady' must be present in your code
function onHomeyReady (Homey) {
  // Tell Homey we're ready to be displayed
  Homey.ready()

  // setting ids
  const settingsUris = variableMgmt.setting.icalUris
  const settingsSyncInterval = variableMgmt.setting.syncInterval
  const settingsDateFormatLong = variableMgmt.setting.dateFormatLong
  const settingsDateFormatShort = variableMgmt.setting.dateFormatShort
  const settingsTimeFormat = variableMgmt.setting.timeFormat
  const settingsEventLimit = variableMgmt.setting.eventLimit
  const settingsMiscNextEventTokensPerCalendar = variableMgmt.setting.nextEventTokensPerCalendar
  const settingsDebugLogAllEvents = variableMgmt.setting.logAllEvents
  const hitCountDataPath = variableMgmt.hitCount.data
  const triggerAllChangedEventTypes = variableMgmt.setting.triggerAllChangedEventTypes

  // buttons
  const newItemElement = document.getElementById('newItem')
  const saveElement = document.getElementById('save')
  const resetElement = document.getElementById('reset')

  // tabs and panels
  const settingsTab = document.getElementById('settings-tab')
  const hitCountTab = document.getElementById('hitcount-tab')
  const panelSettings = document.getElementById('settings-panel')
  const panelHitCount = document.getElementById('hitcount-panel')
  const hitCountTable = document.getElementById('hitcount-table')

  // default settings
  const eventLimitTypes = [
    {
      value: 'days',
      text: Homey.__('settings.syncsettings.eventlimit.types.days')
    },
    {
      value: 'weeks',
      text: Homey.__('settings.syncsettings.eventlimit.types.weeks')
    },
    {
      value: 'months',
      text: Homey.__('settings.syncsettings.eventlimit.types.months')
    },
    {
      value: 'years',
      text: Homey.__('settings.syncsettings.eventlimit.types.years')
    }
  ]
  const eventLimitDefault = variableMgmt.setting.eventLimitDefault

  const addHitCountRow = (name, todayCount = 0, totalCount = 0, lastTriggered = '') => {
    const rowElement = document.createElement('tr')
    const columnNameElem = document.createElement('td')
    const columnTotalElem = document.createElement('td')
    const columnTodayElem = document.createElement('td')
    const columnLastTriggeredElem = document.createElement('td')

    columnNameElem.innerText = name
    columnTodayElem.innerText = todayCount.toString()
    columnTotalElem.innerText = totalCount.toString()
    columnLastTriggeredElem.innerText = lastTriggered
    rowElement.appendChild(columnNameElem)
    rowElement.appendChild(columnTodayElem)
    rowElement.appendChild(columnTotalElem)
    rowElement.appendChild(columnLastTriggeredElem)
    hitCountTable.appendChild(rowElement)
  }

  // get uris from settings
  Homey.get(settingsUris, (err, uris) => {
    if (err) {
      return Homey.alert(err)
    }
    getCalendarItems(uris)
  })

  Homey.get(settingsSyncInterval, (err, interval) => {
    if (err) {
      return Homey.alert(err)
    }
    getSyncInterval(interval)
  })

  // get event limit from settings
  Homey.get(settingsEventLimit, (err, limit) => {
    if (err) {
      return Homey.alert(err)
    }
    if (!limit) {
      Homey.set(settingsEventLimit, eventLimitDefault, function (err) {
        if (err) {
          return Homey.alert(err)
        }
      })
      limit = eventLimitDefault
    }

    getEventLimit(limit, eventLimitTypes)
  })

  // get date long from settings
  Homey.get(settingsDateFormatLong, (err, date) => {
    if (err) {
      return Homey.alert(err)
    }
    getDateTimeFormat('date-long', date)
  })

  // get date short from settings
  Homey.get(settingsDateFormatShort, (err, date) => {
    if (err) {
      return Homey.alert(err)
    }
    getDateTimeFormat('date-short', date)
  })

  // get time from settings
  Homey.get(settingsTimeFormat, (err, time) => {
    if (err) {
      return Homey.alert(err)
    }
    getDateTimeFormat('time', time)
  })

  // get nextEventTokensPerCalendar from settings
  Homey.get(settingsMiscNextEventTokensPerCalendar, (err, state) => {
    if (err) {
      return Homey.alert(err)
    }
    getMiscSetting(settingsMiscNextEventTokensPerCalendar, state)
  })

  // get triggerAllChangedEventTypes
  Homey.get(triggerAllChangedEventTypes, (err, state) => {
    if (err) {
      return Homey.alert(err)
    }
    getMiscSetting(triggerAllChangedEventTypes, state)
  })

  // get logAllEvents from settings
  Homey.get(settingsDebugLogAllEvents, (err, state) => {
    if (err) {
      return Homey.alert(err)
    }
    getDebugSetting(settingsDebugLogAllEvents, state)
  })

  // get hitCountData
  Homey.get(hitCountDataPath, (err, hitCountData) => {
    if (err) {
      return Homey.alert(err)
    }
    if (!Array.isArray(hitCountData)) {
      if (!hitCountData) {
        hitCountData = []
      } else {
        hitCountData = JSON.parse(hitCountData)
      }
    }

    hitCountData.forEach((hitCount) => {
      if (hitCount.variants.length === 0) {
        addHitCountRow(hitCount.name)
        return
      }

      hitCount.variants.forEach((variant) => {
        let name = hitCount.name
        for (const match of name.matchAll(/(\[\[.\w+]])/g)) {
          if (!match || match.length <= 0 || typeof match[0] !== 'string') {
            continue
          }

          const m = match[0]
          const a = m.replace('[[', '').replace(']]', '')
          const av = a === 'type' ? Homey.__(`hitcount.typeLabels.${variant[a]}`) : variant[a]
          name = name.replace(m, av)
        }

        addHitCountRow(name, variant.today, variant.total, variant.lastTriggered)
      })
    })
  })

  // save settings
  saveElement.addEventListener('click', function () {
    // save date to settings
    const savedDateFormatLong = saveDateTimeFormat('date-long')
    if (savedDateFormatLong) {
      Homey.set(settingsDateFormatLong, savedDateFormatLong, function (err) {
        if (err) {
          return Homey.alert(err)
        }
      })

      const savedDateFormatShort = saveDateTimeFormat('date-short')
      if (savedDateFormatShort) {
        Homey.set(settingsDateFormatShort, savedDateFormatShort, function (err) {
          if (err) {
            return Homey.alert(err)
          }
        })
      } else {
        return
      }

      // save time to settings
      const savedTimeFormat = saveDateTimeFormat('time')
      if (savedTimeFormat) {
        Homey.set(settingsTimeFormat, savedTimeFormat, function (err) {
          if (err) {
            return Homey.alert(err)
          }
        })
      } else {
        return
      }
    } else {
      return
    }

    // save limit to settings
    Homey.set(settingsEventLimit, saveEventLimit(), function (err) {
      if (err) {
        return Homey.alert(err)
      }
    })

    // save tokensPerCalendar to settings
    Homey.set(settingsMiscNextEventTokensPerCalendar, saveMiscSetting(settingsMiscNextEventTokensPerCalendar), function (err) {
      if (err) {
        return Homey.alert(err)
      }
    })

    // save triggerAllChangedEventTypes to settings
    Homey.set(triggerAllChangedEventTypes, saveMiscSetting(triggerAllChangedEventTypes), function (err) {
      if (err) {
        return Homey.alert(err)
      }
    })

    // save logAllEvents to settings
    Homey.set(settingsDebugLogAllEvents, saveDebugSetting(settingsDebugLogAllEvents), function (err) {
      if (err) {
        return Homey.alert(err)
      }
    })

    Homey.set(settingsSyncInterval, saveSyncInterval(), function (err) {
      if (err) {
        return Homey.alert(err)
      }
    })

    // save uri to settings (THIS SHOULD BE THE LAST THING BEING SAVED to prevent fetching calendars if there's other settings to be saved first)
    Homey.set(settingsUris, saveCalendarItems(), function (err) {
      if (err) {
        return Homey.alert(err)
      }
    })

    hideError()
    Homey.alert(Homey.__('settings.saved_alert'), 'info')
  })

  // add new calendar item
  newItemElement.addEventListener('click', function () {
    newCalendarItem()
  })

  // reset hitCountData
  resetElement.addEventListener('click', function () {
    Homey.get(hitCountDataPath, async (err, hitCountData) => {
      if (err) {
        return Homey.alert(err)
      }
      if (!Array.isArray(hitCountData)) {
        if (!hitCountData) {
          hitCountData = []
        } else {
          hitCountData = JSON.parse(hitCountData)
        }
      }
  
      if (hitCountData.length === 0) {
        return Homey.alert('Hit count data not set yet', 'info')
      }

      const shouldReset = await Homey.confirm(Homey.__('hitcount.panel.resetConfirm'))
      if (!shouldReset) {
        return
      }

      hitCountData.forEach((hitCount) => {
        hitCount.variants = []
      })

      Homey.set(hitCountDataPath, JSON.stringify(hitCountData), function (err) {
        if (err) {
          return Homey.alert(err)
        }

        for (let i = 0; i < 10; i++) {
          for (const child of hitCountTable.children) { hitCountTable.removeChild(child) }
        }
      })
    })
  })

  // if uri_failed exists as a setting, show error div
  getUriFailedSetting(settingsUris, settingsSyncInterval)

  setInterval(() => getUriFailedSetting(settingsUris, settingsSyncInterval), 3000)

  // tab activation
  const activateTab = (e) => {
    const elem = e.srcElement
    if (elem.classList.contains('active-tab')) {
      return
    }

    settingsTab.classList.toggle('active-tab')
    hitCountTab.classList.toggle('active-tab')
    panelSettings.classList.toggle('panel-hidden')
    panelHitCount.classList.toggle('panel-hidden')
  }

  settingsTab.addEventListener('click', activateTab)
  hitCountTab.addEventListener('click', activateTab)
}

function newCalendarItem (name = null, uri = null) {
  const calendars = document.getElementById('calendars')
  const newElementIndex = (calendars.children.length + 1)
  const newElement = document.getElementsByClassName('clonable')[0].cloneNode(true)

  // reset element
  newElement.classList = ''
  newElement.children[3].id = `uri-name${newElementIndex}`
  newElement.children[8].id = `uri-uri${newElementIndex}`

  // create remove button
  const removeButton = document.createElement('button')
  removeButton.onclick = function () {
    document.getElementById('calendars').removeChild(this.parentNode)
  }
  removeButton.textContent = Homey.__('settings.buttons.remove')
  newElement.appendChild(document.createElement('br'))
  newElement.appendChild(document.createElement('br'))
  newElement.appendChild(removeButton)

  // set values
  newElement.children[3].value = name || ''
  newElement.children[8].value = uri || ''

  // append new calendar
  calendars.appendChild(newElement)
}

function getCalendarItems (calendars) {
  if (calendars && calendars.length > 0) {
    document.getElementById('uri-name').value = calendars[0].name
    document.getElementById('uri-uri').value = calendars[0].uri

    for (let i = 1; i < calendars.length; i++) {
      newCalendarItem(calendars[i].name, calendars[i].uri)
    }
  }
}

function getSyncInterval (interval) {
  document.getElementById('syncsettings-interval-auto').checked = interval.auto
  document.getElementById('syncsettings-interval-cron').value = interval.cron
}

function getEventLimit (limit, limitTypes) {
  // add event limit value
  document.getElementById('eventlimit-value').value = limit.value

  // add event limit types
  const element = document.getElementById('eventlimit-type')
  limitTypes.forEach(({ value, text }) => {
    const option = document.createElement('option')
    option.setAttribute('value', value)
    if (limit.type === value) {
      option.setAttribute('selected', 'true')
    }
    option.appendChild(document.createTextNode(text))
    element.appendChild(option)
  })
}

function getDateTimeFormat (type, format) {
  const dateTimeInput = document.getElementById(`datetime-${type}`)
  dateTimeInput.value = format
}

function getMiscSetting (setting, state) {
  if (state) {
    const element = document.getElementById(`misc-${setting}`)
    if (typeof state === 'boolean') {
      element.checked = state
    } else if (typeof state === 'string') {
      element.value = state
    }
  }
}

function getDebugSetting (setting, state) {
  if (state) {
    const element = document.getElementById(`debug-${setting}`)
    if (typeof state === 'boolean') {
      element.checked = state
    } else if (typeof state === 'string') {
      element.value = state
    }
  }
}

function saveCalendarItems () {
  const calendars = unfuckHtmlFuck(document.getElementById('calendars').children)
  const calendarNames = []

  let calendarIndex = 1
  return calendars.filter(calendar => calendar.localName === 'fieldset' && (calendar.children[3].value !== '' || calendar.children[8].value !== '')).map(calendar => {
    const name = calendar.children[3].value
    let uri = calendar.children[8].value

    // Replace webcal:// urls (from iCloud) with https://
    // WARNING: Apple iCal URLs are case-sensitive!!!!!!!!! DO NOT LOWER CASE!!!!!!!!
    uri = uri.replace('webcal://', 'https://')

    // control that uri starts with 'http://' || 'https://'
    if (uri.indexOf('http://') === -1 && uri.indexOf('https://') === -1) {
      Homey.alert(`Uri for calendar '${name}' is invalid`)
      throw `Uri for calendar '${name}' is invalid`
    }

    // calendar name must be unique to no mess up flow tokens
    if (calendarNames.includes(name)) {
      Homey.alert(`Calendar entry ${calendarIndex} (${name}) is invalid. Unique names are required!`)
      throw `Calendar entry ${calendarIndex} (${name}) is invalid. Unique names are required!`
    } else {
      calendarNames.push(name)
      calendarIndex++
    }

    return {
      name: name,
      uri: uri
    }
  })
}

function saveSyncInterval () {
  const auto = document.getElementById('syncsettings-interval-auto').checked
  const cron = document.getElementById('syncsettings-interval-cron').value

  if (auto && cron === '') {
    Homey.alert('Value in "Cron expression" is invalid!')
    throw 'Value in "Cron expression" is invalid!'
  }

  return { auto, cron }
}

function saveEventLimit () {
  const limitValue = parseInt(document.getElementById('eventlimit-value').value)
  const limitType = document.getElementById('eventlimit-type').value

  if (Number.isNaN(limitValue)) {
    Homey.alert(`Value in '${Homey.__('settings.syncsettings.eventlimit.legend')}' -> '${Homey.__('settings.syncsettings.eventlimit.value')}' is invalid.\nExpecting only Numbers!`)
    throw `Value in '${Homey.__('settings.syncsettings.eventlimit.legend')}' -> '${Homey.__('settings.syncsettings.eventlimit.value')}' is invalid.\nExpecting only Numbers!`
  } else if (limitValue <= 0) {
    Homey.alert(`Value in '${Homey.__('settings.syncsettings.eventlimit.legend')}' -> '${Homey.__('settings.syncsettings.eventlimit.value')}' is invalid.\nExpecting greater than 0!`)
    throw `Value in '${Homey.__('settings.syncsettings.eventlimit.legend')}' -> '${Homey.__('settings.syncsettings.eventlimit.value')}' is invalid.\nExpecting greater than 0!`
  }

  return {
    value: limitValue,
    type: limitType
  }
}

function saveMiscSetting (setting) {
  const element = document.getElementById(`misc-${setting}`)
  if (element.type === 'checkbox') {
    return element.checked
  } else if (element.type === 'text') {
    return element.value
  }
}

function saveDebugSetting (setting) {
  const element = document.getElementById(`debug-${setting}`)
  if (element.type === 'checkbox') {
    return element.checked
  } else if (element.type === 'text') {
    return element.value
  }
}

function saveDateTimeFormat (type) {
  const inputField = document.getElementById(`datetime-${type}`)
  return inputField.value
}

function getUriFailedSetting (setting, syncInterval) {
  Homey.get(setting, (err, uris) => {
    if (err) {
      hideError('uri')
      return Homey.alert(err)
    }

    let text = ''
    if (uris !== null && uris !== undefined && Array.isArray(uris)) {
      uris.forEach(item => {
        if (item.failed) {
          if (text === '') {
            text = `<h3>Uri errors</h3>${item.name} : ${item.failed}`
          } else {
            text += `<br>${item.name} : ${item.failed}`
          }
        }
      })
    }

    if (text !== '') {
      showError(text, 'uri')
    } else {
      hideError('uri')
    }
  })

  Homey.get(syncInterval, (err, interval) => {
    if (err) {
      hideError('cron')
      return Homey.alert(err)
    }

    let text = ''
    if (interval && interval.error) {
      text = `<b>${interval.error}</b>`
    }

    if (text !== '') {
      showError(text, 'cron')
    } else {
      hideError('cron')
    }
  })
}

function hideError (type) {
  if (type === 'uri') { 
    const errorElement = document.getElementById('uri_error')
    errorElement.classList.add('error-section-hidden')
    errorElement.classList.remove('error-section-show')
  } else if (type === 'cron') {
    const errorElement = document.getElementById('cron_error')
    errorElement.classList.add('error-section-hidden')
    errorElement.classList.remove('error-section-show')
  } else {
    const uriElement = document.getElementById('uri_error')
    const cronElement = document.getElementById('cron_error')
    uriElement.classList.add('error-section-hidden')
    uriElement.classList.remove('error-section-show')
    cronElement.classList.add('error-section-hidden')
    cronElement.classList.remove('error-section-show')
  }
}

function showError (text, type) {
  if (type === 'uri') {
    const errorElement = document.getElementById('uri_error')

    errorElement.innerHTML = `${Homey.__('settings.uri_load_failure')}<br>${text}`
    errorElement.classList.add('error-section-show')
    errorElement.classList.remove('error-section-hidden')
  } else if (type === 'cron') {
    const errorElement = document.getElementById('cron_error')

    errorElement.innerHTML = text
    errorElement.classList.add('error-section-show')
    errorElement.classList.remove('error-section-hidden')
  }
}

function unfuckHtmlFuck (fucker) {
  const fucky = []

  for (const fuck in fucker) {
    fucky.push(fucker[fuck])
  }

  return fucky
}
