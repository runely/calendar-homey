![Node.js CI](https://github.com/runely/calendar-homey/workflows/Node.js%20CI/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# IcalCalendar

The IcalCalendar gives Homey flow cards to trigger on your calendar events

## Test tool

A separate [test tool is created](https://github.com/runely/calendar-homey-test) for you to test IcalCalendar behavior in your own console

## Setup

- Open settings (configure app)
    - Paste in the ical link and give it a name
    - Choose if you want automatic calendar synchronization (defaults to enabled) (if disabled, synchronization must be done by flow card)
    - Choose the interval of the automatic calendar synchronization (defaults to every 15th minute)
    - Change the date/time format or use the default (your choice)
        - All tokens supported in **luxon.toFormat()** is also supported here: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    - Choose the timeframe for how many events to sync in to the app
  - Choose whether you want **next event tags** per calendar. Default is off

### Find Exchange Online ical link

1. Go to https://outlook.office.com/mail/inbox
2. Click settings → Show all outlook setting
3. Go to Calendar → Shared calenders
4. Publish a calendar, click the ics link and choose copy
5. Paste the ical link in settings of Homey app

### Find Gmail ical url

1. Go to https://calendar.google.com/
2. Click the three dots next to the calendar you want to share → Click Settings and sharing
3. Scroll all the way down to the bottom
4. Copy the link from Secret address in ical format
5. Paste the ical link in settings of Homey app

### Find Apple iCloud url

> The first 2 standard Apple iCloud calendars (**Home** and **Work**) are not available to be shared by a public link but only by personal invite (via email). Only **new** and **non-default** calendars from Apple iCloud are working through the public link.

1. Go to https://www.icloud.com/calendar/, or open the Calendar app on your iOS device
2. Click on the icon next to the calendar name in the left pane (not **Home** or **Work**)
3. Tick the checkbox for **Public calendar**
4. Copy the link
5. Paste the calendar link in the Homey app settings
  - **It must be the original link (*Apple Calendar has case-sensitive urls*)**

### Add device `IcalCalendar`

Add the `IcalCalendar` device to follow along with how many calendars you have configured, total event count for all your calendars, and last synchronization timestamp and event count per calendar configured.

### Timezone in your calendar (*.ics)

:exclamation:
The library used in this app to parse the calendars, **[node-ical](https://github.com/jens-maus/node-ical)**, does `NOT`
use the `X-WR-TIMEZONE` property to parse timezones. Instead, it uses the `BEGIN:VTIMEZONE` sections to parse timezones!

:exclamation:
This means that if your calendar provider only uses the `X-WR-TIMEZONE` property, this app will assume your events is always in UTC!

:exclamation:
If your events are created with the timezone `Customized Time Zone` (you will see this when opening the .ics file in a text editor), the events are most likely created with the correct datetime and should not have a timezone applied. The local timezone will Therefore `NOT` be applied to these events!

## Usage

### Sync
- Events are fetched **automatically every 15th minute** (xx:00, xx:15, xx:30, xx:45) (default, can be changed)
- The "Sync calendars" action flow card can also be used to trigger a sync (must be used to sync calendars if automatic sync is disabled)
- The following events will be fetched in to the app:
    - Events not started yet where start date is within the timeframe given in the setup
    - Recurring events where start date is within the timeframe given in the setup
    - Events started but not finished

### See events synced in

To see a list of synced in events, you can use the condition card `Specific event is ongoing` in a flow like this:

1. Create a new flow, *or use an existing one (your choice)*
2. Choose the `Flow` -> `This flow has started` as the trigger in the `WHEN` section
3. In the `AND` section, add the `Specific event is ongoing` card from **IcalCalendar**
    1. Click `Select event...` in the condition card
   2. This will present you with a list of all the events synced in

### Local events

> A local event is **just** local. They will never interact with your calendar externally!

#### Create local event

You can use the action card `Create local event` to add a local event to one of your calendars in Homey. This local event will live and behave just as a normal event would.<br />
When the event is finished, it will automatically be removed, just as any other event.

:exclamation:
If you set `Apply your timezone` to **True**, this will treat the datetimes given as UTC and your timezone difference will be added!

#### Delete local event by title

You can use the action card `Delete local event by title` to remove any local events containing the **title** given.

### Triggers
- **Event starts** - *will trigger when any event starts*
- **Event starts in** - *will trigger when any event starts in when specified*
- **Event starts from calendar** - *will trigger when any event in specified calendar starts*
- **Event ends** - *will trigger when any event ends*
- **Event ends in** - *will trigger when any event ends in when specified*
- **Event ends from calendar** - *will trigger when any event in specified calendar ends*
- **Event changed** - *will trigger when any of the previously synchronized events have been changed (after sync)*
- **Event added** - *will trigger when a new event is created in one of your synced calendars*
    - **Will trigger when these requirements are met:**
        - The event has the `CREATED` property
        - The created events start time is inside the current datetime frame beeing synced in
        - The created event is created within the last 24 hours
- **Synchronization error occurred** - *will trigger when a synchronization error occurs with one of your calendars*

#### Calendar providers not using the `CREATED` property

These calendar providers do not use (or at least not for all events) the `CREATED` property, and so the `Event added` trigger will not work for these calendar providers

- **Office 365**

### Conditions
- **Specific event is ongoing** - *will check if specified event is|isn't ongoing*
- **Specific event starts within** - *will check if specified event starts|doesn't start within when specified*
- **Specific event ends within** - *will check if specified event ends|doesn't end within when specified*
- **Any event is ongoing** - *will check if any event is|isn't ongoing*
- **Any event starts within** - *will check if any event starts|doesn't start within when specified*
- **Any event ends within** - *will check if any event ends|doesn't end within when specified*
- **Any event ongoing in calendar** - *will check if any event is|isn't ongoing in specified calendar*
- **Event containing ... in calendar ... starts within** - *Event containing search value in chosen calendar starts within selected time range (will fill up global tags (containing))*
- **Event containing ... in calendar ... ends within** - *Event containing search value in chosen calendar ends within selected time range (will fill up global tags (containing))*
- **Any event starts within from calendar** - *will check if any event starts|doesn't start within when specified from specified calendar*
- **Event containing ... in calendar ... is ongoing** - *will check if an event containing **value** in **calendar** is|isn't ongoing*
- **Calendar has event where property matches given value and optionally starts within ...** - *will check if specified calendar has one or more events where given property matches|doesn't match given value, and if amount and type is given, also check if event starts within ...*

### Actions
- **Sync calendars** - *will download new .ics files to update current events*
- **Create local event** - *will allow you to create a local event that behaves just as a normal event, but only lives on your Homey* (`event is automatically deleted when it's finished`)
- **Delete local event by title** - *will remove any local events with this title* (`if several local events with this title is found, all of them will be removed!`)
- **Get calendars metadata** - *Will return a JSON representation of your calendar metadata* (`advanced flow action card`)
- **Get calendar event** - *Returns tokens for given event in a given calendar* (`advanced flow action card`)

### HomeyScripts

- **get-all-events**
    - [HP19](homeyscripts/HP19_get-all-events.js)
    - [HP23](homeyscripts/HP23_get-all-events.js)

### Flow tags on triggers
- Event title
- Event description
- Event location
- Event duration
- Event duration *(minutes)*
- Calendar name
- Status
    - Read from **X-MICROSOFT-CDO-BUSYSTATUS** or **MICROSOFT-CDO-BUSYSTATUS**
- Meeting URL
    - Read from **description** for `Microsoft Teams`, `Apple FaceTime`, `Google Meet` and the generic meeting url pattern (----( Video )----\nhttp://meet.url/123-4567-890\n---===---)
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
- Next event description
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
- Next event description in %calendarname%

### Next event tags containing
- Title (contains)
- Start date (contains)
- Start time (contains)
- End date (contains)
- End time (contains)
- Description (contains)

> These tags are used together with condition *Event containing ... in calendar ... starts within* `OR` *Event containing ... in calendar ... ends within*.
> If the condition evaluates to **true**, these tags will be filled with the event found, and the tags can be used in any action card

## Recurring events

### Be aware of *multiple/duplicate* "recurring" events:
- On a recurring event, where one or more participants have declined, that specific event is detached from the recurring event and created as a separate non-recurring event. This can result in two similar events, both have the same name and date.

## Tutorial

Visit [this tutorial](https://community.athom.com/t/trigger-a-flow-using-calendar-events/34017) created by [@RobHomey](https://github.com/RobHomey) for a good summary of the apps possibilities!

## Changelog

- 3.0.0 (https://github.com/runely/calendar-homey/pull/664)
  - Converted to `TypeScript`
  - Upgraded `node-ical` from **0.16.1** to **0.23.1**
    - Replaces `moment` with `luxon` ([Issue #590](https://github.com/runely/calendar-homey/issues/590))
      - POSSIBLY BREAKING: `luxon` uses a little different format tokens than `moment`. Some tokens will be converted. The rest must be changed manually in IcalCalendar settings
  - Replaced `browserify` with `esbuild`
  - Bugfix: Local events with the same **DTSTART** would have the same `UID`
  - Bugfix: "Delete local event" action card would only delete the event from memory and not from storage until next calendar synchronization
  - Replaced `standard` with `biome`
  - Overall improved logging
  - Dependency updates
- 2.12.1
  - Dependency updates
- 2.12.0
  - Updated JSDoc
  - Types all around
  - Fixed a type error where false could be returned instead of an empty list
  - Added missing Promise catch
  - Code cleanup
  - Export functions through an object instead of directly on module.exports to easier follow usages
  - Dependency updates
  - IcalCalendar is limited to only run on Homey Firmware >= 12.9.0, because this has Node.js 22 as runtime
- 2.11.4
  - Dependency updates
- 2.11.3
  - Dependency updates
- 2.11.2
  - Dependency updates
- 2.11.1
  - Updated French translation for the condition card `Any event starts within...`
  - Rewritten how events get triggered and registered for hitcount, to fix a bug where triggers with a variable wouldn't trigger (unless the same trigger with a number also existed)
  - Lint fixes
  - Dependency updates
- 2.11.0 (only released as test)
  - Updated French translation for the condition card `Any event starts within...`
  - Rewritten how events get triggered and registered for hitcount, to fix a bug where triggers with a variable wouldn't trigger (unless the same trigger with a number also existed)
  - Lint fixes
- 2.10.1
  - Fixed some linter warnings
  - Dependency updates
- 2.10.0
  - Added `Duration` and `Duration in minutes` to trigger
    `Event changed` [Issue #613](https://github.com/runely/calendar-homey/issues/613)
  - Dependency updates
- 2.9.0
    - Translated app into Danish, Italian, Korean, Polish and Spanish. Thanks to ChatGPT
- 2.8.2
    - Dependency updates
- 2.8.1
    - Dependency updates
- 2.8.0
    - Add `Start date`, `Start time`, `End date` and `End time` to triggers `Event changed` and `Event changed in calendar` ([Issue #580](https://github.com/runely/calendar-homey/issues/580))
    - Dependency updates
- 2.7.1
    - Updated documentation to contain info about adjustable interval schedule
- 2.7.0
    - Implemented adjustable interval schedule ([Issue #565](https://github.com/runely/calendar-homey/issues/565))
        - Added possibility to disable automatic calendar synchronization
        - Added possibility to adjust automatic calendar synchronization by specifying a cron expression
    - Dependency updates
- 2.6.2
    - Dependency updates
- 2.6.1
    - Dependency updates
- 2.6.0
    - Dependency updates
    - Throws error message in flow editor if `Title`, `Event start`, `Event end` or `Calendar` is invalid on action card `Create local event`
    - Throws error message in flow editor if `event isn't found` or `calendar not found` on action card `Delete local event by title`
- 2.5.0
  - Added setting `Trigger all changed event types` to choose if you want to only trigger `Event changed` for the first
    change on an event (default) or all changes on an event
- 2.4.0
    - Added advanced action cards ([Issue #545](https://github.com/runely/calendar-homey/issues/545)):
        - `Get calendars metadata`
            - Will return a JSON representation of your calendar metadata to use in an advanced flow
        - `Get calendar event`
            - Returns tokens for given event in a given calendar to use in an advanced flow
    - Added `HomeyScripts` for [HP19](homeyscripts/HP19_get-all-events.js) and [HP23](homeyscripts/HP23_get-all-events.js) to show how to use these action cards in a HomeyScript in an advanced flow
    - Dependency updates
- 2.3.5
    - Log out nextEvent only if it exists
- 2.3.4
    - Dependency updates
    - Update tokens before triggering events.
        - Triggered full day events (and other events) which read `Todays events, title and time` and/or other global tokens which should have been updated at 00:00 were updated after the flow had been triggered
- 2.3.3
    - Bugfix: Set `Last` date on **Hit count** as localized date
    - Dependency updates
- 2.3.2
    - Bugfix: Triggers with arguments would trigger number of times that triggercard has been added to a flow 😬 ...
    - throw - Updated text
- 2.3.1
    - Bugfix: Triggers with arguments would trigger number of times that triggercard has been added to a flow 😬 ...
- 2.3.0
    - Added hit count for triggers in settings view. This will show hit count for today, total hit count and last triggered timestamp per trigger card
    - Bugfix: Moved argument trigger validation out of runListener. If a lot of events were imported, all of them would be validated in the trigger runListener which could lead to Homey disabling the flow because if were called too many times...
    - Start calendar fetching every 15th minute and 15th second to make sure events has been triggered and tokens has been updated
    - Added possibility to reset hit count in settings view
    - Added tests for hit-count
    - Bugfix: Recurrence in a recurring event, which was moved to a different date, might not be added
- 2.2.0
    - Deprecated condition `Calendar has event where property !{{is|isn't}} equal to given value and optionally starts within`
    - Added condition `Calendar has event(s) where property !{{matches|doesn't match}} given value and optionally starts within` -> [Issue #529](https://github.com/runely/calendar-homey/issues/529)
    - Dependency updates
- 2.1.0
    - Added condition `Calendar has event where property !{{is|isn't}} equal to given value and optionally starts within` -> [Issue #524](https://github.com/runely/calendar-homey/issues/524)
    - Dependency updates
- 2.0.4
    - Don't fetch calendars IF there's less than 5 minutes since last time
    - Start calendar fetching every 15th minute and 5th second to make sure events has been triggerred and tokens has been updated
    - If calendar fetching is already running, don't trigger events and update tokens
    - Make sure trigger events and update tokens doesn't run at the same time
    - Dependency updates
- 2.0.3
    - Added information about `Home` and `Work` Apple iCloud calendars which doesn't support to be publicly available. [Thanks to @DoctorBazinga for finding this out](https://community.homey.app/t/app-pro-icalcalendar/80708/16)
    - Prefix errors with `[ERROR]` in the logs
    - Show time used on calendar retrieval and finding active events
    - More logging and nullify variables for faster garbage collection
    - Fixed a bug where `A single recurring event that has been moved to a different date, and is ongoing and has start date before the import window will not be imported.` -> [Issue #518](https://github.com/runely/calendar-homey/issues/518)
- 2.0.2
    - IcalCalendar device: Also log out when a capability value is updated and when a new capability is registered
    - Allow to remove the last calendar from app settings
    - Show total event size and active event size (in KB) for a calendar.
    - Dependency updates
    - Fixed a bug where an error would be thrown when the app is shutting down and the app at the same time reaches the point where it tries to use an SDK function → [Issue #509](https://github.com/runely/calendar-homey/issues/509)
- 2.0.1
    - code cleanup
    - Nullify global variables when not needed anymore
  - Correctly log warn/error when something's wrong
    - Dependency updates
    - Fixed a bug where a removed calendar wouldn't remove capabilities for this calendar → [Issue #503](https://github.com/runely/calendar-homey/issues/503)
- 2.0.0
    - Added device `IcalCalendar` which shows calendar count, total event count, and last synchronization timestamp and event count per calendar
    - Dependency updates
- 1.19.1
    - French translation. Thanks to [@Elmago27310](https://github.com/Elmago27310)
    - Dependency updates
- 1.19.0
    - French translation. Thanks to [@Elmago27310](https://github.com/Elmago27310)
    - Dependency updates
- 1.18.4
    - Log out total event count aswell as imported event count for a calendar
    - Log out `uid` for an event when the property isn't string but object and `val` is used to get the string representation
    - Dependency updates
- 1.18.3
  - Fixed a bug where `Event changed` would be triggered when old event property had data but new event property was
    undefined/null OR vice versa (***sync issue***)
- 1.18.2
    - Dependency updates
- 1.18.1
    - Added Homey Community Topic link: https://community.homey.app/t/app-pro-icalcalendar/80708
- 1.18.0
    - Added `Next event description`, `Next event description in %calendarname%` and `Description (contains)` as global tokens -> [Issue #447](https://github.com/runely/calendar-homey/issues/447)
    - Added `Event added in calendar` and `Event changed in calendar` triggers -> [Issue #447](https://github.com/runely/calendar-homey/issues/447)
- 1.17.0
    - Added trigger `Event ends from calendar` -> [Issue #444](https://github.com/runely/calendar-homey/issues/444)
    - Dependency updates
- 1.16.2
    - Added a little more descriptions for `Local events`
    - Trigger `Event added` when a new local event is added
- 1.16.1
    - Added `description` to a local event
- 1.16.0
    - Added possibility for local events → [Issue #442](https://github.com/runely/calendar-homey/issues/442)
    - Dependency updates
- 1.15.0
    - Do not apply local timezone for events created with MS Outlook Custom timezone `Customized Time Zone`. This means that the raw start time set in the calendar file is what will be used
- 1.14.1
    - Minimized footprint
    - Dependency updates
- 1.14.0
    - Fixed support for Homey Pro 2023
        - Fixed a cirular dependency "issue"
    - settings: Save uri's to settings last to prevent fetching calendars if there's other settings to be saved first
    - Remove cron jobs in both `unload` and `onUninit`
    - Try to find and use **fallback uri** for calendar if calendar is not retrieved. If both **uri** and **fallback uri** fails for a calendar, `Synchronization error occurred` will be triggered
    - Dependency updates
- 1.13.2
    - Bugfix: Find meeting url's by a generic pattern now actually works...
- 1.13.1
    - Find meeting url's by a generic pattern (----( Videogesprek )----\nhttp://meet.url/123-4567-890\n---===---)
- 1.13.0
  - Added `Meeting URL` tag to triggers. For now, it reads meeting urls for **Microsoft Teams**, **Apple FaceTime** and
    **Google Meet** from the *description* field → [Issue #420](https://github.com/runely/calendar-homey/issues/420)
    - Added tests for `extract-meeting-url`
    - Dependency updates
- 1.12.0
    - Added `Was ongoing` and  `Ongoing` tags to trigger `Event changed`
    - Dependency updates
- 1.11.4
    - Dependency updates
- 1.11.3
    - Logfix
    - If event hasn't registered a timezone, don't use the local timezone from Homey either, for conditions and triggers...
    - Dependency updates
- 1.11.2
    - Added `uid` to debug output
- 1.11.1
    - Use correct date lookup key to find excluded dates
- 1.11.0
    - If event hasn't registered a timezone, don't use the local timezone from Homey either, all the way through
    - Dependency updates
- 1.10.0
    - Dependency updates
  - Added `Status` tag to triggers. For now, it reads Freebusy status from Microsoft (**X-MICROSOFT-CDO-BUSYSTATUS** , *
    *MICROSOFT-CDO-BUSYSTATUS**) → [Issue #394](https://github.com/runely/calendar-homey/issues/394)
    - If event hasn't registered a timezone, don't use the local timezone from Homey either
    - Show timezone in logged event (when **Log all events** is active)
- 1.9.0
    - Added debug option to log all events to console for better diagnostic reporting
- 1.8.3
    - Dependency updates
- 1.8.2
    - Some repeating ongoing events were not included → [Issue #380](https://github.com/runely/calendar-homey/issues/380)
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
    - Removed sentry in favor for the synchronization error trigger card
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
    - Added trigger 'Synchronization error occurred' → [Issue #316](https://github.com/runely/calendar-homey/issues/316)
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
  - Bugfix: Exchange calendars (might be others aswell) do not use the `CREATED` property. Instead, they use `DTSTAMP`
    and `METHOD`, but these are treated both as *created* and as *modified* timestamp. So from now on only the `CREATED`
    property is taken into account.
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
    - Swedish translation. Thanks to [@Lavve](https://github.com/lavve) → [PR #270](https://github.com/runely/calendar-homey/pull/270)
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
    - Bugfix: Events missing end date (ongoing indefinitely) would set end date as now and could make Homey trigger 'Event ends' on those events → [Issue #212](https://github.com/runely/calendar-homey/issues/212)
    - `node-ical` updated to 0.12.9
    - Dependency updates
- 0.6.5
    - Bugfix: Trigger card 'Event ends in' would not trigger if end time was equal to start time
    - Events over multiple days, where today is not start day or end day, will be set as "whole day" in flowtokens
    - Dependency updates
    - Bugfix: Recurring events crossing over to next day isn't imported → [Issue #218](https://github.com/runely/calendar-homey/issues/218)
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
  - Updated node-ical which should fix the
    bug [Unknown RRULE property 'RRULE'](https://github.com/jens-maus/node-ical/issues/14)
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
    - Added trigger 'Event ends in' → [Issue #149](https://github.com/runely/calendar-homey/issues/149)
  - Bugfix: Ongoing non-recurring events were included, but ongoing recurring events were
    not → [Issue #152](https://github.com/runely/calendar-homey/issues/152)
    - Added condition 'Any event ongoing in calendar' → [Issue #151](https://github.com/runely/calendar-homey/issues/151)
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
    - Humanized next event duration → [Issue #137](https://github.com/runely/calendar-homey/issues/137)
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
    - Bugfix: Apple calendar failed to load because Apple calendar is case sensative on its url... → [Issue #61](https://github.com/runely/calendar-homey/issues/61)
        - To fix this in your app, replace the url in Settings page and save
    - Dutch translation. Thanks to [@RobHomey](https://github.com/RobHomey) -> [Issue #62](https://github.com/runely/calendar-homey/issues/62)
    - Dutch translation typo fixes
- 0.1.2
    - 'Remove button' in Settings now follows language
    - Bugfix: Apple calendar failed to load because Apple calendar is case sensative on its url... → [Issue #61](https://github.com/runely/calendar-homey/issues/61)
        - To fix this in your app, replace the url in Settings page and save
    - Dutch translation. Thanks to [@RobHomey](https://github.com/RobHomey) -> [Issue #62](https://github.com/runely/calendar-homey/issues/62)
- 0.1.1
    - Bugfix: [Typo in the Norwegian locale](https://github.com/runely/calendar-homey/issues/42)
    - Added more choices (timespan) for triggers and conditions
    - Added possibility to remove calendars from settings
    - Added global flow tags for tomorrows events → [Issue #36](https://github.com/runely/calendar-homey/issues/36)
    - Todays events and Tomorrows events are now sorted by start time → [Issue #51](https://github.com/runely/calendar-homey/issues/51)
    - Todays and tomorrows events pr calendar → [Issue #44](https://github.com/runely/calendar-homey/issues/44)
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
    - Added global flow tags for next event and todays events → Part of issue [Issue #7](https://github.com/runely/calendar-homey/issues/7)
    - Added tag 'Calendar name' to 'Event starts' and 'Event ends' triggers
    - Added trigger 'Event starts in' → [Issue #7](https://github.com/runely/calendar-homey/issues/7)
- 0.0.5
    - Added support for norwegian language → [Issue #6](https://github.com/runely/calendar-homey/issues/6)
    - Added action for Sync calendar → [Issue #3](https://github.com/runely/calendar-homey/issues/3)
    - Added duration tags to trigger 'Event starts' → [Issue #16](https://github.com/runely/calendar-homey/issues/16)
    - Added trigger 'Event ends' → [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added conditions 'Any event ends in...' and 'Event ends in...' → [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added support for multiple calendars → [Issue #17](https://github.com/runely/calendar-homey/issues/17)
    - Bugfix: "When Homey looses internet and tries to sync calendars, app crashes..." → [Issue #20](https://github.com/runely/calendar-homey/issues/20)
- 0.0.4
    - Changelog moved out of readme...
- 0.0.3
    - Events in condition card is now presented with a date (and time if present) → [Issue #2](https://github.com/runely/calendar-homey/issues/2)
    - Alert when settings saved → [Issue #9](https://github.com/runely/calendar-homey/issues/9)
    - Show message in settings if uri fails to load
  - Importing only active events. This is a significant performance
    improvement! → [Issue #1](https://github.com/runely/calendar-homey/issues/1)
    - Event list in condition card shows if the event is recurring and/or full day
- 0.0.2: 
    - Bugfix: "triggerEvents" failed when events were not imported yet
    - Bugfix: Tags are validated before set (replacing '\n' or '\r' or null with '')
    - Added trigger for any events started
  - Bugfix: "Event is ongoing" validated to true when a started event was missing an end time
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
    - [@Elmago27310](https://github.com/Elmago27310) : French

---
If you like the app, buy me a cup of :coffee:

[![Donate](https://img.shields.io/badge/Donate-PayPal-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=5L63S5KQFBRYL&currency_code=NOK&source=url)
