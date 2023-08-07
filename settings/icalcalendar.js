// a method named 'onHomeyReady' must be present in your code
function onHomeyReady (Homey) {
  // Tell Homey we're ready to be displayed
  Homey.ready()

  // setting ids
  const settingsUris = variableMgmt.setting.icalUris
  const settingsDateFormatLong = variableMgmt.setting.dateFormatLong
  const settingsDateFormatShort = variableMgmt.setting.dateFormatShort
  const settingsTimeFormat = variableMgmt.setting.timeFormat
  const settingsEventLimit = variableMgmt.setting.eventLimit
  const settingsMiscNextEventTokensPerCalendar = variableMgmt.setting.nextEventTokensPerCalendar
  const settingsDebugLogAllEvents = variableMgmt.setting.logAllEvents

  // buttons
  const newItemElement = document.getElementById('newItem')
  const saveElement = document.getElementById('save')

  // default settings
  const eventLimitTypes = [
    {
      value: 'days',
      text: Homey.__('settings.eventlimit.types.days')
    },
    {
      value: 'weeks',
      text: Homey.__('settings.eventlimit.types.weeks')
    },
    {
      value: 'months',
      text: Homey.__('settings.eventlimit.types.months')
    },
    {
      value: 'years',
      text: Homey.__('settings.eventlimit.types.years')
    }
  ]
  const eventLimitDefault = variableMgmt.setting.eventLimitDefault

  // get uris from settings
  Homey.get(settingsUris, (err, uris) => {
    if (err) return Homey.alert(err)
    getCalendarItems(uris)
  })

  // get date long from settings
  Homey.get(settingsDateFormatLong, (err, date) => {
    if (err) return Homey.alert(err)
    getDateTimeFormat('date-long', date)
  })

  // get date short from settings
  Homey.get(settingsDateFormatShort, (err, date) => {
    if (err) return Homey.alert(err)
    getDateTimeFormat('date-short', date)
  })

  // get time from settings
  Homey.get(settingsTimeFormat, (err, time) => {
    if (err) return Homey.alert(err)
    getDateTimeFormat('time', time)
  })

  // get event limit from settings
  Homey.get(settingsEventLimit, (err, limit) => {
    if (err) return Homey.alert(err)
    if (!limit) {
      Homey.set(settingsEventLimit, eventLimitDefault, function (err) {
        if (err) return Homey.alert(err)
      })
      limit = eventLimitDefault
    }

    getEventLimit(limit, eventLimitTypes)
  })

  // get nextEventTokensPerCalendar from settings
  Homey.get(settingsMiscNextEventTokensPerCalendar, (err, state) => {
    if (err) return Homey.alert(err)
    getMiscSetting(settingsMiscNextEventTokensPerCalendar, state)
  })

  // get logAllEvents from settings
  Homey.get(settingsDebugLogAllEvents, (err, state) => {
    if (err) return Homey.alert(err)
    getDebugSetting(settingsDebugLogAllEvents, state)
  })

  // save settings
  saveElement.addEventListener('click', function (e) {
    // save date to settings
    const savedDateFormatLong = saveDateTimeFormat('date-long')
    if (savedDateFormatLong) {
      Homey.set(settingsDateFormatLong, savedDateFormatLong, function (err) {
        if (err) return Homey.alert(err)
      })

      const savedDateFormatShort = saveDateTimeFormat('date-short')
      if (savedDateFormatShort) {
        Homey.set(settingsDateFormatShort, savedDateFormatShort, function (err) {
          if (err) return Homey.alert(err)
        })
      } else {
        return
      }

      // save time to settings
      const savedTimeFormat = saveDateTimeFormat('time')
      if (savedTimeFormat) {
        Homey.set(settingsTimeFormat, savedTimeFormat, function (err) {
          if (err) return Homey.alert(err)
        })
      } else {
        return
      }
    } else {
      return
    }

    // save limit to settings
    Homey.set(settingsEventLimit, saveEventLimit(), function (err) {
      if (err) return Homey.alert(err)
    })

    // save tokensPerCalendar to settings
    Homey.set(settingsMiscNextEventTokensPerCalendar, saveMiscSetting(settingsMiscNextEventTokensPerCalendar), function (err) {
      if (err) return Homey.alert(err)
    })

    // save logAllEvents to settings
    Homey.set(settingsDebugLogAllEvents, saveDebugSetting(settingsDebugLogAllEvents), function (err) {
      if (err) return Homey.alert(err)
    })

    // save uri to settings (THIS SHOULD BE THE LAST THING BEING SAVED to prevent fetching calendars if there's other settings to be saved first)
    Homey.set(settingsUris, saveCalendarItems(), function (err) {
      if (err) return Homey.alert(err)
    })

    hideError()
    Homey.alert(Homey.__('settings.saved_alert'), 'info')
  })

  // add new calendar item
  newItemElement.addEventListener('click', function (e) {
    newCalendarItem()
  })

  // if uri_failed exists as a setting, show error div
  getUriFailedSetting(settingsUris)

  setInterval(() => getUriFailedSetting(settingsUris), 3000)
}

function newCalendarItem (name = null, uri = null) {
  const calendars = document.getElementById('calendars')
  const newElementIndex = (calendars.children.length + 1)
  const newElement = document.getElementsByClassName('clonable')[0].cloneNode(1)

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

function getDateTimeFormat (type, format) {
  const dateTimeInput = document.getElementById(`datetime-${type}`)
  dateTimeInput.value = format
}

function getEventLimit (limit, limitTypes) {
  // add event limit value
  document.getElementById('eventlimit-value').value = limit.value

  // add event limit types
  const element = document.getElementById('eventlimit-type')
  limitTypes.forEach(({ value, text }) => {
    const option = document.createElement('option')
    option.setAttribute('value', value)
    if (limit.type === value) option.setAttribute('selected', true)
    option.appendChild(document.createTextNode(text))
    element.appendChild(option)
  })
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
    // WARNING: Apple iCal URL's are case sensitive!!!!!!!!! DO NOT LOWER CASE!!!!!!!!
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

function saveEventLimit () {
  const limitValue = parseInt(document.getElementById('eventlimit-value').value)
  const limitType = document.getElementById('eventlimit-type').value

  if (Number.isNaN(limitValue)) {
    Homey.alert(`Value in '${Homey.__('settings.eventlimit.legend')}' -> '${Homey.__('settings.eventlimit.value')}' is invalid.\nExpecting only Numbers!`)
    throw `Value in '${Homey.__('settings.eventlimit.legend')}' -> '${Homey.__('settings.eventlimit.value')}' is invalid.\nExpecting only Numbers!`
  } else if (limitValue <= 0) {
    Homey.alert(`Value in '${Homey.__('settings.eventlimit.legend')}' -> '${Homey.__('settings.eventlimit.value')}' is invalid.\nExpecting greater than 0!`)
    throw `Value in '${Homey.__('settings.eventlimit.legend')}' -> '${Homey.__('settings.eventlimit.value')}' is invalid.\nExpecting greater than 0!`
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

function getUriFailedSetting (setting) {
  Homey.get(setting, (err, uris) => {
    if (err) {
      hideError()
      return Homey.alert(err)
    }

    let text = ''
    if (uris !== null && uris !== undefined && Array.isArray(uris)) {
      uris.forEach(item => {
        if (item.failed) {
          if (text === '') {
            text = `${item.name} : ${item.failed}`
          } else {
            text += `<br>${item.name} : ${item.failed}`
          }
        }
      })
    }

    if (text !== '') {
      showError(text)
    } else {
      hideError()
    }
  })
}

function hideError () {
  const errorElement = document.getElementById('uri_error')

  errorElement.classList = 'uri-error-hidden'
}

function showError (text) {
  const errorElement = document.getElementById('uri_error')

  errorElement.innerHTML = `${Homey.__('settings.uri_load_failure')}<br>${text}`
  errorElement.classList = 'uri-error-show'
}

function unfuckHtmlFuck (fucker) {
  const fucky = []

  for (const fuck in fucker) {
    fucky.push(fucker[fuck])
  }

  return fucky
}
