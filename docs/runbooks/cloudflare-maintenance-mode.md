# Cloudflare maintenance mode

The Web application has a Worker-side maintenance guard that can show a
maintenance page without depending on the backend, API, database, or static
asset pipeline.

## Implementation

The guard is implemented in
[`apps/web/server/middleware/maintenance.ts`](../../apps/web/server/middleware/maintenance.ts).
It reads the Cloudflare runtime binding `IS_MAINTENANCE` and returns an inline
HTML response when maintenance mode is enabled.

The page returns:

- HTTP `503`;
- `Cache-Control: no-store`;
- `Retry-After: 3600`; and
- a self-contained dark GridBackground-style page with a black background,
  20px grid, and diagonal gradient overlay.

Because the page is inline, it remains available while backend services or
static assets are unavailable.

## Runtime variable

Configure this value in the deployed Worker under:

```text
Workers & Pages > notegic-web > Settings > Variables and Secrets
```

Use:

```text
Name: IS_MAINTENANCE
Type: Variable
Value: true or false
```

Use the runtime section, not Build Variables and Secrets. Do not use a `VITE_`
prefix: `VITE_*` values are build-time browser configuration, while this flag
must be evaluated by the Worker at request time.

The current parser accepts the string `true` case-insensitively after trimming
whitespace. Any other value, including `false`, `T`, `1`, `yes`, `on`, or an
unset variable, keeps the normal application active.

The flag is not sensitive, so keep it as a normal Variable rather than a
Secret. A Secret would still work at runtime, but it would only hide the value
from the Cloudflare dashboard and Wrangler; it would not change the page
selection behavior.

After changing the value, select `Deploy`. This does not require rebuilding the
source code, but the new runtime binding must be deployed before it takes
effect.

## Enable and verify

1. Set `IS_MAINTENANCE=true` in the production Worker runtime variables.
2. Deploy the Worker configuration change.
3. Verify the response from an external client:

   ```sh
   curl -i https://www.notegic.com/
   ```

   The response should be HTTP `503`, include `Cache-Control: no-store`, and
   contain `Notegic is under maintenance`.
4. Check the Worker deployment and logs before beginning backend maintenance.

## Disable and verify

1. Set `IS_MAINTENANCE=false`.
2. Deploy the Worker configuration change.
3. Open a fresh browser session or run:

   ```sh
   curl -i https://www.notegic.com/
   ```

4. Confirm that the normal application response is restored.

## Local and deployment configuration

The ignored local files contain the safe default `IS_MAINTENANCE=false`:

- `apps/web/.env`
- `apps/web/.env.production`

These files document local and build environments; they are not the production
Worker runtime source of truth. Production runtime configuration is managed in
Cloudflare Workers & Pages.

Until the generated Wrangler configuration includes `keep_vars: true`, verify
that the Dashboard-managed runtime variable still exists after every code
deployment. A future deploy can otherwise overwrite plaintext Dashboard
variables.

## Validation

Run the normal frontend checks before deploying source changes:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run build:web:cloudflare
```

The maintenance page must not import React components, call the backend, read
the local SQLite database, or load external assets.
