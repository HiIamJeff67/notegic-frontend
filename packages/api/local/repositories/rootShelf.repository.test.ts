import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { client } from "@shared/api/local/client";
import { type MigrationEntry, Migrator } from "@shared/api/local/migrator";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { RootShelfRepository } from "@shared/api/local/repositories/rootShelf.repository";
import { localSchemaHead } from "@shared/api/local/schemaHead";
import {
  RootShelf,
  Transaction,
  User,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { getSQLiteDriver } from "@shared/api/local/driver";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

const ownerPublicId = "33333333-3333-4333-8333-333333333333";
const shelfId = "44444444-4444-4444-8444-444444444444";
const secondShelfId = "77777777-7777-4777-8777-777777777777";
const timestamp = new Date("2026-01-01T00:00:00.000Z");

const migrationsDirectory = path.resolve(__dirname, "../migrations");

const readMigrations = (): MigrationEntry[] => {
  const journal = JSON.parse(
    readFileSync(
      path.join(migrationsDirectory, "meta", "_journal.json"),
      "utf8"
    )
  ) as { entries?: { idx: number; tag: string }[] };
  return (journal.entries ?? [])
    .slice()
    .sort((left, right) => left.idx - right.idx)
    .map(entry => {
      const sqlContent = readFileSync(
        path.join(migrationsDirectory, `${entry.tag}.sql`),
        "utf8"
      );
      const [prefix] = entry.tag.split("_");
      return {
        idx: entry.idx,
        tag: entry.tag,
        versionNumber: Number(prefix),
        sqlContent,
        statements: Migrator.splitSqlStatements(sqlContent),
      };
    });
};

const openFixture = async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "notegic-shelf-"));
  const filePath = path.join(directory, "notegic.sqlite");
  const sqlite = new Database(filePath);
  const migrator = new Migrator(
    {
      transaction: async operation => {
        sqlite.exec("BEGIN");
        try {
          const result = await operation({
            run: async query => {
              const statement = query.trim();
              if (/^pragma\s+user_version$/i.test(statement)) {
                return [sqlite.prepare(statement).get()];
              }
              sqlite.exec(statement);
              return [];
            },
          });
          sqlite.exec("COMMIT");
          return result;
        } catch (error) {
          sqlite.exec("ROLLBACK");
          throw error;
        }
      },
    },
    readMigrations()
  );
  const version = sqlite.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  await migrator.ensure({
    currentVersion: version.user_version,
    targetVersion: localSchemaHead,
  });
  sqlite.pragma("foreign_keys = ON");
  const opened = {
    db: drizzle(sqlite),
    client: client(getSQLiteDriver(sqlite)),
    sqlite,
    close: () => sqlite.close(),
  };
  opened.db
    .insert(User)
    .values({
      publicId: ownerPublicId,
      name: "owner",
      displayName: "Owner",
      email: "owner@example.invalid",
      isLoggedIn: true,
    })
    .run();
  const migrated = sqlite.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  return { opened, version: migrated.user_version };
};

const readRootShelf = (db: ReturnType<typeof drizzle>, id: string) =>
  db.select().from(RootShelf).where(eq(RootShelf.id, id)).get();

describe("root shelf repository", () => {
  it("writes the shelf and one pending outbox row without passing the schema version", async () => {
    const { opened, version } = await openFixture();
    const committed = await RootShelfRepository.CreateOne(opened.client, {
      id: shelfId,
      name: "Desk",
      ownerPublicId,
      at: timestamp,
    });
    const shelf = readRootShelf(opened.db, shelfId);
    const outbox = opened.db
      .select()
      .from(Transaction)
      .where(eq(Transaction.sequence, committed.sequence))
      .get();
    opened.close();

    expect(version).toBe(localSchemaHead);
    expect(shelf).toMatchObject({ id: shelfId, name: "Desk" });
    expect(outbox).toMatchObject({
      ownerPublicId,
      entityType: "RootShelf",
      actionType: "CREATE",
      body: { id: shelfId, name: "Desk" },
      status: "pending",
      retryCount: 0,
    });
  });

  it("writes every shelf and outbox row in one insert per table", async () => {
    const { opened } = await openFixture();
    const statements: string[] = [];
    const prepare = opened.sqlite.prepare.bind(opened.sqlite);
    opened.sqlite.prepare = ((source: string) => {
      statements.push(source);
      return prepare(source);
    }) as typeof opened.sqlite.prepare;
    const committed = await RootShelfRepository.CreateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
        {
          id: secondShelfId,
          name: "Studio",
          ownerPublicId,
          at: new Date("2026-01-02T00:00:00.000Z"),
        },
      ],
    });
    const outbox = opened.db.select().from(Transaction).all();
    opened.close();

    expect(
      statements.filter(source => source.startsWith("insert"))
    ).toHaveLength(3);
    expect(committed.shelves).toEqual([
      { id: shelfId, sequence: outbox[0]?.sequence },
      { id: secondShelfId, sequence: outbox[1]?.sequence },
    ]);
    expect(outbox).toMatchObject([
      { actionType: "CREATE", body: { id: shelfId, name: "Desk" } },
      { actionType: "CREATE", body: { id: secondShelfId, name: "Studio" } },
    ]);
  });

  it("rolls every shelf back when one owner does not exist", async () => {
    const { opened } = await openFixture();
    await expect(
      RootShelfRepository.CreateMany(opened.client, {
        shelves: [
          { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
          {
            id: secondShelfId,
            name: "Studio",
            ownerPublicId: "55555555-5555-4555-8555-555555555555",
            at: timestamp,
          },
        ],
      })
    ).rejects.toThrow();
    expect(readRootShelf(opened.db, shelfId)).toBeUndefined();
    expect(readRootShelf(opened.db, secondShelfId)).toBeUndefined();
    expect(opened.db.select().from(Transaction).all()).toEqual([]);
    opened.close();
  });

  it("rolls the shelf back when the outbox owner does not exist", async () => {
    const { opened } = await openFixture();
    await expect(
      RootShelfRepository.CreateOne(opened.client, {
        id: shelfId,
        name: "Desk",
        ownerPublicId: "55555555-5555-4555-8555-555555555555",
        at: timestamp,
      })
    ).rejects.toThrow();
    expect(readRootShelf(opened.db, shelfId)).toBeUndefined();
    expect(opened.db.select().from(Transaction).all()).toEqual([]);
    opened.close();
  });

  it("renames the shelf and records one update outbox row", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateOne(opened.client, {
      id: shelfId,
      name: "Desk",
      ownerPublicId,
      at: timestamp,
    });
    const renamed = await RootShelfRepository.UpdateOne(opened.client, {
      id: shelfId,
      name: "Studio",
      ownerPublicId,
      at: new Date("2026-01-02T00:00:00.000Z"),
    });
    const shelf = readRootShelf(opened.db, shelfId);
    const outbox = opened.db
      .select()
      .from(Transaction)
      .where(eq(Transaction.sequence, renamed.sequence))
      .get();
    opened.close();

    expect(shelf?.name).toBe("Studio");
    expect(outbox).toMatchObject({
      actionType: "UPDATE",
      status: "pending",
      body: { rootShelfId: shelfId, values: { name: "Studio" } },
    });
  });

  it("does not rename a shelf the user cannot write", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateOne(opened.client, {
      id: shelfId,
      name: "Desk",
      ownerPublicId,
      at: timestamp,
    });
    const readerPublicId = "66666666-6666-4666-8666-666666666666";
    opened.db
      .insert(User)
      .values({
        publicId: readerPublicId,
        name: "reader",
        displayName: "Reader",
        email: "reader@example.invalid",
        isLoggedIn: false,
      })
      .run();
    await expect(
      RootShelfRepository.UpdateOne(opened.client, {
        id: shelfId,
        name: "Studio",
        ownerPublicId: readerPublicId,
      })
    ).rejects.toThrow(NotegicLocalDatabaseError);
    expect(readRootShelf(opened.db, shelfId)?.name).toBe("Desk");
    expect(opened.db.select().from(Transaction).all()).toHaveLength(1);
    opened.close();
  });

  it("marks an outbox row unplaced without removing the shelf", async () => {
    const { opened } = await openFixture();
    const committed = await RootShelfRepository.CreateOne(opened.client, {
      id: shelfId,
      name: "Desk",
      ownerPublicId,
      at: timestamp,
    });
    await OutboxRepository.Settle(opened.client, {
      sequence: committed.sequence,
      status: "unplaced",
      lastError: "parent was deleted",
    });
    const outbox = opened.db
      .select()
      .from(Transaction)
      .where(eq(Transaction.sequence, committed.sequence))
      .get();
    expect(readRootShelf(opened.db, shelfId)?.name).toBe("Desk");
    expect(outbox).toMatchObject({
      status: "unplaced",
      lastError: "parent was deleted",
    });
    opened.close();
  });

  it("reads many shelves in one select", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
        { id: secondShelfId, name: "Studio", ownerPublicId, at: timestamp },
      ],
    });
    const statements: string[] = [];
    const prepare = opened.sqlite.prepare.bind(opened.sqlite);
    opened.sqlite.prepare = ((source: string) => {
      statements.push(source);
      return prepare(source);
    }) as typeof opened.sqlite.prepare;
    const read = await RootShelfRepository.GetMany(opened.client, {
      ids: [secondShelfId, shelfId, "88888888-8888-4888-8888-888888888888"],
    });
    opened.close();

    expect(
      statements.filter(source => source.startsWith("select"))
    ).toHaveLength(1);
    expect(read.shelves.map(shelf => shelf.id)).toEqual([
      secondShelfId,
      shelfId,
    ]);
  });

  it("renames every shelf in one update and one outbox insert", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
        { id: secondShelfId, name: "Studio", ownerPublicId, at: timestamp },
      ],
    });
    const statements: string[] = [];
    const prepare = opened.sqlite.prepare.bind(opened.sqlite);
    opened.sqlite.prepare = ((source: string) => {
      statements.push(source);
      return prepare(source);
    }) as typeof opened.sqlite.prepare;
    const renamed = await RootShelfRepository.UpdateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk 2", ownerPublicId, at: timestamp },
        { id: secondShelfId, name: "Studio 2", ownerPublicId, at: timestamp },
      ],
    });

    expect(
      statements.filter(source => source.startsWith("select"))
    ).toHaveLength(1);
    expect(
      statements.filter(source => source.startsWith("update"))
    ).toHaveLength(1);
    expect(
      statements.filter(source => source.startsWith("insert"))
    ).toHaveLength(1);
    expect(renamed.shelves.map(shelf => shelf.id)).toEqual([
      shelfId,
      secondShelfId,
    ]);
    expect(readRootShelf(opened.db, shelfId)?.name).toBe("Desk 2");
    expect(readRootShelf(opened.db, secondShelfId)?.name).toBe("Studio 2");
    opened.close();
  });

  it("rolls every rename back when one shelf is not writable", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
        { id: secondShelfId, name: "Studio", ownerPublicId, at: timestamp },
      ],
    });
    await expect(
      RootShelfRepository.UpdateMany(opened.client, {
        shelves: [
          { id: shelfId, name: "Desk 2", ownerPublicId, at: timestamp },
          {
            id: secondShelfId,
            name: "Studio 2",
            ownerPublicId: "55555555-5555-4555-8555-555555555555",
            at: timestamp,
          },
        ],
      })
    ).rejects.toThrow(NotegicLocalDatabaseError);
    expect(readRootShelf(opened.db, shelfId)?.name).toBe("Desk");
    expect(readRootShelf(opened.db, secondShelfId)?.name).toBe("Studio");
    expect(opened.db.select().from(Transaction).all()).toHaveLength(2);
    opened.close();
  });

  it("soft-deletes every shelf in one update and refuses a writer", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
        { id: secondShelfId, name: "Studio", ownerPublicId, at: timestamp },
      ],
    });
    const writerPublicId = "66666666-6666-4666-8666-666666666666";
    opened.db
      .insert(User)
      .values({
        publicId: writerPublicId,
        name: "writer",
        displayName: "Writer",
        email: "writer@example.invalid",
        isLoggedIn: false,
      })
      .run();
    opened.db
      .insert(UsersToShelves)
      .values({
        userPublicId: writerPublicId,
        rootShelfId: shelfId,
        permission: AccessControlPermission.Write,
      })
      .run();
    await expect(
      RootShelfRepository.DeleteOne(opened.client, {
        id: shelfId,
        ownerPublicId: writerPublicId,
        at: timestamp,
      })
    ).rejects.toThrow(NotegicLocalDatabaseError);
    const deleted = await RootShelfRepository.DeleteMany(opened.client, {
      shelves: [
        { id: shelfId, ownerPublicId, at: timestamp },
        { id: secondShelfId, ownerPublicId, at: timestamp },
      ],
    });
    const outbox = opened.db
      .select()
      .from(Transaction)
      .where(eq(Transaction.actionType, TransactionActionType.DELETE))
      .all();

    expect(readRootShelf(opened.db, shelfId)?.deletedAt).toEqual(timestamp);
    expect(readRootShelf(opened.db, secondShelfId)?.deletedAt).toEqual(
      timestamp
    );
    expect(deleted.shelves).toHaveLength(2);
    expect(outbox).toHaveLength(2);
    opened.close();
  });

  it("restores every deleted shelf in one update", async () => {
    const { opened } = await openFixture();
    await RootShelfRepository.CreateMany(opened.client, {
      shelves: [
        { id: shelfId, name: "Desk", ownerPublicId, at: timestamp },
        { id: secondShelfId, name: "Studio", ownerPublicId, at: timestamp },
      ],
    });
    await RootShelfRepository.DeleteMany(opened.client, {
      shelves: [
        { id: shelfId, ownerPublicId, at: timestamp },
        { id: secondShelfId, ownerPublicId, at: timestamp },
      ],
    });
    const restoredAt = new Date("2026-01-03T00:00:00.000Z");
    const restored = await RootShelfRepository.RestoreMany(opened.client, {
      shelves: [
        { id: shelfId, ownerPublicId, at: restoredAt },
        { id: secondShelfId, ownerPublicId, at: restoredAt },
      ],
    });

    expect(readRootShelf(opened.db, shelfId)?.deletedAt).toBeNull();
    expect(readRootShelf(opened.db, secondShelfId)?.deletedAt).toBeNull();
    expect(restored.shelves).toHaveLength(2);
    expect(opened.db.select().from(Transaction).all()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: "RESTORE" }),
      ])
    );
    opened.close();
  });
});
