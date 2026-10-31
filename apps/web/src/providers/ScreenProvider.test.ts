import { getBreakpoint } from "./ScreenProvider";

test.each([
  [0, "base"],
  [639, "base"],
  [640, "sm"],
  [767, "sm"],
  [768, "md"],
  [1023, "md"],
  [1024, "lg"],
  [1279, "lg"],
  [1280, "xl"],
  [1535, "xl"],
  [1536, "2xl"],
  [1919, "2xl"],
  [1920, "3xl"],
] as const)("width %s maps to %s", (width, breakpoint) => {
  expect(getBreakpoint(width)).toBe(breakpoint);
});
