import { renderToStaticMarkup } from "react-dom/server";
import PrismCode from "./PrismCode";

jest.mock("@/global/styles/prism-code.css", () => ({}));

test("the copy button is outside the scrolling code and follows the active language", () => {
  const markup = renderToStaticMarkup(
    <PrismCode
      title="Example"
      defaultLanguage="http"
      code={{
        curl: "curl https://example.test",
        http: "GET /example HTTP/1.1",
      }}
    />
  );

  expect(markup).toContain("</pre><button");
  expect(markup).toContain('aria-label="Copy code"');
  expect(markup).toContain("relative m-0 min-w-0");
  expect(markup).toContain("absolute top-2 right-2");
  expect(markup).toContain("/example");
  expect(markup).not.toContain("curl https://example.test");
});

test("server rendering escapes code before browser-only grammars are loaded", () => {
  const markup = renderToStaticMarkup(
    <PrismCode code={{ http: "<script>alert(1)</script>" }} />
  );
  expect(markup).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(markup).not.toContain("<script>");
});
