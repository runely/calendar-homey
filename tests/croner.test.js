'use strict'

const { Cron } = require('croner')
const { addJob, isValidCron } = require('../handlers/cron')

const validCronJobs = [
  {
    pattern: '0 0 * * *',
    description: 'Runs every day at midnight (00:00)'
  },
  {
    pattern: '*/5 * * * *',
    description: 'Runs every 5 minutes'
  },
  {
    pattern: '0 6 * * 1',
    description: 'Runs every Monday at 06:00'
  },
  {
    pattern: '30 22 * * *',
    description: 'Runs every day at 22:30'
  },
  {
    pattern: '0 */2 * * *',
    description: 'Runs every 2 hours'
  },
  {
    pattern: '15 14 1 * *',
    description: 'Runs on the 1st of every month at 14:15'
  },
  {
    pattern: '0 9-17 * * 1-5',
    description: 'Runs every hour from 09:00 to 17:00, Monday through Friday'
  },
  {
    pattern: '0 12 */2 * *',
    description: 'Runs at 12:00 every other day'
  },
  {
    pattern: '0 0 1 1 *',
    description: 'Runs once a year – January 1st at 00:00'
  },
  {
    pattern: '0 0 * * 0',
    description: 'Runs every Sunday at 00:00'
  }
]

const invalidCronJobs = [
  {
    pattern: '60 * * * * *',
    description: 'Seconds field must be between 0–59'
  },
  {
    pattern: '* * 25 * * *',
    description: 'Minutes or hours must be within their valid range; 25 is outside the valid range for hours (0–23)'
  },
  {
    pattern: '* * 0 * * * *',
    description: 'Too many fields; croner allows only 6 fields (second, minute, hour, day, month, weekday)'
  },
  {
    pattern: '* * * 32 * *',
    description: 'Day of month must be 1–31'
  },
  {
    pattern: '* * * * 13 *',
    description: 'Month must be 1–12'
  },
  {
    pattern: '* * * * * 8',
    description: 'Day of week must be 0–7 (where 0 or 7 = Sunday); 8 is invalid'
  },
  {
    pattern: '* * * * * mon-fry',
    description: 'Unknown weekday'
  },
  {
    pattern: '*/0 * * * * *',
    description: 'Step value of 0 is not allowed'
  },
  {
    pattern: '* * *',
    description: 'Too few fields. Expects 5 or 6'
  },
  {
    pattern: '0 0 24 * * *',
    description: 'Hour value must be between 0–23; 24 is out of range'
  }
]

describe('croner.addJob', () => {
  test('returns a new Cron', () => {
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
})

describe('croner.isValidCron', () => {
  validCronJobs.forEach(({ pattern, description }) => {
    test(`returns true for valid cron pattern '${pattern}' - ${description}`, () => {
      expect(isValidCron(pattern)).toBeTruthy()
    })
  })

  invalidCronJobs.forEach(({ pattern, description }) => {
    test(`returns false for invalid cron pattern '${pattern}' - ${description}`, () => {
      expect(isValidCron(pattern)).toBeFalsy()
    })
  })
})
