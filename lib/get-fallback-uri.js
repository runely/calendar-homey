'use strict'

/**
 * @prop {import('homey').App} app App class init by Homey
 * @prop {String} uri Calendar URI
 */
module.exports = (app, uri) => {
  const protocolMatch = /https:\/\//gi.exec(uri) || /http:\/\//gi.exec(uri) || /webcal:\/\//gi.exec(uri) || []
  const protocol = protocolMatch.length > 0 ? protocolMatch[0] : ''
  const _protocol = protocol.toLowerCase()
  let fallbackProtocol
  if (_protocol === 'https://') {
    fallbackProtocol = 'http://'
  } else if (_protocol === 'http://') {
    fallbackProtocol = 'https://'
  } else if (_protocol === 'webcal://') {
    fallbackProtocol = 'webcal://'
  } else {
    fallbackProtocol = ''
  }
  const fallbackUri = uri.replace(protocol, fallbackProtocol)
  if (_protocol === fallbackProtocol) {
    app.warn(`get-fallback-uri: Fallback protocol not found for '${uri}'. Protocol: '${protocol}', Fallback protocol: '${fallbackProtocol}'`)
  }

  return {
    fallbackProtocol,
    fallbackUri,
    protocol
  }
}
