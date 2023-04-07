'use strict'

const getFallbackUri = require('../lib/get-fallback-uri')

const app = {
  log: console.log
}

const succeedTests = [
  {
    name: 'https',
    protocol: 'https://',
    expectedFallbackProtocol: 'http://'
  },
  {
    name: 'http',
    protocol: 'http://',
    expectedFallbackProtocol: 'https://'
  },
  {
    name: 'webcal',
    protocol: 'webcal://',
    expectedFallbackProtocol: 'webcal://'
  },
  {
    name: 'HTTPS',
    protocol: 'HTTPS://',
    expectedFallbackProtocol: 'http://'
  },
  {
    name: 'HTTP',
    protocol: 'HTTP://',
    expectedFallbackProtocol: 'https://'
  },
  {
    name: 'WEBCAL',
    protocol: 'WEBCAL://',
    expectedFallbackProtocol: 'webcal://'
  }
]

const failTests = [
  {
    name: 'spotify',
    protocol: 'spotify://'
  },
  {
    name: 'msteams',
    protocol: 'msteams://'
  }
]

describe('fallback uri found for protocol', () => {
  succeedTests.forEach(({ name, protocol, expectedFallbackProtocol }) => {
    test(name, () => {
      const uri = `${protocol}test.com`
      const fallback = getFallbackUri(app, uri)

      expect(typeof fallback).toBe('object')
      expect(fallback.fallbackProtocol).toBe(expectedFallbackProtocol)
      expect(fallback.fallbackUri).toBe(uri.replace(protocol, expectedFallbackProtocol))
      expect(fallback.protocol).toBe(protocol)
    })
  })
})

describe('fallback uri should be equal to uri, fallbackProtocol and protocol should be "" for protocol', () => {
  failTests.forEach(({ name, protocol }) => {
    test(name, () => {
      const uri = `${protocol}test.com`
      const fallback = getFallbackUri(app, uri)

      expect(typeof fallback).toBe('object')
      expect(fallback.fallbackProtocol).toBe('')
      expect(fallback.fallbackUri).toBe(uri)
      expect(fallback.protocol).toBe('')
    })
  })
})
