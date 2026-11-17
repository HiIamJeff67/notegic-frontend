# Local database diagnosis — 2026-09-11

In production on Zen Browser, SQLite WASM and OPFS started successfully and
committed a schema at version 1. On the same connection, a read-only probe
returned `{"raw":[1],"parsed":0,"tables":[19]}`. This put the Web app in the
migration failure state after COMMIT and could surface as a login, registration,
or home-page synchronization error. The investigation did not count lost rows
or verify historical HTTP responses.

## Cause and fix

Drizzle's raw SQLite `get` returned an array row, while SQLocal transaction
queries returned named object rows. The out-of-transaction reader treated
the array as an object and defaulted the missing field to 0. The old startup
then interpreted version 0 as a reason to delete and rebuild the database,
even after a successful migration.

[The version-reader fix](https://github.com/HiIamJeff67/notegic-frontend/commit/bf51349c99e6963fed2ffa9c839c1e05a64d4722)
corrected the array read. Current startup rejects an invalid version result
and allows a version-zero bootstrap only when there are no schema objects.
For current diagnostics, data protection, and verification, follow
[Frontend Local Database Recovery](local-database-recovery.md).

## Applying the findings

- Compare the raw version result, the migration transaction's committed
  version, and the recorded startup phase before attributing the failure to
  authentication, Yjs, or the browser's storage engine.
- A passing mocked migrator test can miss driver row-shape differences. The
  incident passed three Jest suites with ten tests. Smoke checks should wait
  for the recorded ready state and expected version.
- Preserve pending local data while diagnosing failed startup. The current
  recovery runbook covers the rebuild assessment, export, and browser checks.

The [original investigation](https://github.com/HiIamJeff67/notegic-frontend/blob/fd3715c9faad70bdcf5360254552bb1a565d57b4/docs/runbooks/local-database-diagnosis-2026-09-11.md)
retains the console timeline, versions, and the browser coverage limits.
