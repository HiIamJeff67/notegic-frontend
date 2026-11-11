# Public site indexing

Notegic publishes a small set of pages for search engines and answer engines.
Private workspace routes stay out of the index. This is the frontend half of
[NOT-139](https://linear.app/notegic/issue/NOT-139/beta-部署後完成-seo-與-aeo-基礎建置及驗收).
Search Console, Bing, and the apex-to-www redirect wait until
`https://www.notegic.com` is publicly reachable.

## Ownership

`apps/web/src/seo/publicPage.ts` owns the public page catalog, canonical URLs,
document head, JSON-LD, `robots.txt`, `sitemap.xml`, and `llms.txt`. Route
files call that module. They do not each invent a second title or description.

The production origin is `https://www.notegic.com`. Canonical URLs, Open Graph
URLs, the sitemap, and `llms.txt` always use that origin. Set the production
Cloudflare Workers Builds build variable `VITE_PUBLIC_SITE_ORIGIN` to exactly
`https://www.notegic.com`, with no trailing slash. The domain already existing
does not embed that value into the build. Any other value, including local
development and preview, returns `Disallow: /`.

`publicPages` is the editable list of indexed URLs, titles, and descriptions.
`privatePathPrefixes` is the editable list blocked by `robots.txt`. Adding or
removing a public page means changing that list and the route that calls
`createPublicPageHead`. `robots.txt`, `sitemap.xml`, and `llms.txt` are
responses from those routes, not files placed in `public/`.

## Indexed pages

| Path | Role |
| --- | --- |
| `/` | Product definition, visible FAQ, and links to the other public pages |
| `/document` | Existing English website, API, version, and policy guide |
| `/privacy-policy` | Privacy policy |
| `/eula` | Commercial license, rendered from `LICENSE.md` |
| `/data-deletion` | Existing public account-deletion instructions |
| `/contact` | Contact explanation and mailto link |

`/app`, sign-in, registration, password reset, OAuth redirects, `/playground`,
and unknown URLs send `noindex, nofollow` and are absent from the sitemap.

The home page keeps the existing Get Started and View Docs buttons. Crawlable
links are additional anchors. The Website guide is not rewritten.

## Structured data

JSON-LD repeats only text that the page renders. The home page emits
`WebSite`, `SoftwareApplication`, `WebPage`, and `FAQPage`. Other public pages
emit `WebPage`. The FAQ answers are the `publicFaqs` strings rendered on the
home page.

## Verification

`apps/web/src/seo/publicPage.test.ts` checks the catalog, canonical host,
FAQ parity, sitemap membership, and the preview robots rule. A production
check still has to request the deployed origin and confirm the SSR HTML,
`robots.txt`, and `sitemap.xml`.
