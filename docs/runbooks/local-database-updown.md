# Local database up/down for Routine execution

The web application uses SQLite `PRAGMA user_version` to track local migrations. Version 3 (`0002_first_tyrannus`) removes Routine `status`, RoutineTask `phase` and `cost_unit`, and adds Routine `timeout_seconds` with a 300-second default. Its matching `.down.sql` restores the removed fields from backup tables; a subsequent up restores timeout values changed before rollback.

## Upgrade

Deploy the frontend only after the backend accepts the new Routine and task contracts. On startup, `LocalDBMigrator.ensureMigrated` applies the SQL in one transaction and advances `user_version` to 3. Fresh local databases use the generated `bootstrap.sql` at the current version. Do not edit generated snapshots or bootstrap SQL without regenerating and verifying them against the schema.

## Rollback

Stop new writes and preserve a copy of the browser's origin storage before downgrading. While the current frontend bundle is still active, call `LocalDBMigrator.down(3)` against the user's local database. It verifies the actual `user_version` inside the rollback transaction, restores the legacy fields and sets `user_version` to 2. Only then deploy the previous frontend bundle. An older bundle cannot execute a down migration introduced by a newer bundle. A server-side deploy alone cannot automatically modify every user's browser database; users who have not run the down migration must continue using the compatible frontend until migration is coordinated.

To verify the SQL without a browser, create a disposable SQLite database with the version-2 Routine and RoutineTask tables and sample rows, then apply `0002_first_tyrannus.sql`, `0002_first_tyrannus.down.sql`, and the up SQL again. Assert that status, phase, cost unit and the changed timeout survive the round trip. Do not test rollback on a user's only local copy.

The backup tables are deliberate. An upgraded database retains the removed status, phase, and cost-unit values for a possible down migration. A database created directly at the new version has no such backups; down recreates empty backup tables and uses the legacy column defaults instead. Down drops those old-field backups and retains a timeout backup until a future up restores it.
