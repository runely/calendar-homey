![Node.js CI](https://github.com/runely/calendar-homey/workflows/Node.js%20CI/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# IcalCalendar

The IcalCalendar gives Homey flow cards to trigger on your calendar events

## Test tool

A separate [test tool is created](https://github.com/runely/calendar-homey-test) for you to test IcalCalendar behavior in your own console

## Setup

- Open settings (configure app)
    - Paste in the ical link and give it a name
    - Change the date/time format or use the default (your choice)
        - All tokens supported in **moment.format()** is also supported here: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Choose whether or not you want **next event tags** per calendar. Default is off

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
- **Event changed** - *will trigger when any of the previously synchronized events have been changed (after sync)*
- **Event added** - *will trigger when a new event is created in one of your synced calendars*
    - **Will trigger when these requirements are met:**
        - The event has the `CREATED` property
        - The created events start time is inside the current datetime frame beeing synced in
        - The created event is created within the last 24 hours
- **Synchronization error occurred** - *will trigger when a synchronization error occurs with one of your calendars*

### Conditions
- **Specific event is ongoing** - *will check if specified event is|isn't ongoing*
- **Specific event starts within** - *will check if specified event starts|doesn't start within when specified*
- **Specific event ends within** - *will check if specified event ends|doesn't end within when specified*
- **Any event is ongoing** - *will check if any event is|isn't ongoing*
- **Any event starts within** - *will check if any event starts|doesn't start within when specified*
- **Any event ends within** - *will check if any event ends|doesn't ends within when specified*
- **Any event ongoing in calendar** - *will check if any event is|isn't ongoing in specified calendar*
- **Event containing ... in calendar ... starts within** - *Event containing search value in chosen calendar starts within selected time range (will fill up global tags (containing))*
- **Event containing ... in calendar ... ends within** - *Event containing search value in chosen calendar ends within selected time range (will fill up global tags (containing))*
- **Any event starts within from calendar** - *will check if any event starts|doesn't start within when specified from specified calendar*
- **Event containing ... in calendar ... is ongoing** - *will check if an event containing **value** in **calendar** is|isn't ongoing*

### Actions
- **Sync calendars** - *will download new .ics files to update current events*

### Flow tags on triggers
- Event title
- Event description
- Event location
- Event duration
- Event duration *(minutes)*
- Calendar name
- Status
- Start date *(only `Event added`)*
- Start time *(only `Event added`)*
- End date *(only `Event added`)*
- End time *(only `Event added`)*
- Calendar error *(only `Synchronization error occurred`)*
- UID *(only `Synchronization error occurred`)*

### Global flow tags (can be used in any app and service)
- Next event title
- Next event start date
- Next event start time
- Next event end date
- Next event end time
- Next event duration
- Next event duration *(minutes)*
- Next event starts in *(minutes)*
- Next event ends in *(minutes)*
- Calendar name of next event
- Todays events, title and time
- Todays events *(count)*
- Tomorrows events, title and time
- Tomorrows events *(count)*
- Todays events *(per calendar)*
- Tomorrows events *(per calendar)*

### Next event tags per calendar (can be turned on in the settings)
- Next event title in %calendarname%
- Next event start date in %calendarname%
- Next event start time in %calendarname%
- Next event end date in %calendarname%
- Next event end time in %calendarname%

### Next event tags containing
- Title (contains)
- Start date (contains)
- Start time (contains)
- End date (contains)
- End time (contains)

> These tags are used together with condition *Event containing ... in calendar ... starts within* `OR` *Event containing ... in calendar ... ends within*.
> If the condition evaluates to **true**, these tags will be filled with the event found, and the tags can be used in any action card

## Recurring events

### Be aware of *multiple/duplicate* "recurring" events:
- On a recurring event, where one or more participants have declined, that specific event is detached from the recurring event and created as a separate non-recurring event. This can result in two similar events, both have the same name and date.

## Tutorial

Visit [this tutorial](https://community.athom.com/t/trigger-a-flow-using-calendar-events/34017) created by [@RobHomey](https://github.com/RobHomey) for a good summary of the apps possibilities!

## Changelog

- 1.9.1
    - Dependency updates
    - Added `Status` tag to triggers. For now it reads Freebusy status from Microsoft (**X-MICROSOFT-CDO-BUSYSTATUS** , **MICROSOFT-CDO-BUSYSTATUS**) -> [Issue #394](https://github.com/runely/calendar-homey/issues/394)
- 1.9.0
    - Added debug option to log all events to console for better diagnostic reporting
- 1.8.3
    - Dependency updates
- 1.8.2
    - Some repeating ongoing events were not included -> [Issue #380](https://github.com/runely/calendar-homey/issues/380)
    - Dependency updates
- 1.8.1
    - Dependency updates
    - Added test for croner
    - Updated dependency `node-ical` - Fixes **invalid timezones**
- 1.8.0
    - Added condition `Event containing ... in calendar ... ends within` -> [Issue #359](https://github.com/runely/calendar-homey/issues/359)
    - Fixed inverted titles in condition cards
- 1.7.1
    - Bugfix: Catch errors thrown from `node-ical`
    - Dependency updates
- 1.7.0
    - Rewritten date/time format to support all tokens (*in any layout*) from **moment.format()**
- 1.6.0
    - Bugfix: Date format in settings view didn't allow the use of `ddd` or `dddd` because the string was forced as uppercase
    - Bugfix: Date format showed wrong `short` date when `YY` or `YYYY` was used as the first date segment
    - Set correctly locale on all events at import
    - Use `long` date format on *startStamp*, always. This to allow for **weekday** to be included IF its added to the `date format`
    - Better documentation for `Date format` section
    - Dependency and DevDependency updates
- 1.5.0
    - Properly handle moved recurrence events
    - Dependency updates
    - Removed sentry in favour for the synchronization error trigger card
- 1.4.1
    - Bugfix: Trigger cards could be fired twice at every 15th minute (0, 15, 30, 45)
        - This happend because triggering cards was also added to the update schedule. And this was done because the schedule through `node-cron` was buggy.
        - `node-cron` has been replaced by `croner`
    - Dependency updates
- 1.4.0
    - Added condition `Event containing search value in chosen calendar is ongoing` -> [Issue #341](https://github.com/runely/calendar-homey/issues/341)
- 1.3.1
    - Bugfix: `Cannot read properties of undefined (reading 'forEach')`
- 1.3.0
    - Bugfix: Every 15th minute, events wouldn't be evaluated for triggering and tokens wouldn't be updated
    - Added tokens `Todays events (count) in` and `Tomorrows events (count) in` for all calendars
- 1.2.0
    - No need to return value in `Promise.resolve`
    - `Sync calendars` action card will present synchronization errors in **Error** flow path in an `Advanced flow`, and through the error banner in a regular flow
    - Dependency updates
- 1.1.4
    - Dates must have **year** as part of the date for TTS to work properly
- 1.1.3
    - Improved error handling for trigger `Synchronization error occurred`
    - Bugfix: `calendar_name` is **undefined**
    - Show if error happend `onCalendarLoad` or `onEventLoad`
- 1.1.0 (1.1.2)
    - **Next event tags containing** as a condition card only
    - Added condition `Any event starts within ... from calendar` -> [Issue #323](https://github.com/runely/calendar-homey/issues/323)
- 1.1.0 (1.1.1)
    - **Next event tags containing** added as a condition card. Settings implementation is disabled and will be removed
- 1.1.0
    - Added trigger 'Synchronization error occurred' -> [Issue #316](https://github.com/runely/calendar-homey/issues/316)
    - Translation fix
    - **Next event tags containing** added. Possibility to have a global tag with the next event matching the given search value
- 1.0.7
    - **Week number** event tag were 1 week of since `Moment#week` were used instead of `Moment#isoWeek`
- 1.0.6
    - Full day events need to have the offset removed (fixed throughout)
    - Handle `Customized Time Zone` from Exchange / Live accounts
    - Dependency updates
- 1.0.5
    - Error handling when events are parsed
    - Make sure recurrence dates outside the limit will not be included
    - Full day events need to have the offset removed
- 1.0.4
    - Log which `Timezone` your Homey is using. Since SDK3 is always running in UTC, we have to rely on `Timezone` set in your Homey to get the correct datetime on your events.
    - Log out whole day events (debug purposes)
- 1.0.3
    - Bugfix: `location`, `description` and `uid` could also be objects
- 1.0.2
    - `exdate` is an invalid array. And since **deepClone** only clones valid values, `exdate` becomes an empty array. To make up for this we have to add the original `exdate` property to the cloned event object
- 1.0.1
    - Initalize `sentry` correctly
- 1.0.0
    - Updated to SDK3
    - Rewritten a bunch for better maintenance
    - Tests for almost all code 🎉
- 0.15.0
    - Dependency updates
    - Updated node-ical
    - Localized **datetime** `start` and `end` format in `Event changed`
- 0.14.3
    - Dependency updates
    - Bugfix: If a recurrence were found, `newEvent` was overwritten with the recurrence event
- 0.14.2
    - Bugfix: Fix misread start when a recurring event had start time set to 00:00 (hopefully this doesn't mess things up...)
    - Bugfix: Make sure recurrence override is same day
- 0.14.1
    - `Summary` of an updated calendar event is now evaluated first.
    - Include recurrence date even when utc date is previous date
- 0.14.0
    - Bugfix: Exchange calendars (might be others aswell) do not use the `CREATED` property. Instead they use `DTSTAMP` and `METHOD`, but these are treated both as *created* and as *modified* timestamp. So from now on only the `CREATED` property is taken into account.
    - Added tokens `Week day`, `Month` and `Date` to trigger **Event added**
- 0.13.1
    - German and Swedish translation fix
- 0.13.0
    - Added trigger 'Event added' -> [Issue #273](https://github.com/runely/calendar-homey/issues/273)
    - Dependency updates
- 0.12.0
    - Bugfix: `summary` property of a calendar isn't required
    - Added `week number` added as a global token
- 0.11.0
    - Dependency updates
    - `start`, `end` and `summary` properties of a calendar is now required. **If an event in a calendar is missing one of these, no events will be imported from this calendar, and an error will be printed in the settings page!**
    - Bugfix: Token update *can* happen in the same second when tokens are beeing flushed because calendars are beeing updated. This is handled now.
- 0.10.1
    - Bugfix: `Event time frame` would not be applied when saved along with a calendar change
- 0.10.0
    - Swedish translation. Thanks to [@Lavve](https://github.com/lavve) -> [PR #270](https://github.com/runely/calendar-homey/pull/270)
    - Dependency updates
- 0.9.3
    - Dependency updates
- 0.9.2
    - [@dirkg173](https://github.com/dirkg173): Fixed German translation
    - Bugfix: Excluded whole day events could mistakenly be included anyway
    - Added more tests to prevent mistakes
    - Dependency updates
    - Updated node-ical
    - Localized time frame types -> [Issue 252?](https://github.com/runely/calendar-homey/issues/252?)
    - Excluded `tests` folder and `renovate.json` from build
- 0.9.1
    - Added hint to trigger `Event changed`
    - Bugfix: Events where a property changed to empty string would not trigger `Event changed`
    - Added jest for testing
    - Dependency updates
- 0.9.0
    - Shrunk footprint of events
    - Security dependency update
    - Dependency updates
    - Added `Event changed` trigger -> [Issue 251](https://github.com/runely/calendar-homey/issues/251)
- 0.8.2
    - Security dependency updates
- 0.8.1
    - Dependency updates
- 0.8.0
    - Dependency updates
    - `node-ical` updated to 0.13.0
        - This also fixes ([Issue #184](https://github.com/runely/calendar-homey/issues/184))
- 0.7.1
    - Bugfix: Only `DATE` events missing `DTEND` and `DURATION` property is supposed to have a duration for 1 day. `DATETIME` events missing `DTEND` property is supposed to end on the same day and time as `DTSTART` property
- 0.7.0
    - Bugfix: Events missing end date is approximately 1 day long or as long as duration (if present) ([RFC5545 3.6.1](https://tools.ietf.org/html/rfc5545#section-3.6.1))
        - [Issue #212](https://github.com/runely/calendar-homey/issues/212)
        - [Issue #221](https://github.com/runely/calendar-homey/issues/221)
- 0.6.6
    - Bugfix: Events missing end date (ongoing indefinitely) would set end date as now and could make Homey trigger 'Event ends' on those events -> [Issue #212](https://github.com/runely/calendar-homey/issues/212)
    - `node-ical` updated to 0.12.9
    - Dependency updates
- 0.6.5
    - Bugfix: Trigger card 'Event ends in' would not trigger if end time was equal to start time
    - Events over multiple days, where today is not start day or end day, will be set as "whole day" in flowtokens
    - Dependency updates
    - Bugfix: Recurring events crossing over to next day isn't imported -> [Issue #218](https://github.com/runely/calendar-homey/issues/218)
- 0.6.4
    - Bugfix: Homey v5.0.0 returns non-existing app settings differently than Homey v4.x.x
- 0.6.3
    - More App store readme cleanup
    - Code cleanup
    - Bugfix: Flow tokens could cause a crash if calendar names aren't unique
    - More readable duration token
    - Dependency updates
- 0.6.2
    - Dependency updates
    - App store readme cleanup
    - Updated node-ical to fix the bug [`No toISOString function in exdate[name]`](https://github.com/jens-maus/node-ical/issues/75)
- 0.6.1
    - Bugfix for Homey versions prior to 4.2.0: `Empty catch block`
- 0.6.0
    - Bugfix: flowtoken_already_exists can be thrown when action card `Sync calendars` is triggered (#201)
    - Updated node-ical to fix the bug `Unknown RRULE property 'RRULE'`
    - Added formatted titles to conditions for better readability
    - Added formatted titles to triggers for better readability
    - Moved `New calendar` button in settings page to calendar section
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
    - [@Lavve](https://github.com/lavve) : Swedish

---
If you like the app, buy me a cup of :coffee:

[![Donate](https://img.shields.io/badge/Donate-PayPal-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5L63S5KQFBRYL&currency_code=NOK&source=url)
