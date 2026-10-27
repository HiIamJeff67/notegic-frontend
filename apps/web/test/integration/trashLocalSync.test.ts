import type { UUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { BlockPackLocalSynchronizer } from "@/api/local/synchronizers/blockPack.synchronizer";
import { MaterialLocalSynchronizer } from "@/api/local/synchronizers/material.synchronizer";
import { RootShelfLocalSynchronizer } from "@/api/local/synchronizers/rootShelf.synchronizer";
import { SubShelfLocalSynchronizer } from "@/api/local/synchronizers/subShelf.synchronizer";

type DatabaseSync = {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): unknown;
    all(...params: unknown[]): Record<string, unknown>[];
  };
  close(): void;
};
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as {
  DatabaseSync: new (path: string) => DatabaseSync;
};
let mockLocalDB: ReturnType<typeof drizzle> & { isReady: boolean };
jest.mock("@/api/local/db", () => ({
  get localDB() {
    return mockLocalDB;
  },
}));

const id = (suffix: number) =>
  `12345678-1234-4234-8234-${String(suffix).padStart(12, "0")}` as UUID;
const root = id(1);
const otherRoot = id(2);
const shelf = id(3);
const child = id(4);
const material = id(5);
const pack = id(6);
const otherPack = id(7);
const otherShelf = id(8);
const tables = [
  "RootShelfTable",
  "SubShelfTable",
  "BlockPackTable",
  "ItemTable",
  "RoutinesToItemsTable",
  "UsersToShelvesTable",
];
const snapshot = (db: DatabaseSync) =>
  tables.map(table =>
    db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
  );
const openFixture = () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    readFileSync(
      resolve(process.cwd(), "apps/web/src/api/local/bootstrap.sql"),
      "utf8"
    )
  );
  db.exec(`PRAGMA foreign_keys = ON;
    INSERT INTO UserTable (public_id,name,display_name,email) VALUES ('user','User','User','fixture@example.invalid');
    INSERT INTO RootShelfTable (id,deleted_at) VALUES ('${root}',1),('${otherRoot}',1);
    INSERT INTO UsersToShelvesTable (user_public_id,root_shelf_id,permission) VALUES ('user','${root}','Owner'),('user','${otherRoot}','Owner');
    INSERT INTO SubShelfTable (id,root_shelf_id,prev_sub_shelf_id,path,deleted_at) VALUES
      ('${shelf}','${root}',NULL,'[]',1),
      ('${child}','${root}','${shelf}','["${shelf}"]',1),
      ('${otherShelf}','${otherRoot}',NULL,'[]',1);
    INSERT INTO BlockPackTable (id,parent_sub_shelf_id,deleted_at) VALUES ('${pack}','${child}',1),('${otherPack}','${otherShelf}',1);
    INSERT INTO ItemTable (id,parent_sub_shelf_id,root_shelf_id,type,deleted_at) VALUES
      ('${material}','${shelf}','${root}','Material',1),
      ('${pack}','${child}','${root}','BlockPack',1),
      ('${otherPack}','${otherShelf}','${otherRoot}','BlockPack',1);
    INSERT INTO StationTable (id,name) VALUES ('station','Station');
    INSERT INTO RoutineTable (id,station_id,title) VALUES ('routine','station','Routine');
    INSERT INTO RoutinesToItemsTable (routine_id,item_id) SELECT 'routine',id FROM ItemTable;`);
  mockLocalDB = Object.assign(
    drizzle(async (sql, params, method) => {
      const statement = db.prepare(sql);
      if (method === "run") {
        statement.run(...params);
        return { rows: [] };
      }
      const rows = statement.all(...params).map(row => Object.values(row));
      return { rows: method === "get" ? rows[0] : rows };
    }),
    { isReady: true }
  );
  return db;
};

describe("Trash confirmed actions in real SQLite", () => {
  const header = { userAgent: "fixture" };
  const response = {
    success: true as const,
    exception: null,
    data: { deletedAt: new Date() },
    embedded: { publicId: "user" },
  };
  const cases = [
    {
      type: "material",
      table: "ItemTable",
      expected: [2, 3, 2, 2, 2, 2],
      run: () =>
        MaterialLocalSynchronizer.syncHardDeleteMyMaterialsByIds(
          { header, body: { materialIds: [material] } },
          response
        ),
    },
    {
      type: "block pack",
      table: "BlockPackTable",
      expected: [2, 3, 1, 2, 2, 2],
      run: () =>
        BlockPackLocalSynchronizer.syncHardDeleteMyBlockPacksByIds(
          { header, body: { blockPackIds: [pack] } },
          response
        ),
    },
    {
      type: "sub shelf",
      table: "SubShelfTable",
      expected: [2, 1, 1, 1, 1, 2],
      run: () =>
        SubShelfLocalSynchronizer.syncHardDeleteMySubShelvesByIds(
          { header, body: { subShelfIds: [shelf] } },
          response
        ),
    },
    {
      type: "root shelf",
      table: "RootShelfTable",
      expected: [1, 1, 1, 1, 1, 1],
      run: () =>
        RootShelfLocalSynchronizer.syncHardDeleteMyRootShelvesByIds(
          { header, body: { rootShelfIds: [root] } },
          response
        ),
    },
  ];
  for (const scenario of cases) {
    it(`cleans ${scenario.type} references and descendants while retaining another root`, async () => {
      const db = openFixture();
      try {
        await scenario.run();
        expect(snapshot(db).map(rows => rows.length)).toEqual(
          scenario.expected
        );
        expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
        expect(
          db
            .prepare(`SELECT id FROM BlockPackTable WHERE id='${otherPack}'`)
            .all()
        ).toEqual([{ id: otherPack }]);
      } finally {
        db.close();
      }
    });
    it(`rolls back ${scenario.type} cache cleanup when the final delete fails`, async () => {
      const db = openFixture();
      try {
        const before = snapshot(db);
        db.exec(
          `CREATE TRIGGER reject_delete BEFORE DELETE ON ${scenario.table} BEGIN SELECT RAISE(ABORT, 'fixture failure'); END;`
        );
        await expect(scenario.run()).rejects.toThrow();
        expect(snapshot(db)).toEqual(before);
      } finally {
        db.close();
      }
    });
  }
  it("restores only returned roots in a partial response", async () => {
    const db = openFixture();
    try {
      await RootShelfLocalSynchronizer.syncRestoreMyRootShelvesByIds(
        { header, body: { rootShelfIds: [root, otherRoot] } },
        {
          success: true,
          exception: null,
          data: [
            {
              id: root,
              name: "Root",
              subShelfCount: 2,
              itemCount: 2,
              lastAnalyzedAt: new Date(),
              updatedAt: new Date(),
              createdAt: new Date(),
              deletedAt: null,
            },
          ],
          embedded: { publicId: "user" },
        }
      );
      expect(
        db.prepare("SELECT id,deleted_at FROM RootShelfTable ORDER BY id").all()
      ).toEqual([
        { id: root, deleted_at: null },
        { id: otherRoot, deleted_at: 1 },
      ]);
    } finally {
      db.close();
    }
  });
  it("counts only returned block packs in a partial restore response", async () => {
    const db = openFixture();
    try {
      await BlockPackLocalSynchronizer.syncRestoreMyBlockPacksByIds(
        {
          header,
          body: { blockPackIds: [pack, otherPack] },
          affected: {
            rootShelfIds: [root, otherRoot],
            parentSubShelfIds: [child, otherShelf],
          },
        },
        {
          success: true,
          exception: null,
          data: [
            {
              id: pack,
              parentSubShelfId: child,
              name: "Pack",
              icon: null,
              headerBackgroundURL: null,
              blockCount: 0,
              deletedAt: null,
              updatedAt: new Date(),
              createdAt: new Date(),
            },
          ],
          embedded: { publicId: "user" },
        }
      );
      expect(
        db.prepare("SELECT id,item_count FROM RootShelfTable ORDER BY id").all()
      ).toEqual([
        { id: root, item_count: 1 },
        { id: otherRoot, item_count: 0 },
      ]);
      expect(
        db.prepare("SELECT id,deleted_at FROM BlockPackTable ORDER BY id").all()
      ).toEqual([
        { id: pack, deleted_at: null },
        { id: otherPack, deleted_at: 1 },
      ]);
    } finally {
      db.close();
    }
  });
});
