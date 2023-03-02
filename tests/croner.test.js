const { Cron } = require('croner')
const { addJob } = require('../handlers/cron')

test('"addJob" returns a new Cron', () => {
  const cron = addJob('*/1 * * * *', () => null)
  cron.stop()

  expect(cron instanceof Cron).toBeTruthy()
  expect(typeof cron.nextRun).toBe('function')
  expect(typeof cron.nextRuns).toBe('function')
  expect(typeof cron.stop).toBe('function')
})

test('"next" Cron job is at the next 1th minute', () => {
  const cron = addJob('*/1 * * * *', () => null)
  const nextRun = cron.nextRun()
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
  const nextRun = cron.nextRun()
  console.log('Next run:', nextRun)
  cron.stop()

  // get the amount of mintes before the time is at the *th minute
  const now = new Date()
  let minutes
  if (now.getMinutes() < 15) {
    minutes = 15
  } else if (now.getMinutes() < 30) {
    minutes = 30
  } else if (now.getMinutes() < 45) {
    minutes = 45
  } else if (now.getMinutes() < 60) {
    minutes = 60
  }
  // add * minutes
  const almostThen = new Date(new Date().getTime() + (60 * 1000 * (minutes - now.getMinutes())))

  // set seconds and milliseconds back to 0
  const then = new Date(almostThen.getFullYear(), almostThen.getMonth(), almostThen.getDate(), almostThen.getHours(), almostThen.getMinutes(), 0, 0)
  console.log('Expected next run:', then)

  expect(nextRun.getTime()).toBe(then.getTime())
})
