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

ConditionCard "Event is ongoing" (will check if specified event is|isn't ongoing)
- Add card as a condition in a flow
- Choose the event

ConditionCard "Event starts in" (will check if specified event starts|doesn't start in when specified)
- Add card as a condition in a flow
- Choose when
- Choose the event

ConditionCard "Any event is ongoing" (will check if any event is|isn't ongoing)
- Add card as a condition in a flow

ConditionCard "Any event starts in" (will check if any event starts|doesn't start in when specified)
- Add card as a condition in a flow
- Choose when

Trigger "Any event starts" (will trigger when any event starts)
- Add card as a trigger in a flow
- Tokens:
    - 'Event name'
    - 'Event description'
    - 'Event location'

Known bugs

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f')

ToDo list

- Add support for recurring events
- Add support for multiple calendars