# IcalCalendar

The IcalCalendar gives Homey flow cards to trigger on your calendar events

## Setup

- Open settings (configure app) and paste in the ical link

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

- Only events not started yet or events started but not finished will be fetched
- Recurring events where start date is within 2 months or less will be fetched

### Triggers
- **Event starts** - *will trigger when any event starts*
- **Event starts in** - *will trigger when any event starts in when specified*
- **Event stops** - *will trigger when any event stops*

### Conditions
- **Specific event is ongoing** - *will check if specified event is|isn't ongoing*
- **Specific event starts within** - *will check if specified event starts|doesn't start within when specified*
- **Specific event stops within** - *will check if specified event stops|doesn't stop within when specified*
- **Any event is ongoing** - *will check if any event is|isn't ongoing*
- **Any event starts within** - *will check if any event starts|doesn't start within when specified*
- **Any event stops within** - *will check if any event stops|doesn't stop within when specified*

### Actions
- **Sync calendars** - *will download new .ics files to update current events*

### Flow tokens on triggers
- Event title
- Event description
- Event location
- Event duration
- Event duration (mintes)
- Calendar name

### Global flow tokens (can be used in any app and service)
- Next event title
- Next event start date
- Next event start time
- Next event stop date
- Next event stop time
- Next event duration
- Next event duration (minutes)
- Next event starts in (minutes)
- Next event stops in (minutes)
- Calendar name of next event
- Todays events, title and time
- Todays events (count)
- Tomorrows events, title and time
- Tomorrows events (count)
- Todays events (per calendar)
- Tomorrows events (per calendar)


## Recurring events

### Be aware of *multiple/duplicate* "recurring" events:
- On a recurring event, where one or more participants have declined, that specific event is detached from the recurring event and created as a separate non-recurring event. This can result in two similar events, both have the same name and date.

## Known bugs

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f')

## Tutorial

Visit [this tutorial](https://community.athom.com/t/trigger-a-flow-using-calendar-events/34017) created by [@RobHomey](https://github.com/RobHomey) for a good summary of the apps possibilities!

## Changelog

- 0.2.4
    - Specific event conditions made more readable
    - Bugfix: Tokens for todays and tomorrows events pr calendar were flushed completely every time calendars were synced
    - Tokens 'Todays events, title and time', 'Tomorrows events, title and time', Todays events (per calendar) and Tomorrows events (per calendar) made more TTS friendly
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
    - Flow card 'Any event stops within' changed to enter minutes in free text (number)
    - Flow card 'Event starts within' changed to enter minutes in free text (number)
    - Flow card 'Event stops within' changed to enter minutes in free text (number)
    - Global token 'Next event start time' split up to 'Next event start date' and 'Next event start time'
    - Global token 'Next event stop time' split up to 'Next event stop date' and 'Next event stop time'
    - 'Next event start date' and 'Next event stop date' made more TTS friendly
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
    - Added global flow tokens for tomorrows events -> [Issue #36](https://github.com/runely/calendar-homey/issues/36)
    - Todays events and Tomorrows events are now sorted by start time -> [Issue #51](https://github.com/runely/calendar-homey/issues/51)
    - Todays and tomorrows events pr calendar -> [Issue #44](https://github.com/runely/calendar-homey/issues/44)
    - Todays and tomorrows events tokens no longer include 'Todays events' and 'Tomorrows events' in the token value
- 0.1.0
    - Added support for Mailfence (DTSTART;VALUE=DATE-TIME / DTEND;VALUE=DATE-TIME)
    - Added support for recurring events :D
    - Bugfix: Todays events did not show events with stop date greater than start date
    - Bugfix: Global tokens were not proparly set as empty before calendars were set
    - Bugfix: Flow tokens/triggers were evaluated even before any events existed
    - Condition event chooser rewritten
    - Event list sorted by start date
    - New icon
- 0.0.6
    - Added global flow tokens for next event and todays events -> Part of issue [Issue #7](https://github.com/runely/calendar-homey/issues/7)
    - Added token 'Calendar name' to 'Event starts' and 'Event stops' triggers
    - Added trigger 'Event starts in' -> [Issue #7](https://github.com/runely/calendar-homey/issues/7)
- 0.0.5
    - Added support for norwegian language -> [Issue #6](https://github.com/runely/calendar-homey/issues/6)
    - Added action for Sync calendar -> [Issue #3](https://github.com/runely/calendar-homey/issues/3)
    - Added duration tokens to trigger 'Event starts' -> [Issue #16](https://github.com/runely/calendar-homey/issues/16)
    - Added trigger 'Event stops' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added conditions 'Any event stops in...' and 'Event stops in...' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
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
    - Bugfix: Tokens are validated before set (replacing '\n' or '\r' or null with '')
    - Added trigger for any events started
    - Bugfix: "Event is ongoing" validated to true when a started event was missing a stop time
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
