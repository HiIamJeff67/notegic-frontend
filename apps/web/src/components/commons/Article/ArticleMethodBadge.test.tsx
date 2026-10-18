import { renderToStaticMarkup } from "react-dom/server";
import { ArticleMethodBadge } from "./ArticleMethodBadge";

test.each([
  ["GET", "bg-http-get/15 text-http-get-foreground"],
  ["DELETE", "bg-destructive/10 text-destructive"],
  ["POST", "bg-http-post/15 text-http-post-foreground"],
  ["PATCH", "bg-http-patch/15 text-http-patch-foreground"],
  ["PUT", "bg-http-put/15 text-http-put-foreground"],
  ["OPTIONS", "bg-muted text-muted-foreground"],
])("HTTP %s uses theme tokens and retains its visible name", (method, tone) => {
  const markup = renderToStaticMarkup(<ArticleMethodBadge method={method} />);
  expect(markup).toContain(tone);
  expect(markup).toContain(`>${method}</span>`);
});

test("the API table can choose a larger size without duplicating method styles", () => {
  const markup = renderToStaticMarkup(
    <ArticleMethodBadge method="GET" className="min-w-14 py-1 text-sm" />
  );
  expect(markup).toContain("min-w-14 py-1 text-sm");
  expect(markup).toContain("bg-http-get/15 text-http-get-foreground");
  expect(markup).not.toContain("text-[10px]");
});
