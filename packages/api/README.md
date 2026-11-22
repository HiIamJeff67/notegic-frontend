# Shared API

Portable API contracts and runtime-neutral helpers. Web, Desktop, and a future
Mobile app may import this tree. It must not import `apps/*`.

The product decision for what stays in an app is
[Shared application boundaries](../../docs/designs/systems/shared-application-boundaries.md).
This file is the map of `packages/api/` itself. Update it in the same change
that adds, moves, or removes a folder or a root module here.

## Now

```text
interfaces/          request and response contracts, enums, types, seeds
graphql/             conversions and generated operations; do not hand-edit generated/
websocket/           frame, ticket, and channel contracts
exceptions/          NotegicException catalogs and NotegicError subclasses
queryKeys.ts         TanStack Query keys
queryClient.ts       shared QueryClient defaults and getQueryClient()
queryHookOptions.ts  staleTime presets for prefetch, useQuery, and queryAsync
retryClient.ts       per-scope HTTP 429 deadline, including getRetryAt
validation.ts        parse(schema, request) before transport or a draft write
invokers/            request validation and error mapping; each call receives func
hooks/               shared TanStack Query hooks. Each hook receives the app function as func. A mutation writes the client, calls func, then settles the outbox. A local query returns the stored row, writes the server row, and updates the cache when that write changes a row. Web keeps its own hooks until it moves onto these.
hooks/react/         shared shelf and sidebar interaction state; it calls hooks/ and does not import an app. Web pages keep their own providers.
local/               sqlite-core tables, ordered SQL migrations, migrator, migration catalog, client.ts, repositories/, schemaHead.ts, phase.ts, and result.ts
```

`client(driver)` composes SQL and does not open a database file. `defaultClient`
is that client for the running app. The app connects its own driver before
use. Desktop connects the sidecar driver. Web still uses its SQLocal database
until it connects the same client.

`local/` does not read browser storage. Whether a local preference is enabled
lives in `packages/lib/storage/localPreference.ts`, so this package does not
import `packages/lib`.

`schemaHead.ts` is the latest version in the shared migration chain. Web and
Desktop each keep `localSchemaVersion` in `schemaVersion.ts` beside their driver.
The migrator stops at that version. Both are 8, the current head, so today's
databases still migrate to the head. `npm run local-schema-version` prints
the three numbers. `npm run local-schema-version -- --set=web,desktop`
raises the selected app to the journal head. `--write-head` records that head
in `schemaHead.ts`.

`queryClient` decides whether one in-flight query or mutation runs again. It
does not retry HTTP 4xx, including 429. `getQueryClient()` keeps one client
while `window` exists. Without `window` it returns a new client, so server
rendering does not share cache across requests.

`retryClient` is a different job. It remembers one deadline per API scope and
refuses later calls until that time. It does not replay the failed call.
`getRetryAt` converts `Retry-After` and lives in this file. A catalog does not
import `RetryClient`. The invoker records the deadline, then throws the
catalog error. See
[Exceptions and errors](../../docs/conventions/12-exceptions-and-errors.md).

`exceptions/client/` holds failures that start in the client, such as fetch,
validation, and the local database. `exceptions/errors/` holds the thrown
`NotegicError` subclasses. `RealtimeError` is an existing catalog that returns
`NotegicException`. New catalogs use the `Exceptions` name.

The connection that uses these contracts stays in the app: Web server
functions, the Web Apollo client, and the WebSocket lifecycle are under
`apps/web/src/api/`. Desktop and Mobile do not import those files.

## Next

[NOT-159](https://linear.app/notegic/issue/NOT-159/commit-shelf-changes-on-the-desktop-sidecar-before-remote-sync)
writes shelf changes through this schema. Web keeps its current simulator and
synchronizer path until that desktop path is trusted. Rust does not open the
database.

## Last call

`packages/api` owns the contract, path, and validation. The function that
performs the call stays in that app:

| App | `api/functions/` |
| --- | --- |
| Web | TanStack Start server functions, cookies, and CSRF |
| Desktop | TypeScript that calls the sidecar, which calls the remote API |
| Mobile | That platform's request implementation |

Only Web uses a server function. A server function is not a database
connection for another app.

Exported functions are PascalCase on every app: `GetUserData`, not
`getUserData`. A shared invoker receives that function as `func` and calls
`func(request)`. When an operation can be cancelled, every app's function
accepts `signal` as its second argument and the invoker forwards it. Web keeps
TanStack Start's `{ data: request }` inside the server file:

```ts
const GetUserDataRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetUserDataRequest) => data)
  .handler(async ({ data: request }) => {
    // cookie, CSRF, and the upstream fetch stay here
  });

export const GetUserData = (request: GetUserDataRequest) =>
  GetUserDataRpc({ data: request });
```

One blank line separates the Rpc from its export. One blank line separates
that pair from the next Rpc. Desktop and Mobile export the same PascalCase
function and do not import `GetUserDataRpc`.
