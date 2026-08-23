import assert from "node:assert/strict";
import { test } from "node:test";

import { capitalize } from "../lib/capitalize.js";

const word: string = "wOrD";

test(`'${word}' will be capitalized to 'Word'`, () => {
  const capitalized: string = capitalize(word);
  assert.strictEqual(capitalized, "Word");
});
