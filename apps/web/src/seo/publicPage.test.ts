import {
  createLlmsTxt,
  createPrivatePageHead,
  createPublicPageHead,
  createRobotsTxt,
  createSitemapXml,
  isPublicSiteIndexable,
  privatePathPrefixes,
  publicFaqs,
  publicPages,
  publicSiteOrigin,
} from "./publicPage";

test("indexes only the production origin", () => {
  expect(isPublicSiteIndexable(publicSiteOrigin)).toBe(true);
  expect(isPublicSiteIndexable(`${publicSiteOrigin}/`)).toBe(true);
  expect(isPublicSiteIndexable("https://preview.notegic.com")).toBe(false);
  expect(isPublicSiteIndexable(undefined)).toBe(false);
  expect(isPublicSiteIndexable("")).toBe(false);
});

test("publishes one canonical URL for every public page", () => {
  const descriptions = new Set<string>();
  for (const page of publicPages) {
    expect(page.description.trim().length).toBeGreaterThan(0);
    expect(descriptions.has(page.description)).toBe(false);
    descriptions.add(page.description);

    const head = createPublicPageHead(page.path);
    const canonical = head.links.find(link => link.rel === "canonical");
    expect(canonical?.href.startsWith(`${publicSiteOrigin}/`)).toBe(true);
    expect(head.meta).toContainEqual({
      name: "robots",
      content: "index, follow",
    });
    expect(head.meta).toContainEqual({ title: page.title });
    expect(
      privatePathPrefixes.some(prefix => page.path.startsWith(prefix))
    ).toBe(false);
  }
});

test("keeps FAQ structured data identical to the visible answers", () => {
  const head = createPublicPageHead("/");
  const structuredData = JSON.parse(head.scripts[0]?.children ?? "{}") as {
    "@graph"?: Array<{ "@type"?: string; mainEntity?: unknown }>;
  };
  const faqPage = structuredData["@graph"]?.find(
    item => item["@type"] === "FAQPage"
  );
  expect(faqPage).toMatchObject({
    mainEntity: publicFaqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  });
});

test("lists only public URLs in the sitemap and llms.txt", () => {
  const sitemap = createSitemapXml();
  const llms = createLlmsTxt();
  for (const page of publicPages) {
    const url =
      page.path === "/"
        ? `${publicSiteOrigin}/`
        : `${publicSiteOrigin}${page.path}`;
    expect(sitemap).toContain(`<loc>${url}</loc>`);
    expect(llms).toContain(url);
  }
  for (const prefix of privatePathPrefixes) {
    expect(sitemap).not.toContain(`${publicSiteOrigin}${prefix}`);
    expect(llms).not.toContain(`${publicSiteOrigin}${prefix}`);
  }
});

test("hides preview and local hosts from crawlers", () => {
  expect(createRobotsTxt(false)).toBe("User-agent: *\nDisallow: /\n");

  const production = createRobotsTxt(true);
  expect(production).toContain("Allow: /");
  expect(production).toContain(`Sitemap: ${publicSiteOrigin}/sitemap.xml`);
  for (const prefix of privatePathPrefixes) {
    expect(production).toContain(`Disallow: ${prefix}`);
  }
});

test("marks private routes noindex", () => {
  expect(createPrivatePageHead()).toEqual({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  });
});
