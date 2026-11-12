# Desktop webview boundaries

The desktop window renders the existing web pages and components. It does not
fork those components. `apps/desktop/src/router.tsx` is the desktop route tree.
Screen logic that both route trees share lives next to the page, not in a
second copy.

The desktop build still does not execute SQLocal or the TanStack Start server
runtime. Those modules are replaced at the bundler boundary. The replacements
are not a native database and not a bearer-token API client.

## Replaced before the bundle runs

These web modules are not the modules the desktop window evaluates.

- `apps/web/src/api/local/db.ts` resolves to `apps/desktop/src/localDatabase.ts`.
  The boundary reports the local database as disabled and read-only. It does
  not construct a worker.
- `apps/web/src/api/local/sqlocal.worker.ts` resolves to
  `apps/desktop/src/databaseWorker.ts`.
- `sqlocal` and `sqlocal/drizzle` resolve to
  `apps/desktop/src/databasePackage.ts`. The current UI graph does not import
  that package.
- `@tanstack/start-server-core` resolves to `apps/desktop/src/serverRequest.ts`.
- `node:async_hooks` resolves to `apps/desktop/src/asyncLocalStorage.ts`, so the
  Start client package can load in the webview without Node's `AsyncLocalStorage`.
- Every `apps/web/src/api/functions/*.serverFn.ts` module is replaced with
  functions that reject. The handler bodies are not bundled.

Server function modules:

- `apps/web/src/api/functions/apiKey.serverFn.ts`
- `apps/web/src/api/functions/auth.serverFn.ts`
- `apps/web/src/api/functions/block.serverFn.ts`
- `apps/web/src/api/functions/blockPack.serverFn.ts`
- `apps/web/src/api/functions/feedback.serverFn.ts`
- `apps/web/src/api/functions/material.serverFn.ts`
- `apps/web/src/api/functions/notification.serverFn.ts`
- `apps/web/src/api/functions/realtime.serverFn.ts`
- `apps/web/src/api/functions/rootShelf.serverFn.ts`
- `apps/web/src/api/functions/routine.serverFn.ts`
- `apps/web/src/api/functions/routineTag.serverFn.ts`
- `apps/web/src/api/functions/routineTask.serverFn.ts`
- `apps/web/src/api/functions/routineTaskDependency.serverFn.ts`
- `apps/web/src/api/functions/routineTaskRecord.serverFn.ts`
- `apps/web/src/api/functions/station.serverFn.ts`
- `apps/web/src/api/functions/subShelf.serverFn.ts`
- `apps/web/src/api/functions/user.serverFn.ts`
- `apps/web/src/api/functions/userAccount.serverFn.ts`
- `apps/web/src/api/functions/userInfo.serverFn.ts`
- `apps/web/src/api/functions/userQuota.serverFn.ts`
- `apps/web/src/api/functions/userSetting.serverFn.ts`
- `apps/web/src/api/functions/visualize.serverFn.ts`

## Web route shell that desktop does not import

Desktop does not import the TanStack Start route tree. These files stay on the
web app:

- `apps/web/src/start.ts`
- `apps/web/src/router.tsx`
- `apps/web/src/routeTree.gen.ts`
- `apps/web/src/routes/__root.tsx`
- `apps/web/src/routes/llms[.]txt.ts`
- `apps/web/src/routes/robots[.]txt.ts`
- `apps/web/src/routes/sitemap[.]xml.ts`
- `apps/web/src/api/bridges/cookie.bridge.ts`

`cookie.bridge.ts` is only imported by the server function modules above, so
the desktop graph does not load it.

The other files in `apps/web/src/routes/` register the web file routes. Desktop
does not import them. Where a web route contained screen behavior, that
behavior now lives in the page module both trees import:

- `apps/web/src/pages/auth/AuthLayout.tsx`
- `apps/web/src/pages/app/block-pack-editor/BlockPackEditorIndexRoute.tsx`
- `apps/web/src/pages/app/material-viewer/MaterialViewerRoute.tsx`
- `apps/web/src/pages/app/routines/StationRoutinesRoute.tsx`
- `apps/web/src/pages/app/routines/RoutineTaskDependencyGraphEditorRoute.tsx`
- `apps/web/src/pages/app/trash/TrashRoute.tsx`

Desktop login does not run the web login loader. That loader calls
`HasAuthCookies` and redirects when a browser session already exists.

Route `head()` metadata from the web route modules is not applied. Pages that
call `usePageTitle` still set `document.title`.

## Still the web client, because the desktop replacement is not written

Mounting the existing components also mounts the client code they already call.
These are not desktop-specific implementations:

- `apps/web/src/api/apolloClient.ts` sends GraphQL with cookie credentials and
  the CSRF header.
- `apps/web/src/api/clientHeaders.ts` reads and writes the browser CSRF cookie.
- `apps/web/src/api/adapters/apiResponse.adapter.ts` keeps the client half of
  `createIsomorphicFn`, which can store a CSRF token from a response.
- `apps/web/src/api/functions/*.clientFn.ts` and the invokers that call them.
- Local synchronizers and simulators still import the database boundary. With
  the boundary disabled, those calls do not open SQLocal. They also do not open
  native SQLite.

Opening `/app` without a session follows the existing `UserProvider` path:
the account request fails, the provider ends the session, and the window
returns to `/login`.

## Not implemented

- Native SQLite through the sidecar.
- A bearer-token API client in place of TanStack Start server functions.
- An OS keychain session in place of the browser cookie.
- The earlier desktop probe in `apps/desktop/src/DesktopShell.tsx` is not the
  mounted screen.
