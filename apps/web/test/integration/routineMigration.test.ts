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
import { LocalDBMigrator, splitSqlStatements } from "@/api/local/migrator";

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
      expect(
        db
          .prepare("PRAGMA table_info(RoutineTaskTable)")
          .all()
          .some(column => column.name === "purpose")
      ).toBe(false);
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
      db.exec(
        `INSERT INTO RoutineTaskTable (id,routine_id,payload) VALUES ('fresh-action','new','{"schemaVersion":1,"purpose":"GetRoutine","routineId":"target"}'); PRAGMA user_version=4;`
      );
      apply(db, down, 3);
      expect(
        db
          .prepare(
            "SELECT purpose,payload FROM RoutineTaskTable WHERE id='fresh-action'"
          )
          .get()
      ).toEqual({ purpose: "GetRoutine", payload: '{"routineId":"target"}' });
      apply(db, up, 4);
      expect(
        db
          .prepare("PRAGMA table_info(RoutineTaskTable)")
          .all()
          .some(column => column.name === "purpose")
      ).toBe(false);
      expect(
        db
          .prepare(
            "SELECT json_extract(payload,'$.purpose') AS purpose FROM RoutineTaskTable WHERE id='fresh-action'"
          )
          .get()
      ).toEqual({ purpose: "GetRoutine" });
    } finally {
      db.close();
    }
  });
});

describe("Routine activation schedule SQLite transition", () => {
  it.each([
    "up",
    "down",
  ] as const)("rolls back actual SQLite DDL, data and version after a failed %s", async direction => {
    const db = openLegacy();
    try {
      apply(db, up, 4);
      const activationUp = readMigration(
        "0004_routine_activation_schedule.sql"
      );
      const activationDown = readMigration(
        "0004_routine_activation_schedule.down.sql"
      );
      if (direction === "down") apply(db, activationUp, 5);
      const before = {
        routines: db.prepare("SELECT * FROM RoutineTable ORDER BY id").all(),
        tasks: db.prepare("SELECT * FROM RoutineTaskTable ORDER BY id").all(),
        drafts: db
          .prepare("SELECT * FROM RoutineTaskDependencyGraphDraftTable")
          .all(),
        queue: db.prepare("SELECT * FROM TransactionTable").all(),
        columns: db.prepare("PRAGMA table_info(RoutineTable)").all(),
        version: db.prepare("PRAGMA user_version").get(),
      };
      const mutations = [
        "UPDATE RoutineTable SET title='must roll back'",
        "DELETE FROM RoutineTaskDependencyGraphDraftTable",
        "DELETE FROM TransactionTable",
      ];
      let injectFailure = true;
      const migrations = Array.from({ length: 5 }, (_, idx) => ({
        idx,
        tag: idx === 4 ? "0004_routine_activation_schedule" : `fixture-${idx}`,
        versionNumber: idx,
        sqlContent: idx === 4 ? activationUp : "",
        statements:
          idx === 4 ? [...splitSqlStatements(activationUp), ...mutations] : [],
        downStatements:
          idx === 4
            ? [...splitSqlStatements(activationDown), ...mutations]
            : [],
      }));
      const migrator = new LocalDBMigrator(
        {
          transaction: async operation => {
            db.exec("BEGIN");
            try {
              const result = await operation({
                run: async query => {
                  const rows = db.prepare(query).all();
                  if (
                    injectFailure &&
                    query ===
                      `PRAGMA user_version = ${direction === "up" ? 5 : 4}`
                  ) {
                    throw new Error(
                      "controlled failure after DDL, DML and version write"
                    );
                  }
                  return rows;
                },
              });
              db.exec("COMMIT");
              return result;
            } catch (error) {
              db.exec("ROLLBACK");
              throw error;
            }
          },
        },
        migrations
      );
      await expect(
        direction === "up"
          ? migrator.ensureMigrated({ currentVersion: 4, targetVersion: 5 })
          : migrator.down(5)
      ).rejects.toThrow("controlled failure");
      expect({
        routines: db.prepare("SELECT * FROM RoutineTable ORDER BY id").all(),
        tasks: db.prepare("SELECT * FROM RoutineTaskTable ORDER BY id").all(),
        drafts: db
          .prepare("SELECT * FROM RoutineTaskDependencyGraphDraftTable")
          .all(),
        queue: db.prepare("SELECT * FROM TransactionTable").all(),
        columns: db.prepare("PRAGMA table_info(RoutineTable)").all(),
        version: db.prepare("PRAGMA user_version").get(),
      }).toEqual(before);
      injectFailure = false;
      await expect(
        direction === "up"
          ? migrator.ensureMigrated({ currentVersion: 4, targetVersion: 5 })
          : migrator.down(5)
      ).resolves.toMatchObject({ finalVersion: direction === "up" ? 5 : 4 });
    } finally {
      db.close();
    }
  });

  it("preserves windows, graph drafts and pending writes through up/down/up", () => {
    const db = openLegacy();
    try {
      apply(db, up, 4);
      const original = db
        .prepare(
          "SELECT scheduled_start_at, scheduled_end_at FROM RoutineTable"
        )
        .all();
      const drafts = db
        .prepare("SELECT * FROM RoutineTaskDependencyGraphDraftTable")
        .all();
      const pending = db.prepare("SELECT * FROM TransactionTable").all();
      const activationUp = readMigration(
        "0004_routine_activation_schedule.sql"
      );
      const activationDown = readMigration(
        "0004_routine_activation_schedule.down.sql"
      );
      apply(db, activationUp, 5);
      expect(
        db.prepare("SELECT has_custom_schedule FROM RoutineTable").get()
      ).toEqual({ has_custom_schedule: 1 });
      db.exec(
        "INSERT INTO RoutineTable (id,station_id,title) VALUES ('new-default','station','Default')"
      );
      expect(
        db
          .prepare(
            "SELECT has_custom_schedule FROM RoutineTable WHERE id='new-default'"
          )
          .get()
      ).toEqual({ has_custom_schedule: 0 });
      apply(db, activationDown, 4);
      expect(
        db
          .prepare("PRAGMA table_info(RoutineTable)")
          .all()
          .some(column => column.name === "has_custom_schedule")
      ).toBe(false);
      apply(db, activationUp, 5);
      expect(
        db
          .prepare(
            "SELECT scheduled_start_at, scheduled_end_at FROM RoutineTable WHERE id='12345678-1234-4234-8234-123456789abc'"
          )
          .all()
      ).toEqual(original);
      expect(
        db.prepare("SELECT * FROM RoutineTaskDependencyGraphDraftTable").all()
      ).toEqual(drafts);
      expect(db.prepare("SELECT * FROM TransactionTable").all()).toEqual(
        pending
      );
      expect(db.prepare("PRAGMA user_version").get()).toEqual({
        user_version: 5,
      });
    } finally {
      db.close();
    }
  });
});
