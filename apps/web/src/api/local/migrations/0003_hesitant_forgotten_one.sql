ALTER TABLE RoutineTable ADD COLUMN is_active integer NOT NULL DEFAULT 0;
ALTER TABLE RoutineTable ADD COLUMN definition_version integer NOT NULL DEFAULT 1;
ALTER TABLE RoutineTaskTable ADD COLUMN kind text NOT NULL DEFAULT 'Action';
ALTER TABLE RoutineTaskTable ADD COLUMN x real NOT NULL DEFAULT 0;
ALTER TABLE RoutineTaskTable ADD COLUMN y real NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS RoutineGraphUpdownBackup (
  routine_id text PRIMARY KEY NOT NULL,
  is_active integer NOT NULL,
  definition_version integer NOT NULL,
  initialized integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS RoutineNodeUpdownBackup AS SELECT * FROM RoutineTaskTable WHERE 0;
CREATE TABLE IF NOT EXISTS RoutineEdgeUpdownBackup AS SELECT * FROM RoutineDependencyTable WHERE 0;
INSERT OR IGNORE INTO RoutineGraphUpdownBackup (routine_id, is_active, definition_version)
SELECT id, 1, 1 FROM RoutineTable;
UPDATE RoutineTable SET
  is_active = (SELECT is_active FROM RoutineGraphUpdownBackup WHERE routine_id = RoutineTable.id),
  definition_version = (SELECT definition_version FROM RoutineGraphUpdownBackup WHERE routine_id = RoutineTable.id);
-- Preserve legacy scheduling intent in queued creates.
UPDATE TransactionTable SET body = json_set(body, '$.isActive', json('true'))
WHERE entity_type = 'Routine' AND action_type = 'CREATE' AND json_type(body, '$.createdRoutines') IS NULL AND json_type(body, '$.isActive') IS NULL;
UPDATE TransactionTable SET body = json_set(body, '$.createdRoutines', json((
  SELECT json_group_array(json(CASE WHEN json_type(entry.value, '$.isActive') IS NULL
    THEN json_set(entry.value, '$.isActive', json('true')) ELSE entry.value END))
  FROM json_each(TransactionTable.body, '$.createdRoutines') entry
)))
WHERE entity_type = 'Routine' AND action_type = 'CREATE' AND json_type(body, '$.createdRoutines') = 'array';

CREATE TEMP TABLE RoutineGraphMigrationCheck (valid integer NOT NULL CHECK(valid = 1));
INSERT INTO RoutineGraphMigrationCheck
SELECT 0 FROM RoutineTaskTable WHERE json_valid(payload) = 0
  OR json_type(payload) <> 'object'
  OR (json_type(payload, '$.schemaVersion') IS NOT NULL AND json_extract(payload, '$.schemaVersion') <> 1)
  OR (json_type(payload, '$.purpose') IS NOT NULL AND json_extract(payload, '$.purpose') <> purpose);
UPDATE RoutineTaskTable SET payload = json_set(payload, '$.schemaVersion', 1, '$.purpose', purpose);
UPDATE RoutineTaskTable SET
  x = COALESCE((SELECT json_extract(node.value, '$.position.x')
    FROM RoutineTaskDependencyGraphDraftTable draft, json_each(draft.nodes) node
    WHERE draft.routine_id = RoutineTaskTable.routine_id AND json_extract(node.value, '$.id') = RoutineTaskTable.id), x),
  y = COALESCE((SELECT json_extract(node.value, '$.position.y')
    FROM RoutineTaskDependencyGraphDraftTable draft, json_each(draft.nodes) node
    WHERE draft.routine_id = RoutineTaskTable.routine_id AND json_extract(node.value, '$.id') = RoutineTaskTable.id), y);
UPDATE RoutineTaskTable SET
  x = (SELECT x FROM RoutineNodeUpdownBackup WHERE id = RoutineTaskTable.id),
  y = (SELECT y FROM RoutineNodeUpdownBackup WHERE id = RoutineTaskTable.id)
WHERE id IN (SELECT id FROM RoutineNodeUpdownBackup);

INSERT OR IGNORE INTO RoutineTaskTable
  (id, routine_id, kind, title, purpose, payload, priority, max_attempts, previous_routine_task_ids, x, y, updated_at, created_at)
SELECT id, routine_id, kind, title, purpose, payload, priority, max_attempts, previous_routine_task_ids, x, y, updated_at, created_at
FROM RoutineNodeUpdownBackup WHERE kind = 'Start' AND routine_id IN (SELECT id FROM RoutineTable);
INSERT OR IGNORE INTO RoutineDependencyTable
  (routine_task_id, previous_routine_task_id, description, progress, updated_at, created_at)
SELECT routine_task_id, previous_routine_task_id, description, progress, updated_at, created_at
FROM RoutineEdgeUpdownBackup WHERE routine_task_id IN (SELECT id FROM RoutineTaskTable)
  AND previous_routine_task_id IN (SELECT id FROM RoutineTaskTable);

-- This UUID mapping is also used by the PostgreSQL backfill.
INSERT INTO RoutineTaskTable
  (id, routine_id, kind, title, purpose, payload, priority, max_attempts, previous_routine_task_ids, x, y, updated_at, created_at)
SELECT substr('89abcdef01234567', instr('0123456789abcdef', substr(lower(routine.id), 1, 1)), 1) || substr(routine.id, 2),
  routine.id, 'Start', 'Start', '', '{"schemaVersion":1,"isActive":true,"description":""}', 0, 1, '[]', 0, 0, routine.updated_at, routine.created_at
FROM RoutineTable routine JOIN RoutineGraphUpdownBackup backup ON backup.routine_id = routine.id
WHERE backup.initialized = 0
  AND EXISTS (SELECT 1 FROM RoutineTaskTable WHERE routine_id = routine.id AND kind = 'Action')
  AND NOT EXISTS (SELECT 1 FROM RoutineTaskTable WHERE routine_id = routine.id AND kind = 'Start');
INSERT OR IGNORE INTO RoutineDependencyTable (routine_task_id, previous_routine_task_id, description, progress, updated_at, created_at)
SELECT task.id, root.id, '', 0, task.updated_at, task.created_at
FROM RoutineTaskTable task JOIN RoutineTaskTable root ON root.routine_id = task.routine_id AND root.kind = 'Start'
JOIN RoutineGraphUpdownBackup backup ON backup.routine_id = task.routine_id AND backup.initialized = 0
WHERE task.kind = 'Action' AND NOT EXISTS (SELECT 1 FROM RoutineDependencyTable WHERE routine_task_id = task.id);
UPDATE RoutineTaskTable SET previous_routine_task_ids = (
  SELECT json_group_array(previous_routine_task_id) FROM RoutineDependencyTable WHERE routine_task_id = RoutineTaskTable.id
);
UPDATE RoutineGraphUpdownBackup SET initialized = 1;
DROP TABLE RoutineGraphMigrationCheck;
