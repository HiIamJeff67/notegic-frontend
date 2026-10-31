import { compare } from "./compare";

test("matches UTF-8 byte ordering for ASCII, Unicode, emoji, prefixes and empty text", () => {
  const values = ["🌱", "\uE000", "中文", "é", "A", "a", "aa", ""];
  const expected = [...values].sort((left, right) =>
    Buffer.compare(Buffer.from(left), Buffer.from(right))
  );
  expect([...values].sort(compare)).toEqual(expected);
  expect(compare("same", "same")).toBe(0);
});
