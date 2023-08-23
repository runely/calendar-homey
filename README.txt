The IcalCalendar gives Homey flow cards to trigger on your calendar events

Setup

- Open settings (configure app)
    - Paste in the ical link and give it a name
    - Change the date/time format or use the default (your choice)
        - All tokens supported in "moment.format()" is also supported here: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    - Choose whether or not you want next event tags per calendar. Default is off
- To be notified of any synchronization errors, create a flow using the trigger "Synchronization error occurred"

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

The first 2 standard Apple iCloud calendars ("Home" and "Work") are not available to be shared by a public link but only by personal invite (via email). Only "new" and "non-default" calendars from Apple iCloud are working through the public link.

1. Go to https://www.icloud.com/calendar/, or open the Calendar app on your iOS device
2. Click on the icon next to the calendar name in the left pane (not "Home" or "Work")
3. Tick the checkbox for "Public calendar"
4. Copy the link
5. Paste the calendar link in the Homey app settings
    a. It must be the original link (Apple Calendar has case sensitive urls)

Add device IcalCalendar

Add the "IcalCalendar" device to follow along with how many calendars you have configured, total event count for all your calendars, and last synchronization timestamp and event count per calendar configured.

Timezone in your calendar (*.ics)

The library used in this app to parse the calendars, node-ical, does NOT use the X-WR-TIMEZONE property to parse timezones. Instead it uses the BEGIN:VTIMEZONE sections to parse timezones!
This means that if your calendar provider only uses the X-WR-TIMEZONE property, this app will assume your events is always in UTC!

If your events are created with the timezone 'Customized Time Zone' (you will see this when opening the .ics file), the events are most likely created with the correct datetime and should not have a timezone applied. The local timezone will therefore NOT be applied to these events!

Sync
- Events are fetched automatically every 15 minutes
- The "Sync calendars" action flow card can also be used to trigger a sync

- Only events not started yet or events started but not finished and has start date within 2 months or less will be fetched (this can be overridden in the settings)
- Recurring events where start date is within 2 months or less will be fetched (this can be overridden in the settings)

More info and changelog can be found on GitHub
