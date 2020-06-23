The IcalCalendar gives Homey flow cards to trigger on your calendar events

Setup

- Open settings and paste in url to ics file

Find Exchange Online ics url

1. Go to https://outlook.office.com/mail/inbox
2. Click settings -> Show all outlook setting
3. Go to Calendar -> Shared calenders
4. Publish a calendar, click the ics link and choose copy
5. Paste the ics link in settings of Homey app

Find Gmail ics url

1. Go to https://calendar.google.com/
2. Click the three dots next to the calendar you want to share -> Click Settings and sharing
3. Scroll all the way down to the bottom
4. Copy the link from Secret address in ical format
5. Paste the ics link in settings of Homey app

Trigger "Event starts" (will trigger when any event starts)
- Add card as a trigger in a flow
- Tokens:
    - 'Event title'
    - 'Event description'
    - 'Event location'
    - 'Event duration'
    - 'Event duration (mintes)'

Trigger "Event stops" (will trigger when any event stops)
- Add card as a trigger in a flow
- Tokens:
    - 'Event title'
    - 'Event description'
    - 'Event location'
    - 'Event duration'
    - 'Event duration (mintes)'

Condition "Event is ongoing" (will check if specified event is|isn't ongoing)
- Add card as a condition in a flow
- Choose the event

Condition "Event starts within" (will check if specified event starts|doesn't start within when specified)
- Add card as a condition in a flow
- Choose when
- Choose the event

Condition "Event stops within" (will check if specified event stops|doesn't stop within when specified)
- Add card as a condition in a flow
- Choose when
- Choose the event

Condition "Any event is ongoing" (will check if any event is|isn't ongoing)
- Add card as a condition in a flow

Condition "Any event starts within" (will check if any event starts|doesn't start within when specified)
- Add card as a condition in a flow
- Choose when

Condition "Any event stops within" (will check if any event stops|doesn't stop within when specified)
- Add card as a condition in a flow
- Choose when

Action "Sync calendar" (will download a new .ics file to update current events)
- Add card as an action in a flow

Known bugs

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f')

ToDo list

- Add support for recurring events