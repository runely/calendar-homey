# IcalCalendar

Monitor ical url and check if events are ongoing or starting soon

## Setup

- Install app from Homey store
- Open settings and paste in url to ics file

## Usage

### ConditionCard "Event is ongoing"
- Add card as a condition
- Choose which event

### ConditionCard "Event starts in"
- Add card as a condition
- Choose when
- Choose which event

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

## Known problems

- Searching events in condition card, returns empty when search query has a space

## Changelog

- 0.0.1 : Initial version