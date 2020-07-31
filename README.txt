The IcalCalendar gives Homey flow cards to trigger on your calendar events

Setup

- Open settings (configure app) and paste in the ical link

Find Exchange Online ical link

1. Go to https://outlook.office.com/mail/inbox
2. Click settings -> Show all outlook setting
3. Go to Calendar -> Shared calenders
4. Publish a calendar, click the ics link and choose copy
5. Paste the ical link in settings of Homey app

Find Gmail ical url

1. Go to https://calendar.google.com/
2. Click the three dots next to the calendar you want to share -> Click Settings and sharing
3. Scroll all the way down to the bottom
4. Copy the link from Secret address in ical format
5. Paste the ical link in settings of Homey app

Find Apple iCloud url

1. Go to https://www.icloud.com/calendar/, or open the Calendar app on your iOS device
2. Click on the icon next to the calendar name in the left pane
3. Tick the checkbox for **Public calendar**
4. Copy the link
5. Paste the calendar link in the Homey app settings

Triggers
- Event starts
- Event starts in
- Event stops

Conditions
- Event is ongoing
- Event starts within
- Event stops within
- Any event is ongoing
- Any event starts within
- Any event stops within

Actions
- Sync calendars

Global flow tokens (can be used in any app and service)
- Next event title
- Next event start time
- Next event stop time
- Next event duration
- Next event duration (minutes)
- Next event starts in (minutes)
- Next event stops in (minutes)
- Calendar name of next event
- Todays events, title and time
- Todays events (count)