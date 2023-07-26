'use strict'

const getTokenValue = require('../lib/get-token-value')

const emptyValues = [
  '',
  undefined,
  null,
  false,
  0,
  ' ',
  '\n',
  '\\n',
  '\n ',
  '\\n ',
  '\r',
  '\\r',
  '\r ',
  '\\r ',
  '\r\n',
  '\\r\\n',
  '\r\n ',
  '\\r\\n ',
  '\n\r',
  '\\n\\r',
  '\n\r ',
  '\\n\\r '
]

describe('Returns an empty string', () => {
  emptyValues.forEach((value) => {
    test(`When input is ${JSON.stringify(value)}`, () => {
      const result = getTokenValue(value)
      expect(result).toBe('')
    })
  })
})

test('Return input when its not in "emptyValue"s', () => {
  const result = getTokenValue('Party at 4')
  expect(result).toBe('Party at 4')
})
