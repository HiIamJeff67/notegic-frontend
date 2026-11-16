import { isColor } from "./color";

test("accepts a six-digit hex color and rejects other strings", () => {
  expect(isColor("#64748b")).toBe(true);
  expect(isColor("#AABBCC")).toBe(true);
  expect(isColor("#aabbcc")).toBe(true);
  expect(isColor("#fff")).toBe(false);
  expect(isColor("64748b")).toBe(false);
  expect(isColor("#64748bff")).toBe(false);
  expect(isColor("")).toBe(false);
});
