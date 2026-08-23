import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getFallbackUri } from "../lib/get-fallback-uri.js";
import type { FallbackUri } from "../types/IcalCalendar.type";
import { constructedApp } from "./lib/construct-app";

type SucceedTest = {
  name: string;
  protocol: string;
  expectedFallbackProtocol: string;
};

type FailTest = {
  name: string;
  protocol: string;
};

const succeedTests: SucceedTest[] = [
  {
    name: "https",
    protocol: "https://",
    expectedFallbackProtocol: "http://"
  },
  {
    name: "http",
    protocol: "http://",
    expectedFallbackProtocol: "https://"
  },
  {
    name: "webcal",
    protocol: "webcal://",
    expectedFallbackProtocol: "webcal://"
  },
  {
    name: "HTTPS",
    protocol: "HTTPS://",
    expectedFallbackProtocol: "http://"
  },
  {
    name: "HTTP",
    protocol: "HTTP://",
    expectedFallbackProtocol: "https://"
  },
  {
    name: "WEBCAL",
    protocol: "WEBCAL://",
    expectedFallbackProtocol: "webcal://"
  }
];

const failTests: FailTest[] = [
  {
    name: "spotify",
    protocol: "spotify://"
  },
  {
    name: "msteams",
    protocol: "msteams://"
  }
];

describe("fallback uri found for protocol", () => {
  succeedTests.forEach(({ name, protocol, expectedFallbackProtocol }: SucceedTest) => {
    test(name, () => {
      const uri: string = `${protocol}test.com`;
      const fallback: FallbackUri = getFallbackUri(constructedApp, uri);

      assert.strictEqual(fallback.fallbackProtocol, expectedFallbackProtocol);
      assert.strictEqual(fallback.fallbackUri, uri.replace(protocol, expectedFallbackProtocol));
      assert.strictEqual(fallback.protocol, protocol);
    });
  });
});

describe('fallback uri should be equal to uri, fallbackProtocol and protocol should be "" for protocol', () => {
  failTests.forEach(({ name, protocol }: FailTest) => {
    test(name, () => {
      const uri: string = `${protocol}test.com`;
      const fallback: FallbackUri = getFallbackUri(constructedApp, uri);

      assert.strictEqual(fallback.fallbackProtocol, "");
      assert.strictEqual(fallback.fallbackUri, uri);
      assert.strictEqual(fallback.protocol, "");
    });
  });
});
