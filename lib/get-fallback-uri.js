'use strict'

/**
 * @prop {Homey.App} app App class inited by Homey
 * @prop {String} uri Calendar URI
 */
module.exports = (app, uri) => {
  const protocolMatch = /https:\/\//gi.exec(uri) || /http:\/\//gi.exec(uri) || /webcal:\/\//gi.exec(uri) || []
  const protocol = protocolMatch.length > 0 ? protocolMatch[0] : ''
  const _protocol = protocol.toLowerCase()
  const fallbackProtocol = _protocol === 'https://'
    ? 'http://'
    : _protocol === 'http://'
      ? 'https://'
      : _protocol === 'webcal://'
        ? 'webcal://'
        : ''
  const fallbackUri = uri.replace(protocol, fallbackProtocol)
  if (_protocol === fallbackProtocol) {
    app.log(`get-fallback-uri: Fallback protocol not found for '${uri}'. Protocol: '${protocol}', Fallback protocol: '${fallbackProtocol}'`)
  }

  return {
    fallbackProtocol,
    fallbackUri,
    protocol
  }
}
