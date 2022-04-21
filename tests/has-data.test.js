'use strict'

const hasData = require('../lib/has-data')

const falsy = [
  undefined,
  null
]

const truthy = [
  true,
  0,
  1,
  false,
  [],
  {},
  '',
  'hey'
]

describe('Return false', () => {
  falsy.forEach(value => {
    test(`When data is ${JSON.stringify(value)}`, () => {
      const result = hasData(value)
      expect(result).toBeFalsy()
    })
  })
})

describe('Return true', () => {
  truthy.forEach(value => {
    test(`When data is ${JSON.stringify(value)}`, () => {
      const result = hasData(value)
      expect(result).toBeTruthy()
    })
  })
})
