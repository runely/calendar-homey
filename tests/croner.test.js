const { Cron } = require('croner')
const { addJob } = require('../handlers/cron')

test('"addJob" returns a new Cron', () => {
  const cron = addJob('*/1 * * * *', () => null)
  cron.stop()

  expect(cron instanceof Cron).toBeTruthy()
  expect(typeof cron.enumerate).toBe('function')
  expect(typeof cron.next).toBe('function')
  expect(typeof cron.stop).toBe('function')
})

test('"next" Cron job is at the next 1th minute', () => {
  const cron = addJob('*/1 * * * *', () => null)
  const nextRun = cron.next()
  console.log('Next run:', nextRun)
  cron.stop()

  // add 1 minute
  const almostThen = new Date(new Date().getTime() + (60 * 1000))
  // set seconds and milliseconds back to 0
  const then = new Date(almostThen.getFullYear(), almostThen.getMonth(), almostThen.getDate(), almostThen.getHours(), almostThen.getMinutes(), 0, 0)
  console.log('Expected next run:', then)

  expect(nextRun.getTime()).toBe(then.getTime())
})

test('"next" Cron job is at the next 15th minute', () => {
  const cron = addJob('*/15 * * * *', () => null)
  const nextRun = cron.next()
  console.log('Next run:', nextRun)
  cron.stop()

  const now = new Date()
  let almostThen
  if (now.getMinutes() < 15) {
    // add the amount of mintes before the time is at the 15th minute
    almostThen = new Date(new Date().getTime() + (60 * 1000 * (15 - now.getMinutes())))
  } else if (now.getMinutes() < 30) {
    // add the amount of mintes before the time is at the 30th minute
    almostThen = new Date(new Date().getTime() + (60 * 1000 * (30 - now.getMinutes())))
  } else if (now.getMinutes() < 45) {
    // add the amount of mintes before the time is at the 45th minute
    almostThen = new Date(new Date().getTime() + (60 * 1000 * (45 - now.getMinutes())))
  } else if (now.getMinutes() < 60) {
    // add the amount of mintes before the time is at the 60th minute
    almostThen = new Date(new Date().getTime() + (60 * 1000 * (60 - now.getMinutes())))
  }
  // set seconds and milliseconds back to 0
  const then = new Date(almostThen.getFullYear(), almostThen.getMonth(), almostThen.getDate(), almostThen.getHours(), almostThen.getMinutes(), 0, 0)
  console.log('Expected next run:', then)

  expect(nextRun.getTime()).toBe(then.getTime())
})
