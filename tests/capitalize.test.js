'use strict'

const capitalize = require('../lib/capitalize')
const word = 'wOrD'

test(`'${word}' will be capitalized to 'Word'`, () => {
  const capitalized = capitalize(word)
  expect(capitalized).toBe('Word')
})
