// if set to undefined, all calendars will be fetched
// if set to a calendar name, for instance 'Test', only events from calendar with name 'Test' will be fetched
const calendarName = 'Rune'

const metadataResult = await Homey.flow.runFlowCardAction({
  uri: 'homey:app:no.runely.calendar',
  id: 'get_calendars_metadata'
})
//console.log(metadataResult)

const metadata = JSON.parse(metadataResult.returnTokens.json)
if (!Array.isArray(metadata)) {
  throw new Error('Metadata not found')
}
//console.log(metadata)

let eventCount = 0
for await (const calendar of metadata) {
  if (calendarName && calendarName !== calendar.calendarName) {
    continue
  }

  eventCount += calendar.events.length
  console.log(`----- ${calendar.events.length} events from '${calendar.calendarName}' -----`)
  for await (const eventIndex of calendar.events) {
    const eventResult = await Homey.flow.runFlowCardAction({
      uri: 'homey:app:no.runely.calendar',
      id: 'get_calendar_event',
      args: {
        calendar: {
          id: calendar.calendarName,
          name: calendar.calendarName
        },
        index: eventIndex
      }
    })
    const event = eventResult.returnTokens
    console.log(`Event @ ${eventIndex}:`, event)
  }
}

console.log('Total events from calendar(s):', eventCount)

return eventCount > 0
