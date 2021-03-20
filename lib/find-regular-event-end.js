const moment = require('moment')

const durationUnits = [
  {
    name: 'weeks',
    abbr: 'W'
  },
  {
    name: 'days',
    abbr: 'D'
  },
  {
    name: 'hours',
    abbr: 'H'
  },
  {
    name: 'minutes',
    abbr: 'M'
  },
  {
    name: 'seconds',
    abbr: 'S'
  }
]

const getDurationUnit = (str, unit) => {
  const regex = new RegExp(`\\d+${unit}`, 'g')
  return str.search(regex) >= 0 ? Number.parseInt(str.substring(str.search(regex), str.indexOf(unit))) : 0
}

module.exports = event => {
  if (event.end) return moment(event.end)
  else if (event.datetype && event.datetype === 'date' && (!event.duration || typeof event.duration !== 'string')) return moment(event.start).add(1, 'day')
  else if (event.datetype && event.datetype === 'date-time') return moment(event.start)
  else {
    let end = moment(event.start)
    durationUnits.forEach(unit => {
      const durationUnit = getDurationUnit(event.duration, unit.abbr)
      end = event.duration.startsWith('-') ? end.subtract(durationUnit, unit.name) : end.add(durationUnit, unit.name)
    })
    return end
  }
}
