# Frontend Runbooks

Runbooks describe repeatable frontend development and verification procedures.
They should be written so a contributor can follow them from the repository
root without knowing the internal implementation of a backend microservice.

## Current commands

The frontend repository exposes these root commands:

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
| `npm run generate-local-migrations` | Generate local Drizzle migrations |
| `npm run licenses:all` | Collect third-party license artifacts |

Commands are documented from the current `package.json`; update this page when
the root scripts change. Do not add backend Docker or microservice commands
here; link to the backend runbook instead.

Cloudflare Workers deployment is documented in
[Cloudflare Workers deployment](cloudflare-workers-builds.md).

## Runbook expectations

Each future runbook should state prerequisites, the command or procedure, the
expected result, common failure causes, and whether it changes generated or
local files.
