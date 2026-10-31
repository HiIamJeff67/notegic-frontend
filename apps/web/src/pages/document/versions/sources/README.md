# Versions sources

Edit [versions.md](versions.md), then run `npm run generate:document`.
`../generated.ts` contains the roadmap data and `../VersionsContent.tsx`
contains the generated JSX. `../Versions.tsx` owns the tab.

Use `## 0.0.0 — Next`, `Current` or `Legacy` headings, a description and a task
checklist. Each item has a bold title followed by its description on the next
line. The existing VersionCard owns task expansion and progress rendering.
