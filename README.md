# IcalCalendar

The IcalCalendar gives Homey flow cards to trigger on your calendar events

## Test tool

A separate [test tool is created](https://github.com/runely/calendar-homey-test) for you to test IcalCalendar behavior in your own console

## Setup

- Open settings (configure app)
    - Paste in the ical link
    - Change the date/time format or use the default (your choice)
    - Choose whether or not you want next event tags per calendar. Default is off

### Find Exchange Online ical link

1. Go to https://outlook.office.com/mail/inbox
1. Click settings -> Show all outlook setting
1. Go to Calendar -> Shared calenders
1. Publish a calendar, click the ics link and choose copy
1. Paste the ical link in settings of Homey app

### Find Gmail ical url

1. Go to https://calendar.google.com/
1. Click the three dots next to the calendar you want to share -> Click Settings and sharing
1. Scroll all the way down to the bottom
1. Copy the link from Secret address in ical format
1. Paste the ical link in settings of Homey app

### Find Apple iCloud url

1. Go to https://www.icloud.com/calendar/, or open the Calendar app on your iOS device
1. Click on the icon next to the calendar name in the left pane
1. Tick the checkbox for **Public calendar**
1. Copy the link
1. Paste the calendar link in the Homey app settings
    - **It must be the original link (*Apple Calendar has case sensitive urls*)**

## Usage

### Sync
- Events are fetched automatically every 15 minutes
- The **Sync calendars** action flow card can also be used to trigger a sync

- Only events not started yet or events started but not finished and has start date within 2 months or less will be fetched (this can be overridden in the settings)
- Recurring events where start date is within 2 months or less will be fetched (this can be overridden in the settings)

### Triggers
- **Event starts** - *will trigger when any event starts*
- **Event starts in** - *will trigger when any event starts in when specified*
- **Event starts from calendar** - *will trigger when any event in specified calender starts*
- **Event ends** - *will trigger when any event ends*
- **Event ends in** - *will trigger when any event ends in when specified*

### Conditions
- **Specific event is ongoing** - *will check if specified event is|isn't ongoing*
- **Specific event starts within** - *will check if specified event starts|doesn't start within when specified*
- **Specific event ends within** - *will check if specified event ends|doesn't end within when specified*
- **Any event is ongoing** - *will check if any event is|isn't ongoing*
- **Any event starts within** - *will check if any event starts|doesn't start within when specified*
- **Any event ends within** - *will check if any event ends|doesn't ends within when specified*
- **Any event ongoing in calendar** - *will check if any event is|isn't ongoing in specified calendar*

### Actions
- **Sync calendars** - *will download new .ics files to update current events*

### Flow tags on triggers
- Event title
- Event description
- Event location
- Event duration
- Event duration (mintes)
- Calendar name

### Global flow tags (can be used in any app and service)
- Next event title
- Next event start date
- Next event start time
- Next event end date
- Next event end time
- Next event duration
- Next event duration (minutes)
- Next event starts in (minutes)
- Next event ends in (minutes)
- Calendar name of next event
- Todays events, title and time
- Todays events (count)
- Tomorrows events, title and time
- Tomorrows events (count)
- Todays events (per calendar)
- Tomorrows events (per calendar)

### Next event tags per calendar (can be turned on in the settings)
- Next event title in %calendarname%
- Next event start date in %calendarname%
- Next event start time in %calendarname%
- Next event end date in %calendarname%
- Next event end time in %calendarname%


## Recurring events

### Be aware of *multiple/duplicate* "recurring" events:
- On a recurring event, where one or more participants have declined, that specific event is detached from the recurring event and created as a separate non-recurring event. This can result in two similar events, both have the same name and date.

## Known bugs

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f')

#### Homey reads settings before app is ready

[Issue at Homeys GitHub](https://github.com/athombv/homey-apps-sdk-issues/issues/155)

`The setting page is requesting settings while the app is not yet ready and this is causing a crash.`

**When this happens, Homey will throw this in the console:**
```javascript
/opt/homey-client/system/manager/ManagerApps/bootstrap/sdk/v2/manager/settings.js:1
"use strict";const fs=require("fs"),path=require("path"),Homey=require("homey");class ManagerSettings extends Homey.Manager{__onInit(){this._updateSettingsTimeout=void 0,this._writing=!1,this.__client.emitSystem("getSettings").then(t=>{this._settings=t,this.__ready()}).catch(t=>{this.error(t),this._settings={},this._updateSettings(),this.__ready()}),this.__client.on("settings.get",this._onSettingsGet.bind(this)),this.__client.on("settings.set",this._onSettingsSet.bind(this)),this.__client.on("settings.unset",this._onSettingsUnset.bind(this))}_onSettingsGet(t,e){return!1===t.name?e(null,this._settings):e(null,this.get(t.name))}_onSettingsSet(t,e){try{return this.set(t.name,t.value),e(null,this.get(t.name))}catch(t){return e(t)}}_onSettingsUnset(t,e){try{return this.unset(t.name,t.value),e(null)}catch(t){return e(t)}}getKeys(){return Object.keys(this._settings)}get(t){if("string"!=typeof t)throw new Error("Cannot get setting, 

TypeError: Cannot read property 'uris' of undefined
    at ManagerSettings.get (/opt/homey-client/system/manager/ManagerApps/bootstrap/sdk/v2/manager/settings.js:1:998)
    at ManagerSettings._onSettingsGet (/opt/homey-client/system/manager/ManagerApps/bootstrap/sdk/v2/manager/settings.js:1:622)
    at /opt/homey-client/system/manager/ManagerApps/bootstrap/sdk/v2/lib/HomeyClient.js:1:1284
    at Array.forEach (<anonymous>)
    at HomeyClient._onMessage (/opt/homey-client/system/manager/ManagerApps/bootstrap/sdk/v2/lib/HomeyClient.js:1:1261)
    at process.emit (events.js:311:20)
    at emit (internal/child_process.js:876:12)
    at processTicksAndRejections (internal/process/task_queues.js:85:21)

--- INFO: no.runely.calendar has been killed ---
```

## Logging

By default, IcalCalendar will log info, warning and error messages to file.

### View/download/remove log

1. Go to [Homey developer](https://developer.athom.com/tools/app-settings)
1. Click on IcalCalendar
1. Scroll to the bottom
1. Click 'Load log'
1. To download log:
    1. Click 'Mark log'
    1. Copy the highlighted text
    1. Paste it in a text editor
1. To remove all IcalCalendar logs from system (**can't be undone**)
    1. Click 'Remove log!!'

### Deactivate/Activate logging

1. Go to [Homey developer](https://developer.athom.com/tools/app-settings)
1. Click on IcalCalendar
1. Scroll to the bottom
1. Remove the checkmark from 'Logging' checkbox
1. Click 'Save'

## Tutorial

Visit [this tutorial](https://community.athom.com/t/trigger-a-flow-using-calendar-events/34017) created by [@RobHomey](https://github.com/RobHomey) for a good summary of the apps possibilities!

## Changelog

- 0.6.0
    - Improved logging by default logging to file and console
    - Possibility to view/download log from [Homey developer](https://developer.athom.com/tools/app-settings) in IcalCalendar settings
    - Updated node-ical which should fix the bug "[Unknown RRULE property 'RRULE'](https://github.com/jens-maus/node-ical/issues/67)" (more aggresive fix)
    - Bugfix: flowtoken_already_exists can be thrown when action card `Sync calendars` is triggered (#201)
    - Added `titleFormatted` to conditions for better readability
    - Added `titleFormatted` to triggers for better readability
- 0.5.1
    - Bugfix: Ongoing regular events were not synced in (#199)
- 0.5.0
    - Updated node-ical which should fix the bug '[Unknown RRULE property 'RRULE'](https://github.com/jens-maus/node-ical/issues/14)'
    - A separate [test tool is created](https://github.com/runely/calendar-homey-test) to test IcalCalendar behavior
    - Exception handling for node-ical
- 0.4.8
    - German translation typo
    - Bugfix: Homey.ManagerSettings will return null when app is initially installed
    - Bugfix: Custom date format yield invalid date format string (#195)
    - Dependency update: Homey and sentry
- 0.4.7
    - Enhancement: Sentry property update
    - Bugfix: flowtoken_already_exists (#185)
    - Bugfix: Uri's without a protocol are allowed (#186)
- 0.4.6
    - Bugfix: event.summary can be object (#183)
    - Bugfix: Non-Error exception captured with keys: $__type, data (#181)
    - Enhancement: Url's with webcal://... is replaced with https://... (#180)
    - Enhancement: Url's in settings are now validated (#180)
    - Bugfix: Amount value in 'Time frame' shoud be numbers only (#182)
    - Bugfix: Amount value in 'Time frame' now expects a number higher than 0 (#182)
- 0.4.5
    - Bugfix: Cannot read property 'start' of undefined (#179)
- 0.4.4
    - Bugfix: Used values not yet defined (#178)
- 0.4.3
    - Added sentry
- 0.4.2
    - Bugfix: All regular events are imported -> [Issue #170](https://github.com/runely/calendar-homey/issues/170)
    - New setting to specify time frame for events to be fetched (2 months ahead is the default)
- 0.4.1
    - Ical engine (node-ical) updated (minor)
    - Legacy calendar support (version < 0.0.5) removed
    - Bugfix: Some events had wrong time after DST. Thanks to [@MatsAnd](https://github.com/MatsAnd)
- 0.4.0
    - Added support for adding weekday in dateformat in settings
    - Added trigger 'Event ends in' -> [Issue #149](https://github.com/runely/calendar-homey/issues/149)
    - Bugfix: Ongoing non recurring events were included, but ongoing recurring events were not -> [Issue #152](https://github.com/runely/calendar-homey/issues/152)
    - Added condition 'Any event ongoing in calendar' -> [Issue #151](https://github.com/runely/calendar-homey/issues/151)
    - Bugfix: Events over multiple days now also includes short date in tags
    - Bugfix: Full day events were not included in tomorrows events tag
    - Ical engine (node-ical) updated (minor)
- 0.3.0
    - Next event tags per calendar can be toggled on/off in settings (default is off). Will add the following tags per calendar:
        - Next event title in %calendarname%
        - Next event start date in %calendarname%
        - Next event start time in %calendarname%
        - Next event end date in %calendarname%
        - Next event end time in %calendarname%
    - Humanized next event duration -> [Issue #137](https://github.com/runely/calendar-homey/issues/137)
    - [@RobHomey](https://github.com/RobHomey): Fixed dutch translation
- 0.2.5
    - Date and Time format used in the app can now be changed in the settings. If not changed, default is used.
    - Added trigger 'Event starts from calendar'
    - [@dirkg173](https://github.com/dirkg173): Fixed German translation
- 0.2.4
    - Specific event conditions made more readable
    - Bugfix: Tags for todays and tomorrows events pr calendar were flushed completely every time calendars were synced
    - Tags 'Todays events, title and time', 'Tomorrows events, title and time', Todays events (per calendar) and Tomorrows events (per calendar) made more TTS friendly
    - [@RobHomey](https://github.com/RobHomey): Fixed dutch translation
- 0.2.3
    - [@RobHomey](https://github.com/RobHomey): Fixed dutch translation
- 0.2.2
    - Conditions/Trigger improved by setting amount in minute(s)/hour(s)/day(s)/week(s)
    - [@RobHomey](https://github.com/RobHomey): Fixed dutch translation
- 0.2.1
    - Next event more TTS friendly
- 0.2.0
    - Fixed German typo's
    - Fixed Dutch typo's
    - Bugfix: Hopefully fixed an app crash "Cannot read property 'uris' of undefined"
    - Flow card 'Event starts in' changed to enter minutes in free text (number)
    - Flow card 'Any event starts within' changed to enter minutes in free text (number)
    - Flow card 'Any event ends within' changed to enter minutes in free text (number)
    - Flow card 'Event starts within' changed to enter minutes in free text (number)
    - Flow card 'Event ends within' changed to enter minutes in free text (number)
    - Global tag 'Next event start time' split up to 'Next event start date' and 'Next event start time'
    - Global tag 'Next event end time' split up to 'Next event end date' and 'Next event end time'
    - 'Next event start date' and 'Next event end date' made more TTS friendly
- 0.1.4
    - German translation. Thanks to [@dirkg173](https://github.com/dirkg173) -> [Issue #62](https://github.com/runely/calendar-homey/issues/62)
- 0.1.3
    - 'Remove button' in Settings now follows language
    - Bugfix: Apple calendar failed to load because Apple calendar is case sensative on its url... -> [Issue #61](https://github.com/runely/calendar-homey/issues/61)
        - To fix this in your app, replace the url in Settings page and save
    - Dutch translation. Thanks to [@RobHomey](https://github.com/RobHomey) -> [Issue #62](https://github.com/runely/calendar-homey/issues/62)
    - Dutch translation typo fixes
- 0.1.2
    - 'Remove button' in Settings now follows language
    - Bugfix: Apple calendar failed to load because Apple calendar is case sensative on its url... -> [Issue #61](https://github.com/runely/calendar-homey/issues/61)
        - To fix this in your app, replace the url in Settings page and save
    - Dutch translation. Thanks to [@RobHomey](https://github.com/RobHomey) -> [Issue #62](https://github.com/runely/calendar-homey/issues/62)
- 0.1.1
    - Bugfix: [Typo in the Norwegian locale](https://github.com/runely/calendar-homey/issues/42)
    - Added more choices (timespan) for triggers and conditions
    - Added possibility to remove calendars from settings
    - Added global flow tags for tomorrows events -> [Issue #36](https://github.com/runely/calendar-homey/issues/36)
    - Todays events and Tomorrows events are now sorted by start time -> [Issue #51](https://github.com/runely/calendar-homey/issues/51)
    - Todays and tomorrows events pr calendar -> [Issue #44](https://github.com/runely/calendar-homey/issues/44)
    - Todays and tomorrows events tags no longer include 'Todays events' and 'Tomorrows events' in the tag value
- 0.1.0
    - Added support for Mailfence (DTSTART;VALUE=DATE-TIME / DTEND;VALUE=DATE-TIME)
    - Added support for recurring events :D
    - Bugfix: Todays events did not show events with end date greater than start date
    - Bugfix: Global tags were not proparly set as empty before calendars were set
    - Bugfix: Flow tags/triggers were evaluated even before any events existed
    - Condition event chooser rewritten
    - Event list sorted by start date
    - New icon
- 0.0.6
    - Added global flow tags for next event and todays events -> Part of issue [Issue #7](https://github.com/runely/calendar-homey/issues/7)
    - Added tag 'Calendar name' to 'Event starts' and 'Event ends' triggers
    - Added trigger 'Event starts in' -> [Issue #7](https://github.com/runely/calendar-homey/issues/7)
- 0.0.5
    - Added support for norwegian language -> [Issue #6](https://github.com/runely/calendar-homey/issues/6)
    - Added action for Sync calendar -> [Issue #3](https://github.com/runely/calendar-homey/issues/3)
    - Added duration tags to trigger 'Event starts' -> [Issue #16](https://github.com/runely/calendar-homey/issues/16)
    - Added trigger 'Event ends' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added conditions 'Any event ends in...' and 'Event ends in...' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added support for multiple calendars -> [Issue #17](https://github.com/runely/calendar-homey/issues/17)
    - Bugfix: "When Homey looses internet and tries to sync calendars, app crashes..." -> [Issue #20](https://github.com/runely/calendar-homey/issues/20)
- 0.0.4
    - Changelog moved out of readme...
- 0.0.3
    - Events in condition card is now presented with a date (and time if present) -> [Issue #2](https://github.com/runely/calendar-homey/issues/2)
    - Alert when settings saved -> [Issue #9](https://github.com/runely/calendar-homey/issues/9)
    - Show message in settings if uri fails to load
    - Importing only active events. This is a significantly performance improvement! -> [Issue #1](https://github.com/runely/calendar-homey/issues/1)
    - Event list in condition card shows if the event is recurring and/or full day
- 0.0.2: 
    - Bugfix: "triggerEvents" failed when events were not imported yet
    - Bugfix: Tags are validated before set (replacing '\n' or '\r' or null with '')
    - Added trigger for any events started
    - Bugfix: "Event is ongoing" validated to true when a started event was missing a end time
    - Updated README.txt with info from README.md (and make it look good)
    - Updated app.json/Description with a really well said sentence of what this app can do
    - Changed brandColor
- 0.0.1:
    - Initial version

# Thanks

- Translators
    - [@RobHomey](https://github.com/RobHomey) : Dutch
    - [@dirkg173](https://github.com/dirkg173) : German

---
If you like the app, buy me a cup of :coffee:

[![Donate](https://img.shields.io/badge/Donate-PayPal-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5L63S5KQFBRYL&currency_code=NOK&source=url)
