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

## Environment variables

Set the following as environment-scoped build variables in Cloudflare Workers
Builds. Values are deliberately not committed because Vite embeds `VITE_*`
values in the browser bundle.

```text
VITE_API_DOMAIN_URL
VITE_REALTIME_WEBSOCKET_URL
VITE_APP_BASE_PATH
VITE_OAUTH_GOOGLE_CLIENT_ID
VITE_OAUTH_GOOGLE_REDIRECT_URL
VITE_OAUTH_X_CLIENT_ID
VITE_OAUTH_X_CONSUMER_KEY
VITE_OAUTH_X_REDIRECT_URL
VITE_REALTIME_BLOCK_PACK_CHANNEL_RELEASE_DELAY_MS
```

`CLOUDFLARE_WORKER_NAME` is consumed while Nitro generates
`apps/web/.output/server/wrangler.json`; it is not a runtime secret.

## Local verification and manual deployment

From the repository root:

```sh
npm ci
npm run build:web:cloudflare
npm run deploy:web:cloudflare
```

The manual deployment requires Wrangler authentication. Keep the generated
`.output/` directory untracked; it is a build artifact.
