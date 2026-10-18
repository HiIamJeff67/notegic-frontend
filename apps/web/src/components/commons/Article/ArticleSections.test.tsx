import { renderToStaticMarkup } from "react-dom/server";
import { ArticleDisplayContext } from "./ArticleContext";
import ArticleSettingItem from "./ArticleSettingItem";
import {
  ArticleParagraph,
  ArticleParagraphSeparator,
  ArticleSubParagraph,
  ArticleSubParagraphSeparator,
} from "./ArticleSections";

test("paragraph and subparagraph separators keep separate semantic hierarchy", () => {
  const paragraph = renderToStaticMarkup(<ArticleParagraphSeparator />);
  const subparagraph = renderToStaticMarkup(
    <ArticleSubParagraphSeparator className="w-full" />
  );
  expect(paragraph).toContain('data-article-separator="paragraph"');
  expect(paragraph).toContain("border-t-2 border-foreground/20");
  expect(paragraph).toContain("my-8");
  expect(paragraph).not.toContain("mb-6");
  expect(paragraph).toContain(
    "max-w-[calc(var(--article-reading-width,100%)+2rem)]"
  );
  expect(subparagraph).toContain('data-article-separator="subparagraph"');
  expect(subparagraph).toContain(
    "max-w-[min(calc(100%-2rem),var(--article-reading-width,100%))]"
  );
  expect(subparagraph).toContain("bg-foreground/10");
});

test("automatic subparagraph separators stay inset and are only inserted between siblings", () => {
  const markup = renderToStaticMarkup(
    <ArticleSubParagraph>Content</ArticleSubParagraph>
  );
  expect(markup).toContain("[&amp;+&amp;]:before:w-[calc(100%-2rem)]");
  expect(markup).toContain(
    "[&amp;+&amp;]:before:max-w-(--article-reading-width)"
  );
  expect(markup).not.toContain("before:mx-4");
  expect(markup).not.toContain("after:");
  expect(markup).toContain("[&amp;:has(+&amp;)]:mb-0");
  expect(markup).toContain(
    "[&amp;+&amp;]:before:my-(--article-separator-spacing)"
  );
});

test("automatic and explicit separators shrink with nesting and reset for siblings", () => {
  const markup = renderToStaticMarkup(
    <>
      <ArticleSubParagraph level={3}>
        <div>
          <ArticleSubParagraph>
            <ArticleSubParagraph>
              <ArticleSubParagraphSeparator />
            </ArticleSubParagraph>
          </ArticleSubParagraph>
        </div>
        <ArticleSubParagraphSeparator />
      </ArticleSubParagraph>
      <ArticleSubParagraphSeparator />
    </>
  );
  expect(
    Array.from(
      markup.matchAll(/--article-separator-spacing:([^;\"]+)/g),
      match => match[1]
    )
  ).toEqual(["1.5rem", "1rem", "0.75rem", "0.5rem", "1rem", "1.5rem"]);
});

test("deeply nested separators keep a minimum readable gap", () => {
  let content = <ArticleSubParagraphSeparator />;
  for (let depth = 0; depth < 10; depth++) {
    content = <ArticleSubParagraph>{content}</ArticleSubParagraph>;
  }
  const gaps = Array.from(
    renderToStaticMarkup(content).matchAll(
      /--article-separator-spacing:([^;\"]+)/g
    ),
    match => Number.parseFloat(match[1])
  );
  expect(gaps).toEqual([1.5, 1, 0.75, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
});

test("sections own their padding independently of separators and allow overrides", () => {
  expect(renderToStaticMarkup(<ArticleParagraph />)).toContain("py-4");
  expect(renderToStaticMarkup(<ArticleSubParagraph />)).toContain("py-2");
  for (const Section of [ArticleParagraph, ArticleSubParagraph]) {
    const markup = renderToStaticMarkup(
      <Section paddingBlock={24} style={{ paddingBottom: 12 }}>
        Content
      </Section>
    );
    expect(markup).toContain("padding-block:24px");
    expect(markup).toContain("padding-bottom:12px");
    expect(markup).not.toContain("paddingBlock=");
    expect(renderToStaticMarkup(<Section paddingBlock={0} />)).toContain(
      "padding-block:0"
    );
  }
});

test.each([
  true,
  false,
])("separator fullWidth=%s only changes line paint", fullWidth => {
  for (const Separator of [
    ArticleParagraphSeparator,
    ArticleSubParagraphSeparator,
  ]) {
    const markup = renderToStaticMarkup(<Separator fullWidth={fullWidth} />);
    expect(markup.includes("shadow-[0_0_0_100vmax]")).toBe(fullWidth);
    expect(markup.includes("[clip-path:inset(0_-100vmax)]")).toBe(fullWidth);
    expect(markup).not.toContain("fullWidth=");
  }
  const subparagraph = renderToStaticMarkup(
    <ArticleSubParagraph separatorFullWidth={fullWidth}>
      Content
    </ArticleSubParagraph>
  );
  expect(
    subparagraph.includes("[&amp;+&amp;]:before:shadow-[0_0_0_100vmax]")
  ).toBe(fullWidth);
  expect(subparagraph).not.toContain("separatorFullWidth=");
  expect(subparagraph).not.toContain("after:");
});

test("paragraph separators remain hidden in paginated articles", () => {
  const markup = renderToStaticMarkup(
    <ArticleDisplayContext.Provider
      value={{
        mode: "pagination",
        pageId: "website",
        setPageId: () => {},
        activeItemId: "website",
        setActiveItemId: () => {},
        headerLinks: [],
      }}
    >
      <ArticleParagraphSeparator fullWidth />
    </ArticleDisplayContext.Provider>
  );
  expect(markup).toBe("");
});

test("settings keep the final row free of a trailing subparagraph separator", () => {
  const markup = renderToStaticMarkup(
    <>
      <ArticleSettingItem title="First">
        <span>Value</span>
      </ArticleSettingItem>
      <ArticleSettingItem title="Last" hideSeparator>
        <span>Value</span>
      </ArticleSettingItem>
    </>
  );
  expect(markup.match(/data-article-separator="subparagraph"/g)).toHaveLength(
    1
  );
});
