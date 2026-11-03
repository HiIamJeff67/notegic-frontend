# Versions sources

Edit [versions.md](versions.md), then run `npm run generate:document`.
`../generated.ts` contains the roadmap data and `../VersionsContent.tsx`
contains the generated JSX. `../Versions.tsx` owns the tab.

After `# Versions`, an introductory paragraph can explain the four states:
`Previous` is past work, `Current` is work in progress today, `Next` is the
upcoming release, and `Future` is tentative planning that may change.

Use `## 0.0.0 — Previous`, `Current`, `Next` or `Future` headings, a description
and a task checklist. Each item has a bold title followed by its description on
the next line. Mark completed work with `[x]`, including work completed for an
upcoming release; this does not change its release state. Keep 0.3.0 as `Next`
until it is announced. Do not use `Legacy`, `Planned` or `Exploring` as states.

The existing VersionCard owns task expansion and progress rendering. `Future`
cards retain their feature lists and expansion but omit completion percentages,
rings and counts so tentative plans do not imply measured release progress.

Previous cards are initially hidden. A left-aligned `Show more` link sits below
the last visible card, inside its Article section. It reveals the most recent
Previous card; `Show all` and `Show less` then sit below the last visible history
card. Show all stays disabled once every Previous card is visible. Show less
returns to the initial state, preserving each card's expanded features.
Sidebar navigation, document search and direct version hashes reveal the target
before scrolling. Keep these interactions with the tab and existing Article
navigation rather than introducing another loading or navigation layer.
