# Website guide

The documentation page's Website section is authored in
`docs/introductions/website.md` and is published in English.

Run `npm run generate:website-guide` explicitly after changes. It compiles
the English document to `WebsiteEnglish.tsx` and navigation under
`apps/web/src/pages/document/website/`. Unsupported Markdown, missing media,
or invalid links stop generation before output is
written. Review and commit the sources and generated files together; do not
edit generated TSX or parse Markdown during page rendering.

Adjacent sections use Article's automatic separators. A Markdown thematic break
at the same boundary does not produce a second line; thematic breaks within
section content remain explicit separators.

Vite imports the original local images and GIFs as asset URLs and emits them
with the Web build. Keep the source files under `docs/introductions/`; no
duplicate asset copy or media download is required. The Website guide remains
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

## Cross-origin isolation

The public `/document` page uses `Cross-Origin-Embedder-Policy: unsafe-none`
so ordinary third-party iframes work in browsers such as Zen/Firefox without
experimental `credentialless` iframe support. It retains
`Cross-Origin-Opener-Policy: same-origin`. All other pages keep COEP
`require-corp` and COOP `same-origin` for the SQLite/SharedArrayBuffer runtime.
Vite and Nitro share the policy in `shared/lib/crossOriginIsolation.ts`, including
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
npm run test:e2e -- crossOriginIsolation.spec.ts localDatabaseStartup.spec.ts --workers=1
```

The browser tests use isolated storage and a controlled cross-origin player
response. They verify loading boundaries and embedding configuration, not
YouTube availability or actual remote playback.
