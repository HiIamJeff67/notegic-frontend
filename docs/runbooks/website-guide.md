# Website guide

## Complete document page inputs

`apps/web/src/pages/document/DocumentPage.tsx` composes the public `/document`
page. Website, Versions, Privacy and API reference content is generated from
page-owned sources; the complete page is rendered from local React components
through SSR. Run `npm run generate:document` to regenerate them all.

| Section | Authored inputs | Generated output or runtime owner |
| --- | --- | --- |
| Overview | `apps/web/src/pages/document/overview/Overview.tsx` | Same component |
| Website | `website/sources/website.md`, local images/GIFs under `apps/web/assets/document/`, `scripts/generateWebsiteGuide.mjs` | `website/WebsiteContent.tsx` and `website/generated.ts`; owned by `website/Website.tsx` |
| API | Six `@`-prefixed upstream files directly under `api/sources/`, `scripts/generatePublicApiData.mjs` | `api/generated.ts`; rendered by `api/API.tsx`, `EndpointTable.tsx` and `EndpointDetails.tsx` |
| API key guidance | `api/APIKey.tsx` | Subcomponent of `api/API.tsx`, not a separate tab |
| Versions | `versions/sources/versions.md`, `scripts/generateDocumentSections.mjs` | `versions/generated.ts` and `versions/VersionsContent.tsx`; owned by `versions/Versions.tsx` and the existing `VersionCard` UI |
| Privacy and policy | `privacy-policy/sources/privacy-policy.md`, `scripts/generateDocumentSections.mjs` | `privacy-policy/generated.ts` and `PrivacyPolicyContent.tsx`; owned by `PrivacyPolicy.tsx`; standalone `/privacy-policy` retains its existing translations |
| Shared layout | `apps/web/src/components/commons/Article/`, project UI primitives, `apps/web/src/global/styles/article.css` and global styles | Shared Article layout, navigation and media components |

Tab-relative paths above are under `apps/web/src/pages/document/`. Keep each
tab flat except for its `sources/` folder. Generated data uses `generated.ts`;
generated JSX uses `<Tab>Content.tsx`, inserted by `<Tab>.tsx`. README files
exist only inside `sources/`. Do not add another role or folder layer without
explicit user agreement; see the [naming convention](../conventions/04-file-and-folder-naming.md#naming-boundaries).

The API rule `apps/web/src/pages/document/api/sources/@versioning.md` is a backend
reference about contract versioning. The product Versions roadmap above is
frontend-authored; it is not a backend reference copy.

All module imports and generation inputs belong to this frontend repository;
neither generator nor page rendering requires a sibling backend checkout.
External video URLs are embedded provider resources, not local module imports.
Normal npm dependencies are installed through the project package manifest.

For backend reference provenance and refresh instructions, see
[Public API documentation snapshot](../designs/routes/frontend-contracts-and-codegen.md#public-api-documentation-snapshot).
Run `npm run generate:document` after updating inputs. The Website and API
generators also retain their narrower commands. Builds consume generated output;
they do not automatically synchronize external sources or run these generators.

## Versions and privacy generation

`versions.md` uses `## 0.0.0 — Next`, `Current` or `Legacy` headings, followed by
one description and a feature checklist. Each checkbox has a bold feature title
and its description on the next line. Generation preserves the card, ring,
feature expansion and existing `version-0-0-0` anchors.

`privacy-policy.md` contains the existing English policy text and update date.
Keep `{#privacy-id}` on each level-two heading so existing links remain stable.
Blockquotes mark secondary explanatory paragraphs; unordered lists and inline
links are supported. The contact link uses
`[{{contactEmail}}](mailto:{{contactEmail}})` and is populated from the existing
`VITE_CONTACT_EMAIL` at runtime, not captured by the generator. The EULA link
uses the existing `ArticleLink` navigation component.

The sections generator validates both sources before writing its outputs and
rejects unsupported Markdown, duplicate anchors and malformed version entries.
It escapes text rather than executing Markdown HTML. Keep document content in
English; the standalone privacy page still owns its translated policy. When
the policy meaning changes, review both content owners and translations rather
than assuming generation updates the standalone policy automatically.

## Website generation

The documentation page's Website section is authored in
`apps/web/src/pages/document/website/sources/website.md` and is published in English.

Run `npm run generate:website-guide` explicitly after changes. It compiles
the English document to `WebsiteContent.tsx` and `generated.ts` under
`apps/web/src/pages/document/website/`. Unsupported Markdown, missing media,
or invalid links stop generation before output is
written. Review and commit the sources and generated files together; do not
edit generated TSX or parse Markdown during page rendering.

The guide currently supports English only. Keep the generated filename and
component language-neutral; do not add locale variants or language-selection
infrastructure. `website/Website.tsx` owns the Article section and imports the
generated `WebsiteContent`. Keep `lang="en"` on that content regardless of the
application UI language.

Adjacent sections use Article's automatic separators. A Markdown thematic break
at the same boundary does not produce a second line; thematic breaks within
section content remain explicit separators. The generator sets
`separatorFullWidth` on sections and `fullWidth` on explicit separators to match
the other documentation sections. Article keeps paragraph separators at 2px and
subparagraph separators at 1px; full-width lines leave the text's reading width
unchanged.

Vite imports the original local images and GIFs as asset URLs and emits them
with the Web build. Keep media under `apps/web/assets/document/` and use relative
links from `apps/web/src/pages/document/website/sources/website.md`. Generation emits `@assets/document/`
imports and rejects media outside that asset directory. The Website guide remains
in English regardless of the application UI language and has no language picker.

`ArticleImage` reserves media dimensions, uses native lazy image loading and
asynchronous decoding, and mounts GIFs only near the Article scroll viewport.
GIFs stop offscreen, support pause/play, and start paused with reduced motion.
`ArticleVideo` accepts an HTTPS embed URL in `src` and an optional watch link in `href`. It
renders the iframe directly in the initial HTML with `loading="eager"`.
All six video previews load on entry, including players below the viewport.
There is no visibility gate, custom placeholder, feature-detection replacement,
or activation button. The provider owns the preview and playback controls.
Players remain mounted when scrolling away to preserve playback state. The Website
guide uses YouTube privacy-enhanced embed URLs; other providers must supply
an iframe-compatible URL and permit embedding. Guide videos do not autoplay;
YouTube's inline playback option keeps supported mobile playback in the page.
The original-video link is always available in the caption.

The Dashboard's Walkthrough video Widget uses the same Workspace Overview
recording as a same-origin MP4 under `apps/web/assets/document/videos/`, with its existing
thumbnail as the poster and `preload="none"`. This keeps playback compatible
with the App's COEP in browsers without credentialless iframes. Empty saved
`videoURL` values use the bundled recording; explicit custom URLs remain intact.
Keep the default URL in the component so saved Widget data does not retain an
outdated build asset hash. The documentation's six YouTube embeds remain owned
by `ArticleVideo`.

## Cross-origin isolation

The public `/document` page uses `Cross-Origin-Embedder-Policy: unsafe-none`
so ordinary third-party iframes work in browsers such as Zen/Firefox without
experimental `credentialless` iframe support. It retains
`Cross-Origin-Opener-Policy: same-origin`. All other pages keep COEP
`require-corp` and COOP `same-origin` for the SQLite/SharedArrayBuffer runtime.
Vite and Nitro share the policy in `shared/lib/browser/crossOriginIsolation.ts`, including
the configured application base path.

This relaxes the documentation document's resource-embedding restriction; it
does not disable same-origin access checks, API authorization, CORS or the
server-function CSRF middleware. Keep external players in sandboxed HTTPS
iframes and authored content escaped. Documentation and the App still share an
origin and browser storage: the route boundary is not a security boundary
against same-origin XSS.

COEP is fixed for the lifetime of an HTML document. The root route forces a
document navigation when entering or leaving documentation; navigation between
documentation anchors stays within the page. Do not replace this with ordinary
SPA navigation or remove isolation from application pages.

Use browser/server URL pathnames with the configured base path when selecting
headers or checking the initially loaded document. TanStack Router's
`location.pathname` and `buildLocation().pathname` already exclude that prefix;
classify those with the default `/` base. Passing `/development/v1/` again
misclassifies `/document` as an isolated route, skips the required document
navigation from the App, and leaves third-party frames under the App's COEP.
Root-path tests alone cannot detect this mismatch.

`documentIsolation.spec.ts` uses a separate real Vite server under
`/development/v1/` and isolated browser storage. It checks navigation in both
directions, anchors within documentation, guide HMR through a temporary imported
module, and a Vite automatic full reload. Both update paths must preserve
non-isolated documentation and all six embedded player fixtures. The fixture
uses its own optimizer cache and Nitro build directory and never edits the
authored guide or clears the developer's cache or local data. Run one normal
development server per checkout;
additional verification servers need separate optimizer caches and Nitro build
directories.

The documentation document does not create the SQLocal worker, access SQL
diagnostics storage, or run local-data cleanup. Returning to an isolated page
opens the existing database normally; it does not reset data or migrations.

Document navigation interrupts active requests, realtime connections and
memory-only state. The existing transaction synchronizer resumes persisted
pending transactions when the App starts; the Yjs coordinator restores cached
updates marked `needsFlush` and attempts to send them again. Its pagehide and
beforeunload listeners attempt a flush, but browser unload does not guarantee
completion of asynchronous writes or remote acknowledgements. Do not describe
row retention as guaranteed uninterrupted sync or exactly-once delivery.
The boundary browser test verifies committed SQLite rows, pending transaction
payloads and persisted Yjs cache bytes after a documentation round trip; it
does not prove remote delivery during an interrupted request.

Verify with:

```sh
npm run generate:website-guide
npm run format:check
npm run lint
npm run typecheck
npm run test:unit -- apps/web/src/components/commons/Article/ArticleMedia.test.tsx apps/web/test/integration/iconConventions.test.ts
npm run test:e2e -- websiteGuide.spec.ts articleNavigation.spec.ts articleResponsive.spec.ts --workers=1
npm run test:e2e -- crossOriginIsolation.spec.ts documentIsolation.spec.ts localDatabaseStartup.spec.ts --workers=1
```

The browser tests use isolated storage and a controlled cross-origin player
response. They verify loading boundaries and embedding configuration, not
YouTube availability or actual remote playback.
Other component suites mounted on `/document` must also fulfill the YouTube
embed requests before navigation so readiness does not depend on live provider
traffic.
