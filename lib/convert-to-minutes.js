'use strict'

module.exports = (value, type) => {
  const hour = 60
  const day = 1440 // (60 * 24)
  const week = 10080 // (60 * 24 * 7)

  // set type to default be Minutes
  if (type === undefined) {
    type = '1'
  }

  if (type === '1') {
    return value
  } // minutes

  if (type === '2') {
    return (value * hour)
  } // hours

  if (type === '3') {
    return (value * day)
  } // days

  if (type === '4') {
    return (value * week)
  } // weeks
}
