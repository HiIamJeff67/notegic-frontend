import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@/api/local/schemas";
import { TransactionActionType as Action } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType as Entity } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import {
  MaterialLocalSynchronizer,
  replaceMaterialId,
} from "@/api/local/synchronizers/material.synchronizer";
import { prepareMaterialSyncJobs } from "@/providers/TransactionSynchronizerProvider/materialSyncLogic";
import { prepareRoutineRelationSyncJobs } from "@/providers/TransactionSynchronizerProvider/RoutineRelationSyncLogic";
import type { MergedTransaction } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";

type SQLite = {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): unknown;
    all(...params: unknown[]): Record<string, unknown>[];
  };
  close(): void;
};
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as {
  DatabaseSync: new (path: string) => SQLite;
};
let mockLocalDB: ReturnType<typeof drizzle> & { isReady: boolean };
jest.mock("@/api/local/db", () => ({
  get localDB() {
    return mockLocalDB;
  },
}));
// These tests exercise prepared jobs and persistence, without mounting React providers.
jest.mock(
  "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider",
  () => ({
    getTransactionSequences: (transaction: MergedTransaction) =>
      transaction.mergedSequences,
    mergeSet: (target: Set<number>, values: Iterable<number>) => {
      for (const value of values) target.add(value);
    },
  })
);

const id = (n: number) =>
  `12345678-1234-4234-8234-${String(n).padStart(12, "0")}`;
const offlineId = id(1),
  remoteId = id(2),
  shelfId = id(3),
  rootId = id(4);
const affected = { rootShelfId: rootId, parentSubShelfId: shelfId };
const transaction = (
  sequence: number,
  body: unknown,
  mergedSequences = [sequence]
): MergedTransaction => ({
  sequence,
  body,
  mergedSequences: new Set(mergedSequences),
  affected,
  entityType: Entity.Material,
  actionType: Action.UPDATE,
  ownerPublicId: "user",
  retryCount: 0,
  lastError: null,
  createdAt: new Date(0),
});
const response = {
  success: true,
  exception: null,
  data: { id: remoteId, createdAt: new Date(0) },
  embedded: { publicId: "user" },
};
const mutators = () => ({
  createMaterialMutator: { mutateAsync: jest.fn(async () => response) },
  updateMaterialMutator: {
    mutateAsync: jest.fn(async (_request: unknown) => ({ success: true })),
  },
  moveMaterialMutator: {
    mutateAsync: jest.fn(async () => ({ success: true })),
  },
  restoreMaterialMutator: {
    mutateAsync: jest.fn(async () => ({ success: true })),
  },
  restoreMaterialsMutator: {
    mutateAsync: jest.fn(async () => ({ success: true })),
  },
  deleteMaterialMutator: {
    mutateAsync: jest.fn(async () => ({ success: true })),
  },
  deleteMaterialsMutator: {
    mutateAsync: jest.fn(async () => ({ success: true })),
  },
  hardDeleteMaterialsMutator: {
    mutateAsync: jest.fn(async () => ({ success: true })),
  },
});
const fixture = () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    readFileSync(
      resolve(process.cwd(), "apps/web/src/api/local/bootstrap.sql"),
      "utf8"
    )
  );
  db.exec(`PRAGMA foreign_keys=ON;
    INSERT INTO UserTable(public_id,name,display_name,email) VALUES ('user','User','User','fixture@example.invalid');
    INSERT INTO RootShelfTable(id) VALUES ('${rootId}');
    INSERT INTO SubShelfTable(id,root_shelf_id,path) VALUES ('${shelfId}','${rootId}','[]');
    INSERT INTO MaterialTable(id,parent_sub_shelf_id,root_shelf_id,name,created_at,updated_at) VALUES ('${offlineId}','${shelfId}','${rootId}','Renamed locally',1,2);
    INSERT INTO ItemTable(id,parent_sub_shelf_id,root_shelf_id,type,created_at,updated_at) VALUES ('${offlineId}','${shelfId}','${rootId}','Material',1,2);
    INSERT INTO StationTable(id,name) VALUES ('station','Station');
    INSERT INTO RoutineTable(id,station_id,title) VALUES ('${id(5)}','station','Routine');
    INSERT INTO RoutinesToItemsTable(routine_id,item_id) VALUES ('${id(5)}','${offlineId}');`);
  mockLocalDB = Object.assign(
    drizzle(
      async (sql, params, method) => {
        const statement = db.prepare(sql);
        if (method === "run") {
          statement.run(...params);
          return { rows: [] };
        }
        const rows = statement.all(...params).map(row => Object.values(row));
        return { rows: method === "get" ? rows[0] : rows };
      },
      { schema }
    ),
    { isReady: true }
  );
  return db;
};

test("each merged Material job retains all of its own acknowledgement sequences", async () => {
  const updates = [
    transaction(
      12,
      { materialId: offlineId, values: { name: "First" } },
      [11, 12]
    ),
    transaction(13, { materialId: remoteId, values: { name: "Second" } }),
  ];
  const result = prepareMaterialSyncJobs({
    transactions: updates,
    header: { userAgent: "test" },
    mutators: mutators(),
    acknowledgeCreate: jest.fn(),
  });
  expect(result.syncJobs.map(job => [...job.sequences])).toEqual([
    [11, 12],
    [13],
  ]);
});

test("an unsuccessful predecessor defers later Material jobs without sending them", async () => {
  const api = mutators();
  api.updateMaterialMutator.mutateAsync.mockRejectedValueOnce(
    new Error("Unavailable")
  );
  const result = prepareMaterialSyncJobs({
    transactions: [
      transaction(1, { materialId: offlineId, values: { name: "First" } }),
      transaction(2, { materialId: remoteId, values: { name: "Second" } }),
    ],
    header: { userAgent: "test" },
    mutators: api,
    acknowledgeCreate: jest.fn(),
  });
  await Promise.allSettled(result.syncJobs.map(job => job.run()));
  expect(api.updateMaterialMutator.mutateAsync).toHaveBeenCalledTimes(1);
  expect([...result.deferredSequences!]).toEqual([2]);
});

test("creation durably remaps pending edits and relations before their prepared jobs execute", async () => {
  const db = fixture();
  try {
    const create = {
      ...transaction(1, { name: "Original", parentSubShelfId: shelfId }),
      actionType: Action.CREATE,
      affected: { ...affected, offlineMaterialId: offlineId },
    };
    const update = transaction(2, {
      materialId: offlineId,
      values: { name: "Renamed locally" },
    });
    const relation = {
      ...transaction(3, {
        routineId: id(5),
        itemId: offlineId,
        itemType: "Material",
        isUnlink: false,
      }),
      entityType: Entity.RoutinesToItems,
      actionType: Action.CREATE,
      affected: null,
    };
    const pending = [create, update, relation];
    await mockLocalDB
      .insert(schema.Transaction)
      .values(pending.map(({ mergedSequences: _, ...row }) => row));
    const link = jest.fn(async (_request: unknown) => ({ success: true }));
    const relationJobs = prepareRoutineRelationSyncJobs({
      transactions: [relation],
      header: { userAgent: "test" },
      mutators: {
        linkRoutineItemMutator: { mutateAsync: link },
        linkRoutineItemsMutator: { mutateAsync: link },
        linkRoutineTagMutator: { mutateAsync: link },
        linkRoutineTagsMutator: { mutateAsync: link },
        linkRoutineTaskMutator: { mutateAsync: link },
        linkRoutineTasksMutator: { mutateAsync: link },
      },
    });
    const api = mutators();
    const jobs = prepareMaterialSyncJobs({
      transactions: [create, update],
      header: { userAgent: "test" },
      mutators: api,
      acknowledgeCreate: async (oldId, newId, sequences) => {
        await MaterialLocalSynchronizer.acknowledgeCreate(
          oldId,
          newId,
          sequences
        );
        for (const current of pending) {
          current.body = replaceMaterialId(current.body, oldId, newId);
          current.affected = replaceMaterialId(current.affected, oldId, newId);
        }
      },
    });
    await Promise.all(jobs.syncJobs.map(job => job.run()));
    await Promise.all(relationJobs.syncJobs.map(job => job.run()));
    expect(api.updateMaterialMutator.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ materialId: remoteId }),
      })
    );
    expect(link).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ itemId: remoteId }),
      })
    );
    expect(db.prepare("SELECT id,name FROM MaterialTable").all()).toEqual([
      { id: remoteId, name: "Renamed locally" },
    ]);
    expect(
      db.prepare("SELECT item_id FROM RoutinesToItemsTable").all()
    ).toEqual([{ item_id: remoteId }]);
    const persisted = await mockLocalDB.select().from(schema.Transaction);
    expect(persisted.map(row => row.sequence)).toEqual([2, 3]);
    expect(persisted[0].body).toMatchObject({ materialId: remoteId });
    expect(persisted[1].body).toMatchObject({ itemId: remoteId });
  } finally {
    db.close();
  }
});

test("a failed remap rolls back metadata, relations and queued work together", async () => {
  const db = fixture();
  try {
    await mockLocalDB
      .insert(schema.Transaction)
      .values(
        transaction(1, { materialId: offlineId, values: { name: "Pending" } })
      );
    db.exec(
      "CREATE TRIGGER fail_remap BEFORE UPDATE ON TransactionTable BEGIN SELECT RAISE(ABORT, 'fixture write failure'); END;"
    );
    await expect(
      MaterialLocalSynchronizer.acknowledgeCreate(
        offlineId,
        remoteId,
        new Set([1])
      )
    ).rejects.toThrow();
    expect(db.prepare("SELECT id,name FROM MaterialTable").all()).toEqual([
      { id: offlineId, name: "Renamed locally" },
    ]);
    expect(
      db.prepare("SELECT item_id FROM RoutinesToItemsTable").all()
    ).toEqual([{ item_id: offlineId }]);
    expect(db.prepare("SELECT sequence FROM TransactionTable").all()).toEqual([
      { sequence: 1 },
    ]);
  } finally {
    db.close();
  }
});

test("reference replacement preserves user content and handles nested batch references", () => {
  const body = {
    name: offlineId,
    linkedRoutinesAndItems: [{ itemId: offlineId }],
    materialIds: [offlineId, remoteId],
  };
  expect(replaceMaterialId(body, offlineId, remoteId)).toEqual({
    name: offlineId,
    linkedRoutinesAndItems: [{ itemId: remoteId }],
    materialIds: [remoteId, remoteId],
  });
  expect(body.linkedRoutinesAndItems[0].itemId).toBe(offlineId);
});

test("confirmed soft deletion keeps Material metadata and links without creating replay work", async () => {
  const db = fixture();
  try {
    await MaterialLocalSynchronizer.syncDeletedMaterials(
      [offlineId],
      new Date(5000)
    );
    expect(
      db.prepare("SELECT id,name,deleted_at FROM MaterialTable").all()
    ).toEqual([{ id: offlineId, name: "Renamed locally", deleted_at: 5 }]);
    expect(db.prepare("SELECT deleted_at FROM ItemTable").all()).toEqual([
      { deleted_at: 5 },
    ]);
    expect(
      db.prepare("SELECT item_id FROM RoutinesToItemsTable").all()
    ).toEqual([{ item_id: offlineId }]);
    expect(db.prepare("SELECT sequence FROM TransactionTable").all()).toEqual(
      []
    );
  } finally {
    db.close();
  }
});
