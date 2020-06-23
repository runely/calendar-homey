# IcalCalendar

The IcalCalendar can trigger on your calendar events to let you know when events starts

## Setup

- Open settings and paste in url to ics file

## Usage

### Trigger "Event starts" (will trigger when any event starts)
- Add card as a trigger in a flow
- Tokens:
    - 'Event title'
    - 'Event description'
    - 'Event location'
    - 'Event duration'
    - 'Event duration (mintes)'

### Trigger "Event stops" (will trigger when any event stops)
- Add card as a trigger in a flow
- Tokens:
    - 'Event title'
    - 'Event description'
    - 'Event location'
    - 'Event duration'
    - 'Event duration (mintes)'

### Condition "Event is ongoing" (will check if specified event is|isn't ongoing)
- Add card as a condition in a flow
- Choose the event

### Condition "Event starts within" (will check if specified event starts|doesn't start within when specified)
- Add card as a condition in a flow
- Choose when
- Choose the event

### Condition "Event stops within" (will check if specified event stops|doesn't stop within when specified)
- Add card as a condition in a flow
- Choose when
- Choose the event

### Condition "Any event is ongoing" (will check if any event is|isn't ongoing)
- Add card as a condition in a flow

### Condition "Any event starts within" (will check if any event starts|doesn't start within when specified)
- Add card as a condition in a flow
- Choose when

### Condition "Any event stops within" (will check if any event stops|doesn't stop within when specified)
- Add card as a condition in a flow
- Choose when

### Action "Sync calendars" (will download new .ics files to update current events)
- Add card as an action in a flow

## Find Exchange Online ics url

1. Go to https://outlook.office.com/mail/inbox
1. Click settings -> Show all outlook setting
1. Go to Calendar -> Shared calenders
1. Publish a calendar, click the ics link and choose copy
1. Paste the ics link in settings of Homey app

## Find Gmail ics url

1. Go to https://calendar.google.com/
1. Click the three dots next to the calendar you want to share -> Click Settings and sharing
1. Scroll all the way down to the bottom
1. Copy the link from Secret address in ical format
1. Paste the ics link in settings of Homey app

## Known bugs

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f'

## ToDo

- Add support for recurring events

## Changelog

- 0.0.5
    - Added support for norwegian language -> [Issue #6](https://github.com/runely/calendar-homey/issues/6)
    - Added action for Sync calendar -> [Issue #3](https://github.com/runely/calendar-homey/issues/3)
    - Added duration tokens to trigger 'Event starts' -> [Issue #16](https://github.com/runely/calendar-homey/issues/16)
    - Added trigger 'Event stops' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added conditions 'Any event stops in...' and 'Event stops in...' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added support for multiple calendars -> [Issue #17](https://github.com/runely/calendar-homey/issues/17)
    - Bugfix: "When Homey looses internet and tries to sync calendars, app crashes..." -> [Issue #20](https://github.com/runely/calendar-homey/issues/20)
- 0.0.4 (current)
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
