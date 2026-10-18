import { renderToStaticMarkup } from "react-dom/server";
import { ArticleFieldList } from "./ArticleFieldList";
import { ArticleInlineText } from "./ArticleInlineText";

test("inline code remains escaped text and ordinary React content is preserved", () => {
  const markup = renderToStaticMarkup(
    <ArticleInlineText>
      {"Send `<script>alert(1)</script>` safely."}
    </ArticleInlineText>
  );
  expect(markup).toContain("&lt;script&gt;alert(1)&lt;/script&gt;</code>");
  expect(markup).not.toContain("<script>");
  expect(
    renderToStaticMarkup(
      <ArticleInlineText>
        <strong>Note</strong>
      </ArticleInlineText>
    )
  ).toBe("<strong>Note</strong>");
});

test("field lists render nested fields without depending on a generated contract", () => {
  const markup = renderToStaticMarkup(
    <ArticleFieldList
      fields={[
        {
          name: "data",
          type: "object",
          required: true,
          children: [
            {
              name: "id",
              type: "string",
              required: false,
              description: "A `UUID` value.",
              constraints: ["minLength: 1", "maxLength: 128"],
            },
          ],
        },
      ]}
    />
  );
  expect(markup).toContain("data</code>");
  expect(markup).toContain("id</code>");
  expect(markup).toContain("required");
  expect(markup).toContain("optional");
  expect(markup).toContain("UUID</code>");
  expect(markup).toContain("minLength: 1 · maxLength: 128");
});

test("inline Markdown renders emphasis, nested code, links, and escapes", () => {
  const markup = renderToStaticMarkup(
    <ArticleInlineText>
      {
        '**Use `X-API-Key`** with *care*, ~~old~~, [**API reference**](/document#gateway "API docs"), and \\*literal\\*.'
      }
    </ArticleInlineText>
  );
  expect(markup).toMatch(/<strong>Use <code[^>]*>X-API-Key<\/code><\/strong>/);
  expect(markup).toContain("<em>care</em>");
  expect(markup).toContain("<del>old</del>");
  expect(markup).toContain('href="/document#gateway" title="API docs"');
  expect(markup).toContain("<strong>API reference</strong></a>");
  expect(markup).toContain("and *literal*.");
  expect(markup).not.toContain("**");
});

test.each([
  "https://example.test/docs",
  "http://example.test/docs",
  "mailto:support@example.test",
  "/document#api-keys",
  "#gateway",
])("safe destination %s becomes a link", href => {
  const markup = renderToStaticMarkup(
    <ArticleInlineText>{`[Read more](${href})`}</ArticleInlineText>
  );
  expect(markup).toContain(`href="${href}"`);
  expect(markup).toContain(">Read more</a>");
});

test.each([
  "javascript:alert%281%29",
  "JaVaScRiPt:alert%281%29",
  "data:text/html,unsafe",
  "vbscript:msgbox%281%29",
  "file:///etc/passwd",
  "https://[invalid",
])("unsafe or invalid destination %s is not interactive", href => {
  const markup = renderToStaticMarkup(
    <ArticleInlineText>{`[**Read more**](${href})`}</ArticleInlineText>
  );
  expect(markup).toBe("<strong>Read more</strong>");
});

test("HTML is escaped and inline code never becomes markup or an image request", () => {
  const markup = renderToStaticMarkup(
    <ArticleInlineText>
      {
        "**<text>** <img src=x onerror=alert(1)> `**literal** [link](https://example.test)` ![preview](https://example.test/image.png)"
      }
    </ArticleInlineText>
  );
  expect(markup).toContain("<strong>&lt;text&gt;</strong>");
  expect(markup).toContain("&lt;img");
  expect(markup).not.toContain("<img");
  expect(markup).toContain("**literal** [link](https://example.test)</code>");
  expect(markup).not.toContain("href=");
});
