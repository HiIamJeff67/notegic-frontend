type DatabaseSync = {
  exec(sql: string): void;
  prepare(sql: string): {
    get(): Record<string, unknown> | undefined;
    all(): Record<string, unknown>[];
  };
  close(): void;
};
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as {
  DatabaseSync: new (path: string) => DatabaseSync;
};

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { splitSqlStatements } from "@/api/local/migrator";

const migrationDirectory = resolve(
  process.cwd(),
  "apps/web/src/api/local/migrations"
);
const readMigration = (name: string) =>
  readFileSync(resolve(migrationDirectory, name), "utf8");
const apply = (db: DatabaseSync, sql: string, version: number) => {
  db.exec("BEGIN");
  try {
    for (const statement of splitSqlStatements(sql)) db.exec(statement);
    db.exec(`PRAGMA user_version = ${version}`);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};
const up = readMigration("0003_hesitant_forgotten_one.sql");
const down = readMigration("0003_hesitant_forgotten_one.down.sql");
const openLegacy = () => {
  const db = new DatabaseSync(":memory:");
  const initial = readMigration("0000_naive_marten_broadcloak.sql")
    .replace(/("UserTable"\."is_logged_in")\s*=\s*\?/g, "$1 = 1")
    .replace(
      /("(?:UsersToShelvesTable|UsersToStationsTable)"\."permission")\s*=\s*\?/g,
      "$1 = 'Owner'"
    );
  db.exec(initial);
  db.exec(readMigration("0001_solid_the_spike.sql"));
  db.exec(readMigration("0002_first_tyrannus.sql"));
  db.exec(`INSERT INTO StationTable (id,name) VALUES ('station','Station');
    INSERT INTO UserTable (public_id,name,display_name,email) VALUES ('user','User','User','fixture@example.invalid');
    INSERT INTO RoutineTable (id, station_id, title) VALUES ('12345678-1234-4234-8234-123456789abc', 'station', 'Legacy');
    INSERT INTO RoutineTaskTable (id, routine_id, purpose, payload) VALUES ('task', '12345678-1234-4234-8234-123456789abc', 'GetRoutine', '{"routineId":"existing"}');
    INSERT INTO RoutineTaskDependencyGraphDraftTable (routine_id, nodes, edges) VALUES ('12345678-1234-4234-8234-123456789abc', '[{"id":"task","position":{"x":23,"y":47}}]', '[]');
    INSERT INTO TransactionTable (owner_public_id,entity_type,action_type,body,affected) VALUES ('user','Routine','UPDATE','{"routineId":"12345678-1234-4234-8234-123456789abc","values":{"title":"Pending"}}','{"retained":true}');
    PRAGMA user_version = 3;`);
  return db;
};

describe("Routine graph SQLite transition", () => {
  it("preserves rows, pending operations and graph layout through up/down/up", () => {
    const db = openLegacy();
    try {
      const pending = db.prepare("SELECT * FROM TransactionTable").all();
      const drafts = db
        .prepare("SELECT * FROM RoutineTaskDependencyGraphDraftTable")
        .all();
      apply(db, up, 4);
      expect(db.prepare("SELECT is_active FROM RoutineTable").get()).toEqual({
        is_active: 1,
      });
      expect(
        db
          .prepare(
            "SELECT kind,x,y,json_extract(payload,'$.purpose') AS purpose FROM RoutineTaskTable WHERE id='task'"
          )
          .get()
      ).toEqual({ kind: "Action", x: 23, y: 47, purpose: "GetRoutine" });
      expect(
        db.prepare("SELECT id FROM RoutineTaskTable WHERE kind='Start'").get()
      ).toEqual({ id: "92345678-1234-4234-8234-123456789abc" });
      db.exec(
        "UPDATE RoutineTable SET is_active=0; UPDATE RoutineTaskTable SET x=99 WHERE kind='Start'"
      );
      const nodes = db
        .prepare("SELECT id,kind,x,y,payload FROM RoutineTaskTable ORDER BY id")
        .all();
      apply(db, down, 3);
      expect(
        db.prepare("SELECT payload FROM RoutineTaskTable WHERE id='task'").get()
      ).toEqual({ payload: '{"routineId":"existing"}' });
      apply(db, up, 4);
      expect(
        db
          .prepare(
            "SELECT id,kind,x,y,payload FROM RoutineTaskTable ORDER BY id"
          )
          .all()
      ).toEqual(nodes);
      expect(db.prepare("SELECT is_active FROM RoutineTable").get()).toEqual({
        is_active: 0,
      });
      expect(db.prepare("SELECT * FROM TransactionTable").all()).toEqual(
        pending
      );
      expect(
        db.prepare("SELECT * FROM RoutineTaskDependencyGraphDraftTable").all()
      ).toEqual(drafts);
    } finally {
      db.close();
    }
  });
  it("rolls back conflicting payload metadata atomically without losing the queue", () => {
    const db = openLegacy();
    try {
      db.exec(`UPDATE RoutineTaskTable SET payload='{"schemaVersion":2}'`);
      expect(() => apply(db, up, 4)).toThrow();
      expect(db.prepare("PRAGMA user_version").get()).toEqual({
        user_version: 3,
      });
      expect(
        db.prepare("SELECT COUNT(*) AS count FROM TransactionTable").get()
      ).toEqual({ count: 1 });
      expect(
        db
          .prepare("PRAGMA table_info(RoutineTaskTable)")
          .all()
          .some(column => column.name === "kind")
      ).toBe(false);
    } finally {
      db.close();
    }
  });
  it("refuses downgrade while node writes remain queued", () => {
    const db = openLegacy();
    try {
      apply(db, up, 4);
      db.exec(
        `INSERT INTO TransactionTable (owner_public_id,entity_type,action_type,body) VALUES ('user','RoutineTask','CREATE','{}')`
      );
      expect(() => apply(db, down, 3)).toThrow();
      expect(db.prepare("PRAGMA user_version").get()).toEqual({
        user_version: 4,
      });
      expect(
        db
          .prepare(
            "SELECT COUNT(*) AS count FROM RoutineTaskTable WHERE kind='Start'"
          )
          .get()
      ).toEqual({ count: 1 });
    } finally {
      db.close();
    }
  });
  it("bootstraps a fresh database with inactive routines and typed nodes", () => {
    const db = new DatabaseSync(":memory:");
    try {
      db.exec(
        readFileSync(resolve(migrationDirectory, "../bootstrap.sql"), "utf8")
      );
      db.exec(
        "INSERT INTO StationTable (id,name) VALUES ('station','Station'); INSERT INTO RoutineTable (id,station_id,title) VALUES ('new','station','New')"
      );
      expect(
        db
          .prepare("SELECT is_active,definition_version FROM RoutineTable")
          .get()
      ).toEqual({ is_active: 0, definition_version: 1 });
    } finally {
      db.close();
    }
  });
});
