# Notegic Web

The Web application is the current Notegic client. It gives people a browser
workspace for organizing knowledge, editing content, planning work, and
receiving updates from collaborators.

## Features

- **Workspace organization:** create and arrange shelves, folders, materials,
  and block packs; recover removed items from Trash.
- **Document work:** edit block-based content, view materials, and work with
  rich content such as diagrams and mathematics.
- **Collaboration:** join shared block packs and keep compatible editors in
  sync in real time.
- **Routine planning:** manage stations, routines, tasks, tags, task history,
  and task dependency graphs.
- **Personal workspace:** use a dashboard with configurable widgets, themes,
  local preferences, and offline support.
- **Account and access:** register or sign in, manage linked sign-in methods,
  account security, API keys, and notification preferences.

## Technical overview

The app is a React application built with TanStack Start, Vite, and Nitro. It
uses GraphQL and HTTP contracts from `shared/`, browser-side persistence for
local preferences and offline data, and a WebSocket connection for realtime
updates. Styling and editor-specific assets remain Web-owned.

The backend owns business rules and durable data. This app consumes its public
contracts; do not add direct database access or duplicate server behavior in
the frontend.

## Local development

### Requirements

- Node.js `22.16.0` (see [`.nvmrc`](../../.nvmrc))
- npm `10.8.1`
- A running Notegic backend for end-to-end work

Install dependencies from the repository root:

```sh
npm install
```

Create an untracked `apps/web/.env` with the local API and realtime endpoints:

```dotenv
VITE_API_DOMAIN_URL=http://localhost
VITE_REALTIME_WEBSOCKET_URL=ws://localhost
VITE_APP_BASE_PATH=/development/v1
VITE_PORT=6776
```

OAuth variables are needed only while testing an OAuth flow. Never commit this
file or credential values.

Run the application from the repository root:

```sh
npm run dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Web development server. |
| `npm run build:web` | Build the Node SSR application. |
| `npm run start` | Run the built Node SSR output. |
| `npm run typecheck` | Typecheck the Web app and imported shared code. |
| `npm test -- --runInBand` | Run frontend tests. |
| `npm run format:check` | Check formatting. |
| `npm run lint` | Run lint checks. |
| `npm run codegen` | Generate GraphQL client artifacts. |
| `npm run codegen:check` | Verify generated artifacts are current. |
| `npm run build:web:cloudflare` | Build the Cloudflare Worker output. |
| `npm run deploy:web:cloudflare` | Build and deploy the Worker. |

Use `npm run codegen` after changing GraphQL schemas or documents. Do not
hand-edit `shared/api/graphql/generated/` or `src/routeTree.gen.ts`.

## Structure

```text
src/
  routes/           Route definitions
  pages/            Page-level UI and flows
  components/       Reusable Web UI
  providers/        Application state and lifecycle integration
  api/              Browser, server-function, and realtime adapters
  i18n/             Web i18n setup
  global/            Web-wide styles
assets/             Web-owned images, icons, and editor assets
public/             Browser metadata and public files
vite.config.ts      Web build and deployment configuration
```

`shared/` is for portable code with real multi-application consumers.
Browser-only APIs, CSS, Web assets, and route/UI code belong here under
`apps/web/`.

## Further reading

- [Frontend architecture](../../docs/codebase-design/frontend-architecture.md)
- [Frontend contracts and code generation](../../docs/api-route-design/frontend-contracts-and-codegen.md)
- [API, query, storage, and platform boundaries](../../docs/system-design/api-query-storage-platform-boundaries.md)
- [Cloudflare Workers deployment](../../docs/runbooks/cloudflare-workers-builds.md)
- [Frontend documentation map](../../docs/README.md)
