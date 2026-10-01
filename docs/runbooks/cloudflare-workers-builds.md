# Cloudflare Workers deployment

The current Web app uses TanStack Start SSR/server functions, so deploy it as a
Cloudflare Worker. Use Cloudflare Workers Builds for the Git-connected
deployment; Cloudflare Pages is only appropriate after the app intentionally
becomes static.

## Workers Builds settings

Create a Worker from this frontend GitHub repository and use these values:

| Setting | Value |
| --- | --- |
| Root directory | `/` |
| Build command | `npm run build:web:cloudflare` |
| Deploy command | `npx wrangler@4.126.0 deploy --config apps/web/.output/server/wrangler.json` |
| Node version | `22.16.0` (also committed in `.nvmrc`) |
| Production branch | `main` |

The root is intentional: `package-lock.json`, `shared/`, `codegen.ts`, and
`apps/web/` are all part of the Web build. The generated Wrangler file is
created by Nitro and must be deployed from the repository root using its
generated path.

Configure these build watch paths so shared changes rebuild Web:

```text
apps/web/*
shared/*
package.json
package-lock.json
codegen.ts
tsconfig.json
biome.json
.nvmrc
```

Use separate Workers Builds environments for production and preview. Set
`CLOUDFLARE_WORKER_NAME` to `notegic-web` in production and
`notegic-web-preview` for non-production deployments.

## Environment configuration model

The Web application has two separate configuration paths. Keep them separate
when changing or troubleshooting an environment value:

| Configuration | Where it is read | When it is evaluated | Examples |
| --- | --- | --- | --- |
| Vite build-time variables | `import.meta.env.VITE_*` | During `vite build` | API URLs, OAuth client IDs, Turnstile site key |
| Worker runtime variables | Cloudflare Worker `env` bindings | For each request | `IS_MAINTENANCE` |

`VITE_*` values are embedded into browser assets and are therefore public. They
must contain only browser-safe configuration such as public URLs, OAuth client
IDs, and the Turnstile site key. Never place API secrets, OAuth client secrets,
private keys, or backend credentials in a frontend `VITE_*` variable.

The maintenance flag is intentionally not a `VITE_*` variable. Follow the
[Cloudflare maintenance mode](cloudflare-maintenance-mode.md) runbook for that
request-time setting.

## Build-time variable inventory

The production and preview Workers Builds triggers must each define the
following build variables with environment-appropriate values:

```text
VITE_API_DOMAIN_URL
VITE_API_BASE_PATH
VITE_REALTIME_WEBSOCKET_URL
VITE_REALTIME_BASE_PATH
VITE_APP_BASE_PATH
VITE_CONTACT_EMAIL
VITE_OAUTH_GOOGLE_CLIENT_ID
VITE_OAUTH_GOOGLE_REDIRECT_URL
VITE_OAUTH_STATE_TTL_MS
VITE_OAUTH_X_CLIENT_ID
VITE_OAUTH_X_CONSUMER_KEY
VITE_OAUTH_X_REDIRECT_URL
VITE_REALTIME_BLOCK_PACK_CHANNEL_RELEASE_DELAY_MS
VITE_TURNSTILE_SITE_KEY
```

The following build variables are used by the build pipeline rather than by
browser application code:

```text
CLOUDFLARE_WORKER_NAME
NITRO_PRESET
NODE_VERSION
```

Production requests therefore use `https://client.notegic.com/v1`, while
realtime connections use `wss://realtime.notegic.com/v1`. The public API-key
integration uses `https://api.notegic.com/v1` and is not used by the Web app.

`CLOUDFLARE_WORKER_NAME` is consumed while Nitro generates
`apps/web/.output/server/wrangler.json`; it is not a runtime secret.

## Configuration workflow

When adding or changing a frontend build-time variable, update each applicable
layer in this order:

1. Add the exact variable name to the source code and document its purpose in
   this inventory.
2. Add a safe local value to `apps/web/.env` for development, and add the
   production-shaped local value to `apps/web/.env.production` when a local
   production build needs it. These files are ignored by Git and must never be
   committed.
3. Add the exact variable name to the `build.env` list in the root
   `turbo.json`. Turborepo filters task environments; a variable can exist in
   Cloudflare Workers Builds and still be missing from the Vite process if it
   is absent from this list.
4. Add the value to the production Workers Builds trigger under its **Build
   variables** section.
5. Add the preview value to the non-production Workers Builds trigger when
   preview builds use different domains, OAuth redirect URLs, or service
   endpoints.
6. Re-run the build for the commit that contains the source and `turbo.json`
   change. A runtime variable under **Variables and Secrets** does not replace
   a build variable for `VITE_*` configuration.
7. Verify the build output and the deployed browser behavior before closing the
   change.

Do not use the Cloudflare Worker runtime variable section for `VITE_*` values.
Runtime bindings are available to Worker request handlers, but they are not
automatically embedded into the browser bundle by Vite.

## Local verification of build-time propagation

Run this from the repository root after changing `turbo.json` or a Vite env
variable:

```sh
npm run format:check
npm run lint
npm run typecheck
VITE_TURNSTILE_SITE_KEY=local-test-site-key npm run build:web:cloudflare
rg -l --fixed-strings \
  "local-test-site-key" \
  apps/web/.output/public apps/web/.output/server
```

The final command must find the test marker in the generated output. Use a
non-production marker for this check; never paste a real credential into shell
history or diagnostic output. The generated `.output/` directory is a build
artifact and must remain untracked.

For a variable other than Turnstile, replace the test assignment and marker
with that variable's safe test value. This check proves that the value reached
the Vite task through Turborepo; it does not replace a deployment smoke test.

## Cloudflare configuration and deployment verification

In the production Workers Builds trigger, verify all of the following before
starting a deployment:

1. The variable name is exact, including its `VITE_` prefix and spelling.
2. The value is attached to the production trigger, not only the preview
   trigger or Worker runtime settings.
3. The build uses the current commit and reports the expected build command.
4. The build completes successfully and the deployment points to the generated
   `apps/web/.output/server/wrangler.json`.

After deployment, verify the browser-facing behavior. For Turnstile, the
widget should load on the authentication pages and a completed verification
should allow the protected request to proceed. Do not log or copy the actual
token or site key while diagnosing the flow.

If the widget is absent or protected requests behave as if the site key is
missing even though the Cloudflare dashboard lists the variable, check these
boundaries in order:

1. Confirm the build variable belongs to the production trigger that builds
   `main`.
2. Confirm `VITE_TURNSTILE_SITE_KEY` is present in `turbo.json` under the
   `build.env` allowlist.
3. Confirm the new build used the commit containing the allowlist change.
4. Re-run the build after changing the variable and inspect the resulting
   deployment version.
5. Only then investigate browser cache, Worker routes, or Turnstile domain
   configuration.

## Local verification and manual deployment

From the repository root:

```sh
npm ci
npm run build:web:cloudflare
npm run deploy:web:cloudflare
```

The manual deployment requires Wrangler authentication. Keep the generated
`.output/` directory untracked; it is a build artifact.
