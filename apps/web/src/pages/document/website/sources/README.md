# Website sources

Edit [website.md](website.md), then run `npm run generate:website-guide` or
`npm run generate:document`. The generator writes `../WebsiteContent.tsx` and
`../generated.ts`; `../Website.tsx` remains the owning tab component.

Keep image links relative to this source file. Reviewed media lives in
`apps/web/assets/document/`; do not duplicate it in this directory. Keep the
existing heading anchors, captions and public video links intact.

See the [generation runbook](../../../../../../../docs/runbooks/website-guide.md)
for media, source formats and verification. Runtime components use committed
generated output and never parse Markdown or read an external checkout.
