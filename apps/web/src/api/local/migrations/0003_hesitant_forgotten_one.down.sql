-- A previous bundle cannot replay queued control-node writes.
CREATE TEMP TABLE RoutineGraphMigrationCheck (valid integer NOT NULL CHECK(valid = 1));
INSERT INTO RoutineGraphMigrationCheck SELECT 0 FROM TransactionTable
WHERE entity_type = 'RoutineTask';
CREATE TABLE IF NOT EXISTS RoutineGraphUpdownBackup (
  routine_id text PRIMARY KEY NOT NULL, is_active integer NOT NULL,
  definition_version integer NOT NULL, initialized integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS RoutineNodeUpdownBackup AS SELECT * FROM RoutineTaskTable WHERE 0;
CREATE TABLE IF NOT EXISTS RoutineEdgeUpdownBackup AS SELECT * FROM RoutineDependencyTable WHERE 0;
INSERT OR REPLACE INTO RoutineGraphUpdownBackup (routine_id, is_active, definition_version, initialized)
SELECT id, is_active, definition_version, 1 FROM RoutineTable;
DELETE FROM RoutineNodeUpdownBackup;
DELETE FROM RoutineEdgeUpdownBackup;
INSERT INTO RoutineNodeUpdownBackup
  (id, routine_id, kind, title, purpose, payload, priority, max_attempts, previous_routine_task_ids, x, y, updated_at, created_at)
SELECT id, routine_id, kind, title, purpose, payload, priority, max_attempts, previous_routine_task_ids, x, y, updated_at, created_at FROM RoutineTaskTable;
INSERT INTO RoutineEdgeUpdownBackup SELECT edge.* FROM RoutineDependencyTable edge
JOIN RoutineTaskTable root ON root.id = edge.previous_routine_task_id WHERE root.kind = 'Start';
DELETE FROM RoutineDependencyTable WHERE previous_routine_task_id IN (SELECT id FROM RoutineTaskTable WHERE kind = 'Start');
DELETE FROM RoutinesToTasksTable WHERE task_id IN (SELECT id FROM RoutineTaskTable WHERE kind = 'Start');
DELETE FROM RoutineTaskTable WHERE kind = 'Start';
UPDATE RoutineTaskTable SET
  payload = json_remove(payload, '$.schemaVersion', '$.purpose'),
  previous_routine_task_ids = (SELECT json_group_array(previous_routine_task_id) FROM RoutineDependencyTable WHERE routine_task_id = RoutineTaskTable.id);
ALTER TABLE RoutineTaskTable DROP COLUMN kind;
ALTER TABLE RoutineTaskTable DROP COLUMN x;
ALTER TABLE RoutineTaskTable DROP COLUMN y;
ALTER TABLE RoutineTable DROP COLUMN is_active;
ALTER TABLE RoutineTable DROP COLUMN definition_version;
DROP TABLE RoutineGraphMigrationCheck;
