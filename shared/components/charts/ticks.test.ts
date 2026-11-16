import { createIntegerTicks } from "./ticks";

test("generates integer ticks for small count domains", () => {
  expect(createIntegerTicks([0, 3])).toEqual([0, 1, 2, 3]);
});
