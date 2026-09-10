# Frontend Runbooks

Runbooks describe repeatable frontend development and verification procedures.
They should be written so a contributor can follow them from the repository
root without knowing the internal implementation of a backend microservice.

## Current commands

The frontend repository exposes these root commands. Web build, dev, and
typecheck tasks are delegated to Turborepo and filtered to `@notegic/web`.

| Command | Purpose |
| --- | --- |
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start the Web development server |
| `npm run build` | Build the Web application |
| `npm run build:web:cloudflare` | Build the Web application with Nitro's Cloudflare Workers preset |
| `npm run deploy:web:cloudflare` | Build and deploy the Web Worker with Wrangler |
| `npm run typecheck` | Typecheck the Web workspace |
| `npm run test` | Run Jest tests |
| `npm run format:all` | Run Biome formatting/checking with write enabled |
| `npm run format:check` | Check formatting without changing files |
| `npm run lint` | Run Biome lint checks |
| `npm run codegen` | Generate frontend GraphQL artifacts |
| `npm run codegen:check` | Regenerate GraphQL artifacts and fail on tracked drift |
| `npm run codegen:watch` | Watch and regenerate GraphQL artifacts |
| `npm run devlog` | Generate today's change snapshot and refresh the README index |
| `npm run install-hooks` | Enable the repository pre-commit checks |
| `npm run generate-local-migrations` | Generate the incremental Drizzle migration and refresh the current-schema bootstrap |
| `npm run generate-local-bootstrap` | Export the current local SQLite schema for fresh-database bootstrap |
| `npm run licenses:all` | Collect third-party license artifacts |

Commands are documented from the current `package.json`; update this page when
the root scripts change. Do not add backend Docker or microservice commands
here; link to the backend runbook instead.

## Local database migration workflow

The local SQLite schema uses two generated artifacts:

- `apps/web/src/api/local/migrations/` contains the immutable, incremental
  Drizzle migrations. Never rewrite or delete a migration that has shipped.
- `apps/web/src/api/local/bootstrap.sql` contains the complete current schema
  exported by `drizzle-kit export`. Fresh databases use this file to reach the
  current version directly.

After changing a local schema, run `npm run generate-local-migrations`. This
generates any new incremental migration and refreshes `bootstrap.sql` in one
step. Existing databases apply pending migrations in order. Each migration's
SQL statements and its `PRAGMA user_version` update run in one transaction; a
failure rolls back both. The browser migration lock prevents multiple tabs from
running the same migration concurrently. A database at version `0` is treated
as uninitialized: the OPFS database file is explicitly reset before the current
bootstrap is applied. Table existence is not used to infer migration state.

Cloudflare Workers deployment is documented in
[Cloudflare Workers deployment](cloudflare-workers-builds.md).

## Runbook expectations

Each future runbook should state prerequisites, the command or procedure, the
expected result, common failure causes, and whether it changes generated or
local files.
