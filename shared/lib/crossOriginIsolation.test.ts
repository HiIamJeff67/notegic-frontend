import {
  getCrossOriginIsolationHeaders,
  requiresCrossOriginIsolation,
} from "./crossOriginIsolation";

test.each([
  ["/document", "/", false],
  ["/document/", "/", false],
  ["/development/v1/document", "/development/v1/", false],
  ["/development/v1/document/", "development/v1", false],
  ["/", "/", true],
  ["/login", "/", true],
  ["/app/dashboard", "/", true],
  ["/app/document", "/", true],
  ["/document-other", "/", true],
  ["/document/other", "/", true],
  ["/development/v1/app/dashboard", "/development/v1/", true],
  ["/other/document", "/development/v1/", true],
])("isolation for %s under %s is %s", (pathname, basePath, expected) => {
  expect(requiresCrossOriginIsolation(pathname, basePath)).toBe(expected);
  expect(getCrossOriginIsolationHeaders(pathname, basePath)).toEqual({
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": expected ? "require-corp" : "unsafe-none",
  });
});
