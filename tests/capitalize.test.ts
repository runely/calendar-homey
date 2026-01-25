import { capitalize } from "../lib/capitalize.js";

const word: string = "wOrD";

test(`'${word}' will be capitalized to 'Word'`, () => {
  const capitalized: string = capitalize(word);
  expect(capitalized).toBe("Word");
});
