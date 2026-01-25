import { getTokenValue } from "../lib/get-token-value.js";

const emptyValues: (string | undefined)[] = [
  "",
  undefined,
  " ",
  "\n",
  "\\n",
  "\n ",
  "\\n ",
  "\r",
  "\\r",
  "\r ",
  "\\r ",
  "\r\n",
  "\\r\\n",
  "\r\n ",
  "\\r\\n ",
  "\n\r",
  "\\n\\r",
  "\n\r ",
  "\\n\\r "
];

describe("Returns an empty string", () => {
  emptyValues.forEach((value: string | undefined) => {
    test(`When input is ${JSON.stringify(value)}`, () => {
      const result: string = getTokenValue(value);
      expect(result).toBe("");
    });
  });
});

test('Return input when its not in "emptyValue"s', () => {
  const result: string = getTokenValue("Party at 4");
  expect(result).toBe("Party at 4");
});
