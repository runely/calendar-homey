const metadataResult = await Homey.flow.runFlowCardAction({
  uri: 'homey:app:no.runely.calendar',
  id: 'homey:app:no.runely.calendar:get_calendars_metadata'
})
//console.log(metadataResult)

const metadata = JSON.parse(metadataResult.returnTokens.json)
if (!Array.isArray(metadata)) {
  throw new Error('Metadata not found')
}
//console.log(metadata)

for await (const calendar of metadata) {
  console.log(`----- ${calendar.events.length} events from '${calendar.calendarName}' -----`)
  for await (const eventIndex of calendar.events) {
    const eventResult = await Homey.flow.runFlowCardAction({
      uri: 'homey:app:no.runely.calendar',
      id: 'homey:app:no.runely.calendar:get_calendar_event',
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
