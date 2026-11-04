# App command chain

`AppCommand` is the signed-in command surface. It does not search the whole
account. A `CommandChain` locks the palette to one step, and that step calls an
existing scoped search, route, dialog, inspector, or preference writer.

## Goal

Let one palette search a scoped object, navigate, run an object action, create
an object, and later host an AI retrieval step, without a global search API.

## Non-goals

- A backend search across every object the user can access.
- A local index of the account, a trie, or a second fuzzy-ranking library.
- Changing secrets, API keys, sessions, or passwords. Opening the account
  page is allowed; editing those values is not.
- Replacing `AppSidebar`, inspectors, or create dialogs. The chain only chooses
  them.
- Treating the web app as local-first. Offline coverage stays with the search
  hooks that already have local adapters.

## Chain

A chain is a short sequence, not a stored tree of object rows. The static
grammar is small. Object rows come from the current domain's parameter.

```
Domain -> {parameter}
       -> Domain -> {parameter}
       -> ...
       -> Operation -> [Finish]
```

A domain comes first. Its parameter is that domain's command input, and the
palette searches that domain immediately. Another domain may follow; that
domain is a sub domain, scoped by the locked parameter, and it searches its
own objects the same way. The domain-and-parameter pair can repeat. An
operation is legal only after a domain. It is the last step: the chain
finishes and runs that operation.

There is no Choose step. Selecting an object is the parameter of the domain
that searches it, not an operation. After Root shelves is selected, the next
input searches root shelves.

### Domain

The root lists pages and domains together. A page, such as dashboard,
routines, trash, or document, finishes the chain when chosen. It is not
nested under a navigation domain. The preferences page and the account page
are not in that list.

Root domains are root shelves, sub shelves, block packs, materials, routines,
stations, routine tags, preferences, and account. A second-level object does
not have to be reached by walking its parents. Selecting Block packs,
Materials, Sub shelves, or Routines at the root locks that domain and starts
its search, the same way Root shelves does.

The same domain step is also reachable after a parent is locked. These two
entries are one state. The chain that got there is different, and so is the
scope passed into the search:

```
Routines -> { "" }
Station -> { station } -> Routines -> { "" }
```

Both Routines steps show the same search and the same operations. The root
entry passes no station. The station entry passes that station. Sub shelves,
block packs, and materials follow the same rule: the parent entry fills
`rootShelfId` or `parentSubShelfId`, and the root entry omits it.

Selecting a domain does not finish the chain. Pages are not offered again
after a domain is locked.

### Parameter

A parameter is the command input of the current domain. For an object domain
it is the text sent to that domain's existing search. An empty parameter is
legal: the search runs with an empty query and returns at most 10 rows. Typing
replaces that page. The palette does not request another page.

Selecting a row locks that object for the next sub domain or operation. The
row's identity is its id. The visible label and the text being searched stay
the object's name.

### Operation

An operation cannot be the first step. It appears only after a domain, and
only as an action of that domain or of the object its parameter locked.
Search is not one of those actions.

Selecting an operation finishes the chain and opens the existing dialog,
route, inspector, or preference writer. An operation does not open the next
domain. To search another object, choose a sub domain instead.

Actions that do not need a locked object, such as creating a root shelf, are
offered with that domain's search. The parameter may stay empty. On the
preferences and account domains, the operation that opens the page is the
first candidate. Those lists are short, so the page action stays above the
preference rows. Actions on one object, such as rename, delete, or open
inspector, are offered after the parameter has locked that object.

```
Root shelves -> { "" }
Root shelves -> { shelf } -> { sub shelf }
Root shelves -> { shelf } -> Sub shelf -> [Finish]
Sub shelves -> { sub shelf } -> Material -> [Finish]
Sub shelves -> { sub shelf } -> Block pack -> [Finish]
Sub shelves -> { sub shelf } -> Sub shelf -> [Finish]
Root shelves -> { "" } -> Create root shelf -> [Finish]
Preferences -> Navigation -> Appearance -> [Finish]
Preferences -> Quick settings -> Density -> Compact -> [Finish]
Account -> Quick settings -> Status -> Online -> [Finish]
Routines -> { "" }
Station -> { station } -> Routines -> { routine } -> Orchestrate tasks -> [Finish]
Routines -> { routine } -> View all task records -> [Finish]
Routines -> { routine } -> Routine tasks -> { task } -> View all records -> [Finish]
Block packs -> { "" }
```

`{ "" }` is an empty search query. `{ shelf }` is the object locked by that
search. The first chain is only the search step; it has not finished.

## Scope

Each object domain names the search hook it already uses and the parent field
that hook accepts. While that domain's parameter is the current step, the
palette sends the current text as that hook's query. Debounce the request.
Do not mount every search hook at once; run the hook for the active domain.

The existing hooks use `api/bridges/searchLocal.bridge.ts` and the adapters
in `api/adapters/searchLocal.adapter.ts`. Missing-network reads fall back to
cached local rows within the current user's permissions and scope:

- Root shelves, stations, routines and routine tags keep their existing local adapters.
- `searchSubShelves` accepts optional `rootShelfId` and `prevSubShelfId`.
- `searchMaterials` and `searchBlockPacks` accept optional `rootShelfId` and
  `parentSubShelfId`. Both have local adapters; Material metadata now has its
  own local table. A metadata hit does not establish offline file availability.
- `searchRoutines` accepts required `stationIds` and `tagIds` lists, which may
  be empty for a root-domain search.
- `searchRoutineTasks` accepts a required `routineIds` list; a locked routine
  passes that routine and can read its cached tasks offline.
- `searchItems` accepts optional `rootShelfId` and `parentSubShelfId`. A locked
  sub shelf passes both and reads its local Material and BlockPack rows.

The palette calls only its active domain's hook. Local fallback cannot invent
rows or permissions that were never cached. Opening a Material resolves its
root shelf from the known context or its parent sub shelf through the existing
owner; it does not require the operator to lock a root shelf first.

Do not add another search field for these domains. A root entry omits the
parent field, or passes an empty id list. A parent entry sets that field
from the locked object. Creating a material, block pack, sub shelf, or routine can start from that
root domain. Confirming the operation does not finish the chain. It
continues into the search that picks the parent: sub shelves for a material
or block pack, stations for a routine, and a root shelf then a sub shelf for
a new sub shelf. Choosing that parent runs the existing create owner. A sub
shelf can also be created directly under the selected root shelf. The
drill-down path, where the parent is already locked, still creates
immediately. A locked root shelf lists its sub shelves in Sub domains, at most 10, and the input replaces that page. A locked sub shelf lists the materials and block packs returned by `searchItems` for that shelf, at most 10, and the input replaces that page. Actions are listed above Sub domains. Create, rename, and delete are offered on that shelf whether it was opened from Sub shelves or by drilling down from a root shelf. Those actions use the existing owners, expanding the cached root shelf when the sub shelf is not in the sidebar tree yet. A locked station lists its routines from `searchRoutines` with that station, at most 10. A locked routine lists its tasks from `searchRoutineTasks`, at most 10. Typing replaces each of those lists.

Preferences and account are root domains. Entering either one splits the
step into two sections. Navigation lists the operation that opens the page
and one operation for each Article section. Choosing a section finishes the
chain and opens that section: a page route uses the section id as the URL
hash, and sheet display opens the same section. Quick settings lists every
preference that is a toggle or a fixed set of choices, including theme,
language, density, editor width, start page, cleanup period, and account
status. Each section shows at most 8 rows when the parameter is empty.
Typing filters the full list. A fixed numeric range, such as a font size
slider, is not a quick setting. Sending a verification message and editing
private profile fields, such as a display name, are not quick settings.
Status is a fixed choice and can be changed only while online.

A quick setting that stores one typed value is not in the product yet. When
one is added, it is an operation on the settings domain. Choosing it does
not finish the chain. The command input becomes that operation's parameter,
and confirming the current text applies the value and finishes. The chain
does not change secrets, API keys, sessions, or passwords.

Actions on a locked object follow that object's sidebar context menu from top to bottom, continuing across the menu's sections. The root navigation row is Routines overview. The Routines domain stays the searchable routine list.

A locked station offers View in overview, Open in inspector, Routine, Rename, and Delete. View in overview opens that station's routines overview. Routine opens the existing create dialog. A locked routine lists its tasks directly and offers, in menu order, View in overview, View all task records, Open in inspector, Orchestrate tasks, Task, Rename, and Delete. View in overview opens that routine's station overview and is the same row in the routine context menu. Orchestrate tasks opens that routine's dependency graph editor. View all task records opens the existing routine task record dialog. Task opens the existing create-task dialog. A locked task offers View all records, Open in inspector, and Rename. View all records opens the same dialog for that task. Rename from the command reuses `dialogs/RenameDialog/RenameDialog.tsx` with the task mutation and completion callback. Rename in the sidebar still edits the row in place.

## Presentation

The hint on a row is one noun:

- A page chosen from the root is an operation.
- `Domain`: a domain on the first step.
- Below the first step, a result names its type: Root shelf, Sub shelf,
  Material, Block pack, Station, Routine, Routine task, or Routine tag. A
  placement list uses that same type, so a sub shelf created under a root
  shelf and one created under a sub shelf are labeled differently.
- `Setting`: one preference in the preferences domain.
- `Operation`: an action.

After at least one step, a path is shown between the input and the options. It lists the selected domain, object, and setting in order. An earlier segment returns the chain to that step and clears the query. While a create operation is waiting for a parent, the current segment is a short instruction, such as choosing a root shelf, sub shelf, or station. That instruction is the same size as the path and is brighter and bolder than the current path text. The path scrolls horizontally with the application scrollbar. A new segment keeps the scroll at the right end unless the operator has moved it.

The first step's domain group is Domains. Every later group of domains or search rows is Sub domains. Row hints carry the object type.

## Ranking

`cmdk` stays the input, list, and keyboard owner. Its `command-score` ranks the
current step's small candidate list: domain names, one search page, sub
domains, and the operations of the current domain. Do not add another fuzzy
library for this surface. A custom ranker is justified only if that page
scores badly, and it still scores the page rather than the account.

`ArticleCommand` uses the same panel and path. The first page is Domains. Entering a paragraph shows Navigations and, when it contains further paragraphs, Sub domains. The navigation row is the finisher: it jumps to that paragraph or API operation. A sub domain continues the chain and offers the same Navigations row for its own position.

## Later

An AI retrieval step is another domain or terminal operation on the chain. It
is not part of the first grammar and must not widen the search hooks.


## Verification status

The 2026-11-04 [workspace verification](../../runbooks/workspace-release-verification.md)
found document-entry hydration and version hash-navigation failures. The
2026-11-05 correction renders `ArticleCommand` directly, like `AppCommand`,
instead of returning `null` on the server and creating a body portal on the
initial client render. The fixed overlay keeps the same SSR/client tree.

The deep-link regression now checks entry at `#version-0-2-0`, navigation through
the command domains to the hidden previous version, sidebar selection and no
hydration errors. It passes in development and against a fresh built Node SSR
server. Preserve those assertions when changing the command layout; no extra
scroll workaround was needed. Production rollout and live-backend acceptance
remain separate decisions.
