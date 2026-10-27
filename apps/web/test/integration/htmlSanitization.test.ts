import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import type { DOMPurify } from "dompurify";
import { marked } from "marked";

declare global {
  interface Window {
    DOMPurify: DOMPurify;
  }
}

describe("DOMPurify rendering boundaries in Chromium", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setContent("<main></main>");
    await page.addScriptTag({
      path: path.join(path.dirname(require.resolve("dompurify")), "purify.js"),
    });
  });

  afterEach(async () => {
    await page?.close();
  });

  afterAll(async () => {
    await browser?.close();
  });

  it("preserves ScratchPad Markdown while stripping executable HTML and URLs", async () => {
    const html = marked.parse(
      '## Memo\n\n**Keep this** [Reference](https://example.test/)\n\n<script>throw new Error("unsafe")</script><img onerror="alert(1)"><a href="javascript:alert(1)">Unsafe</a>'
    ) as string;
    const result = await page.evaluate(raw => {
      const root = document.querySelector("main")!;
      root.innerHTML = window.DOMPurify.sanitize(raw);
      return {
        heading: root.querySelector("h2")?.textContent,
        bold: root.querySelector("strong")?.textContent,
        link: root.querySelector("a")?.getAttribute("href"),
        scriptCount: root.querySelectorAll("script").length,
        handler: root.querySelector("img")?.getAttribute("onerror"),
        unsafeLink: root.querySelectorAll("a")[1]?.getAttribute("href"),
      };
    }, html);
    expect(result).toEqual({
      heading: "Memo",
      bold: "Keep this",
      link: "https://example.test/",
      scriptCount: 0,
      handler: null,
      unsafeLink: null,
    });
  });

  // GHSA-mrv2-3pqr-j5jr: detached nodes must not retain executable handlers.
  it.each([
    "parent",
    "sibling",
  ] as const)("neutralizes a subtree detached by an IN_PLACE %s hook", async mode => {
    const handler = await page.evaluate(removal => {
      const root = document.createElement("div");
      root.innerHTML =
        '<figure><img data-remove="true"><img onerror="alert(1)"></figure><p>Keep</p>';
      document.body.append(root);
      const target = root.querySelectorAll("img")[1];
      window.DOMPurify.addHook("afterSanitizeAttributes", node => {
        if (node.getAttribute("data-remove") !== "true") return;
        if (removal === "parent") node.parentElement?.remove();
        else node.nextElementSibling?.remove();
      });
      window.DOMPurify.sanitize(root, { IN_PLACE: true });
      return target.getAttribute("onerror");
    }, mode);
    expect(handler).toBeNull();
  });

  // GHSA-cg2g-xh64-v4q7: stripping a separator must not join a template payload.
  it("scrubs split template expressions inside attached shadow roots", async () => {
    const text = await page.evaluate(() => {
      const host = document.createElement("div");
      const shadow = host.attachShadow({ mode: "open" });
      shadow.append(
        document.createTextNode("$"),
        document.createElement("object"),
        document.createTextNode("{7*7}")
      );
      window.DOMPurify.sanitize(host, {
        IN_PLACE: true,
        SAFE_FOR_TEMPLATES: true,
      });
      shadow.normalize();
      return shadow.textContent;
    });
    expect(text).not.toContain("${7*7}");
  });

  // GHSA-c6gr-qvv4-5v3f: XHTML attribute casing must not bypass the SVG guard.
  it("rejects SVG href animation in XHTML mode", async () => {
    const attribute = await page.evaluate(() => {
      const clean = window.DOMPurify.sanitize(
        '<svg xmlns="http://www.w3.org/2000/svg"><a><animate attributeName="href" values="x;javascript:alert(1)" /></a></svg>',
        {
          PARSER_MEDIA_TYPE: "application/xhtml+xml",
          ADD_TAGS: ["animate"],
          ADD_ATTR: ["attributeName", "values"],
        }
      );
      return new DOMParser()
        .parseFromString(clean, "application/xml")
        .querySelector("animate")
        ?.getAttribute("attributeName");
    });
    expect(attribute).toBeNull();
  });
});
