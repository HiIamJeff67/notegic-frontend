# Shared application boundaries

What Web, Desktop, and a future Mobile app may share, and what stays inside
one app. Apps do not import one another. `shared/` is the only code they may
all import.

The current desktop window still aliases `@/` to `apps/web/src`. That alias
violates this rule. [NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell)
removes it. A file both apps use moves to `shared/` first.

The folder map for `shared/api/`, including paths that are decided and not
created yet, is [shared/api/README.md](../../../shared/api/README.md). Update
that file when this boundary adds or removes a module there.

## Goal

Let an app ship a feature, including a local schema change, without forcing
the other app's UI to take that feature in the same change.

## Non-goals

- Moving every reusable-looking component into `shared/`.
- Sharing pages, feature screens, or platform API callers.
- Replacing the Web simulator and synchronizer path in this decision.
- Opening SQLite from Rust or from a Tauri filesystem command.

## Ownership

```text
shared/api/                  contracts, payloads, query keys
shared/api/local/            shared sqlite-core schema, ordered SQL, version cap
shared/components/ui/        shadcn primitives with no product data
shared/components/commons/   a file moves here only after it has no app API
shared/components/charts/    chart parts with no product screen
shared/components/widgets/   self-contained widgets with no account data
shared/hooks/                DOM hooks with no app API or product provider
shared/providers/            DOM providers with no app API
shared/styles/               theme and editor CSS both DOM apps load
shared/lib/                  platform-neutral libraries already owned here
shared/i18n/                 strings and pure language checks
shared/reducers/

apps/web/src/api/functions/       TanStack Start server functions
apps/web/src/api/local/           SQLocal driver and the current Web sync path
apps/web/src/components/          Web feature components
apps/web/src/pages/
apps/web/src/routes/
apps/web/src/styles/             Web screen styles: auth panel, article, inspector, command palette
apps/web/src/i18n.ts             Web i18n instance

apps/desktop/src/api/functions/   desktop API callers
apps/desktop/src/components/      desktop feature components
apps/desktop/src/pages/
apps/desktop/sidecars/driver/   native SQLite
apps/desktop/src-tauri/           window, process lifecycle, Rust commands

apps/mobile/src/api/functions/    mobile API callers, when that app exists
apps/mobile/src/local/driver/     React Native SQLite, when that app exists
```

Each app keeps `components/` and `pages/`. `shared/components/` holds only the
pieces that have no app import. A file that imports an app hook, a server
function, or a local driver stays in that app.

## Decisions

### Do not import across apps

`apps/web`, `apps/desktop`, and `apps/mobile` are separate application
boundaries. An import from one `apps/*` tree into another is not allowed.
`shared/` may be imported by every app. Shared code must not import `apps/*`.

The desktop webview boundaries live beside the Web modules they replace:
`api/local/db.ts`, `api/local/worker.ts`, `api/local/package.ts`,
`api/server/request.ts`, and `api/server/asyncLocalStorage.ts`. They exist
only because the current desktop bundle imports Web modules. They are not a
database driver. When those Web imports are gone, delete the boundaries.

### Share primitives, not product UI

Share a component only when every consumer ships that change together and the
file has no platform or product data. `components/ui/` meets that bar.
`charts/`, `commons/`, and `widgets/` are reviewed file by file. Theme tokens,
scrollbar, loading, sidebar, image, and BlockNote editor styles live in
`shared/styles/`. Auth panel, article, inspector, and command-palette styles
stay with the Web screens that import them.

Pages stay in the owning app. Feature screens, menus, and dialogs that know
about shelves, routines, or an agent stay in the owning app. A desktop-only
feature must be able to ship without editing a shared screen that Web renders.

Copy is the wrong fix for a screen both apps need. If the screen must stay
identical and ship together, move that one file to `shared/components/`.
Until then, each app composes `shared/components/ui` into its own pages.

### Local schema lives under `shared/api/local`

Put the shared Drizzle `sqlite-core` tables, the ordered SQL migrations, and
the migrator in `shared/api/local/`. Do not add a second `shared/local/` tree.

Migrations are one chain. An app cannot skip a number. A desktop-only change
is appended. Web adopts it later by raising its cap, which runs every
migration between the old cap and the new cap in order.

Each app build sets the highest migration version it will apply. The migrator
stops at that version. Web and Desktop may therefore run different schema
versions from the same migration list.

The TypeScript table definition that an app compiles must match its cap. A
table or column that only a newer migration creates stays out of the shared
schema module until every app that imports that module raises its cap. A
desktop-only table can live beside `apps/desktop/sidecars/driver/` until Web
adopts it.

This cap is required before the desktop local-first engine writes through the
shared schema.

### The last API call stays in the app

`shared/api` owns the contract, path, and validation. The function that
performs the call stays in that app's `api/functions/` directory.

| App | Implementation |
| --- | --- |
| Web | TanStack Start server functions |
| Desktop | TypeScript that calls a Tauri command, or a bearer request. The Rust command stays in `src-tauri` |
| Mobile | That platform's request implementation |

The three folders use the same role and the same `api/functions/` path. They
do not share an implementation. Server functions, cookie CSRF, and Start
middleware stay in `apps/web`.

Every exported function uses PascalCase, such as `GetUserData`, in Web,
Desktop, and Mobile TypeScript. The shared invoker calls it as
`(request) => Promise<response>`. Its parameter name is `func`. An operation
that must cancel accepts `signal` as the second argument on every app's
function, and the invoker passes that signal through. Web's
`createServerFn` client still receives `{ data: request }` from a private
`GetUserDataRpc` in the same file. One blank line separates that Rpc from
`export const GetUserData`, and one blank line separates the next Rpc pair.
Desktop and Mobile do not import the Rpc.

The SQLite driver is the same kind of boundary. Web keeps SQLocal. Desktop
opens native SQLite in the sidecar. Mobile will use a React Native SQLite
driver. Rust does not open the database.

## Validation

- No file under `apps/desktop` imports `apps/web`, and the desktop `@/` alias does not point at `apps/web/src`.
- A production desktop bundle contains no `sqlocal` and no `@tanstack/react-start` server runtime.
- The migrator for an app whose cap is N does not apply migration N+1.
- Web shelf create and rename still use the current simulator and synchronizer path until a later issue switches them.

## Current gap

`apps/desktop/tsconfig.json` and `apps/desktop/vite.config.ts` map `@/` to
`apps/web/src`. The desktop route tree no longer imports Web pages. The alias
remains because `apps/desktop/src/api/apolloClient.ts` and
`apps/desktop/src/api/local/db.ts` still reference Web modules.
`apps/desktop/src/styles.css` sources `apps/web/src`. Those imports
are not a sharing mechanism. Web and Desktop share a file only after it lives
in `shared/` and imports neither app.

Until [NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell)
removes that alias, `desktopRuntimeBoundary` in `apps/desktop/vite.config.ts`
replaces Web-only runtimes before they execute. The replacements are inert.
They are not a native database, a bearer client, or a sharing layer. Delete
them with the alias.

| Import the Web graph reaches | Module the desktop bundle evaluates |
| --- | --- |
| Web `api/local/db.ts` | `apps/desktop/src/api/local/db.ts`, which reports the database disabled and read-only |
| `sqlocal.worker.ts` | `apps/desktop/src/api/local/worker.ts` |
| `sqlocal` and `sqlocal/drizzle` | `apps/desktop/src/api/local/package.ts` |
| `@tanstack/start-server-core` | `apps/desktop/src/api/server/request.ts` |
| `node:async_hooks` | `apps/desktop/src/api/server/asyncLocalStorage.ts` |
| `apps/web/src/api/functions/*.serverFn.ts` | Functions that reject. The handler bodies are not bundled |

Desktop does not import the TanStack Start route tree: `apps/web/src/start.ts`,
`apps/web/src/router.tsx`, `apps/web/src/routeTree.gen.ts`, and
`apps/web/src/routes/`. `apps/web/src/api/functions/helpers/cookie.ts` is only
imported by those server functions, so the desktop graph does not load it.
Screen behavior both trees use lives in the page modules that
`apps/desktop/src/router.tsx` imports. Desktop login does not run the Web
login loader. Route `head()` metadata is not applied. Pages that call
`usePageTitle` still set `document.title`.

The desktop router uses `apps/desktop/src/api/apolloClient.ts`. That client
sends the bearer token and does not send cookies or `X-CSRF-Token`. Web
`apolloClient.ts` remains the cookie client. Mounting the Web pages still
mounts the hooks they call.
`apps/web/src/api/functions/headers/csrfToken.ts` reads and writes that cookie.
Web client functions and the invokers that call them still run. Local
synchronizers and simulators still import the database boundary. With that
boundary disabled they do not open SQLocal or native SQLite. Opening `/app`
without a session follows `UserProvider`: the account request fails, the
provider ends the session, and the window returns to `/login`.

Still absent: native SQLite through the sidecar, a bearer-token API client in
place of server functions, and an OS keychain session in place of the browser
cookie. `apps/desktop/src/pages/(playground)/DesktopProbePage.tsx` is an unmounted probe, not the signed-in layout.
