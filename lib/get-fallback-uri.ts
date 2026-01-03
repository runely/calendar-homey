import { App } from "homey";

import { FallbackUri } from "../types/IcalCalendar.type";

export const getFallbackUri = (app: App, uri: string): FallbackUri => {
  const protocolMatch: RegExpExecArray | null = /https:\/\//gi.exec(uri) || /http:\/\//gi.exec(uri) || /webcal:\/\//gi.exec(uri) || null;
  const protocol: string = protocolMatch && protocolMatch.length > 0 ? protocolMatch[0] : '';
  const protocolLowered: string = protocol.toLowerCase();

  let fallbackProtocol: string = '';
  if (protocolLowered === 'https://') {
    fallbackProtocol = 'http://'
  } else if (protocolLowered === 'http://') {
    fallbackProtocol = 'https://'
  } else if (protocolLowered === 'webcal://') {
    fallbackProtocol = 'webcal://'
  }

  const fallbackUri: string = uri.replace(protocol, fallbackProtocol);
  if (protocolLowered === fallbackProtocol) {
    app.log(`[WARN] getFallbackUri: Fallback protocol not found for '${uri}'. Protocol: '${protocol}', Fallback protocol: '${fallbackProtocol}'`);
  }

  return {
    fallbackProtocol,
    fallbackUri,
    protocol
  };
}
