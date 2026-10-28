import { codeLanguages, getCodeLanguage } from "./codeHighlighter";

test("resolves supported code languages and legacy aliases without changing stored values", () => {
  for (const [language, { aliases }] of Object.entries(codeLanguages)) {
    expect(getCodeLanguage(language)).toBe(language);
    for (const alias of aliases) expect(getCodeLanguage(alias)).toBe(language);
  }
  expect(getCodeLanguage(" TS ")).toBe("typescript");
  expect(getCodeLanguage("BASH")).toBe("shellscript");
});

test.each([
  "",
  "unknown-language",
  "constructor",
  "__proto__",
  "toString",
])("leaves unsupported language %s without a grammar", language =>
  expect(getCodeLanguage(language)).toBeUndefined());
