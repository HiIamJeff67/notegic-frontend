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
as a bootstrap candidate only when it contains no application tables. An empty
database uses the current bootstrap export; a version-`0` database that already
contains schema objects fails safely instead of deleting the OPFS file. Table
existence is used only as a destructive-operation guard, never to infer a
successful migration version.

### Startup sequence

The Web app must receive a non-empty `VITE_LOCAL_DATABASE_PATH` at build time.
It is a database filename/path, not a secret; configure it in the Cloudflare
build environment as well as local development. The path is used by SQLocal to
open the SQLite database in browser OPFS.

On startup, local database initialization follows this sequence:

1. Create the SQLocal worker and wait for its OPFS/SQLite connection.
2. Acquire the browser-wide migration lock so multiple tabs cannot initialize
   the same database concurrently.
3. Read SQLite `PRAGMA user_version`. This value is the only migration source
   of truth; table existence is not checked to infer the schema version.
4. If the version is `0` and the target is newer, confirm that the database has
   no application tables, then bootstrap the complete current schema from
   `bootstrap.sql`. An existing schema with version `0` fails safely and is not
   automatically deleted.
5. If the version is between `0` and the target, apply each pending Drizzle SQL
   migration in order.
6. For both bootstrap and incremental migration, execute schema statements,
   write `PRAGMA user_version`, and read it back inside the same transaction.
   A mismatch throws before commit, so schema changes and the version flag are
   rolled back together.
7. Read the committed version while still holding the migration lock. Only an
   exact match with the target version marks the database `ready` and allows
   transaction synchronization to continue.

The observable diagnostic phases are `worker-connection-pending`,
`worker-connected`, `migration-lock-pending`, `migration-lock-acquired`,
`reading-version`, `bootstrapping`, `migrating`, `verifying-schema`, `ready`,
`failed`, `needs-action`, and `manual-recovery`. Recovery-only phases include
operation draining, Yjs flushing, rebuildability checks, export, and storage
clearing. Worker-level diagnostics also report OPFS/SQLite initialization,
nested-worker errors, and individual query failures. A failure must leave the
database at its previous committed version; the next startup retries from that
version. An empty version-`0` database is bootstrapped from `bootstrap.sql`; a
non-empty version-`0` database requires explicit investigation before any
destructive recovery. See [Frontend Local Database Recovery](local-database-recovery.md)
for the user-facing recovery and export contract.

### Schema-change checklist

When changing the local schema:

1. Update the Drizzle schema source.
2. Run `npm run generate-local-migrations` to generate the new incremental SQL
   and refresh the complete bootstrap export.
3. Review the generated SQL, migration journal, and bootstrap diff. Do not
   rewrite or delete an incremental migration that has shipped.
4. Run `npm test -- --runInBand apps/web/src/api/local/migrator.test.ts`,
   `npm run typecheck`, and `npm run lint`.
5. Test an existing database upgrade and a fresh database bootstrap before
   deployment.

If initialization remains failed after a code fix, inspect the persisted local
database diagnostics first. Clearing site data is a destructive last-resort
manual recovery because it removes the browser's local unsynchronized data;
the application should not use table-presence checks as an automatic substitute
for the version flag.

Cloudflare Workers deployment is documented in
[Cloudflare Workers deployment](cloudflare-workers-builds.md).

## Runbook expectations

Each future runbook should state prerequisites, the command or procedure, the
expected result, common failure causes, and whether it changes generated or
local files.
