module.exports = calendars => {
  return calendars.reduce((acc, curr) => {
    curr.events.forEach(event => {
      if (!acc.find(accItem => accItem.uid === event.uid)) {
        acc.push({ calendar: curr.name, uid: event.uid })
      }
    })
    return acc
  }, [])
}
