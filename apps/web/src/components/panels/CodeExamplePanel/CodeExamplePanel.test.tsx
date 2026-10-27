import { renderToStaticMarkup } from "react-dom/server";
import CodeExamplePanel from "./CodeExamplePanel";

test("uses shadcn Tabs and CodeBlock and server-renders only the default format", () => {
  const markup = renderToStaticMarkup(
    <CodeExamplePanel
      title="Example"
      defaultLanguage="http"
      code={{
        curl: "curl https://example.test",
        http: "GET /example HTTP/1.1",
      }}
    />
  );
  expect(markup).toContain('role="tablist"');
  expect(markup).toContain('role="tab"');
  expect(markup).toContain('data-slot="code-block"');
  expect(markup).toContain('data-slot="code-block-content"');
  expect(markup).toContain('data-slot="code-block-copy-button"');
  expect(markup).toContain('aria-label="Copy code"');
  expect(markup).toContain("/example");
  expect(markup).not.toContain("curl https://example.test");
});

test("SSR escapes code while syntax highlighting has not loaded", () => {
  const markup = renderToStaticMarkup(
    <CodeExamplePanel code={{ http: "<script>alert(1)</script>" }} />
  );
  expect(markup).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(markup).not.toContain("<script>");
  expect(markup).not.toContain('role="tablist"');
  expect(markup).not.toContain('role="tabpanel"');
});

test("supports an empty code string and hides an empty example collection", () => {
  expect(renderToStaticMarkup(<CodeExamplePanel code={{}} />)).toBe("");
  const markup = renderToStaticMarkup(
    <CodeExamplePanel code={{ http: "", json: "{}" }} defaultLanguage="http" />
  );
  expect(markup).toContain('data-slot="code-block"');
  expect(markup).not.toContain("{}");
});
