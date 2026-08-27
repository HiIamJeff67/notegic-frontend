# Frontend Development Logs

Frontend development logs record dated architecture and implementation context
that is useful beyond a single pull request. They belong to this repository and
should not duplicate backend project history.

Daily snapshots are generated from the current change and local Git history.
They record the files in the current worktree, recent commit subjects, and
changed top-level areas; they do not invent intent, call GitHub, or call an AI
service. Detailed decisions remain in architecture documents and manually
authored decision logs.

## File layout

Use monthly directories and ISO dates:

```text
docs/devlogs/YYYY-MM/YYYY-MM-DD.md
```

Generated daily snapshots use this layout:

```text
docs/devlogs/YYYY-MM/YYYY-MM-DD.md
```

Each generated snapshot contains:

```markdown
# Development log — YYYY-MM-DD

## Current change

## Recent commits

## Changed areas

## Regeneration
```

Manually authored decision logs may use a descriptive suffix, such as
`YYYY-MM-DD-frontend-monorepo-phase-1.md`, and should use a concise title and
cover:

```markdown
# YYYY-MM-DD — Short title

## Context

## Decision or change

## Consequences

## Related issues
```

Devlogs should record decisions, migration boundaries, and noteworthy behavior.
They should not be used as a replacement for conventions, API contracts, or
runbooks.

## Generate and refresh the index

From the repository root, run one of these commands:

```bash
npm run devlog
node scripts/devlog.mjs
```

The command reads the current tracked and untracked change, writes today's
generated snapshot, and refreshes the `DEVLOG:START`/`DEVLOG:END` section at the
bottom of the root `README.md`. The generated README index and devlog files are
excluded from the current-change list. The default includes 20 commits. To
change that for one run, use `DEVLOG_COMMITS=50 npm run devlog`. To write to
another archive during experimentation, use
`DEVLOG_ARCHIVE_DIR=/tmp/notegic-devlogs npm run devlog`.

Use `npm run devlog:help` for the supported options. The command is
deterministic and reads local Git refs. It does not fetch or merge remote
history automatically.

To refresh GitHub's remote refs and recreate historical snapshots for every
commit date on `origin/main`, run:

```bash
npm run devlog:fetch
npm run devlog:backfill
```

`devlog:fetch` only updates local remote refs. `devlog:backfill` creates one
generated snapshot per historical commit date, so older GitHub commits can be
reviewed in the same monthly archive structure as the backend. Use
`node scripts/devlog.mjs --backfill --ref <git-ref>` for another branch or
remote ref.

## Pre-commit verification

Enable the repository hook once per checkout:

```bash
npm run install-hooks
```

Before committing, stage the intended code first, run `npm run devlog`, and
stage the generated README and snapshot. The pre-commit hook regenerates the
snapshot from the staged index and rejects a missing or outdated devlog.

## Entries

- [2026-08-26 — Frontend monorepo Phase 1](2026-08/2026-08-26-frontend-monorepo-phase-1.md)

## Generated snapshots

- [2026-08-26](2026-08/2026-08-26.md)
