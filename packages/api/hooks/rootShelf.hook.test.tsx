import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type {
  CreateRootShelfResponse,
  UpdateMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { type MigrationEntry, Migrator } from "@shared/api/local/migrator";
import { localSchemaHead } from "@shared/api/local/schemaHead";
import { RootShelf, Transaction, User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { createQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { renderToString } from "react-dom/server";
import { useCreateRootShelf, useUpdateMyRootShelfById } from "./rootShelf.hook";

const ownerPublicId = "33333333-3333-4333-8333-333333333333";
const shelfId = "44444444-4444-4444-8444-444444444444";
const migrationsDirectory = path.resolve(__dirname, "../local/migrations");

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
  const directory = mkdtempSync(path.join(tmpdir(), "notegic-shelf-hook-"));
  const sqlite = new Database(path.join(directory, "notegic.sqlite"));
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
  const db = drizzle(sqlite);
  db.insert(User)
    .values({
      publicId: ownerPublicId,
      name: "owner",
      displayName: "Owner",
      email: "owner@example.invalid",
      isLoggedIn: true,
    })
    .run();
  return {
    db,
    close: () => sqlite.close(),
  };
};

const createdResponse = (id: string): CreateRootShelfResponse => ({
  success: true,
  data: {
    id,
    lastAnalyzedAt: new Date("2026-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  exception: null,
  embedded: { publicId: ownerPublicId },
});

const renamedResponse = (): UpdateMyRootShelfByIdResponse => ({
  success: true,
  data: { updatedAt: new Date("2026-01-02T00:00:00.000Z") },
  exception: null,
  embedded: { publicId: ownerPublicId },
});

describe("root shelf hooks", () => {
  it("writes the shelf before the remote create and then settles it", async () => {
    const { db, close } = await openFixture();
    const seen: string[] = [];
    const func = jest.fn(async () => {
      seen.push("remote");
      expect(db.select().from(RootShelf).all()).toMatchObject([
        { id: shelfId, name: "Desk" },
      ]);
      return createdResponse(shelfId);
    });
    let create:
      | ReturnType<typeof useCreateRootShelf>["mutateAsync"]
      | undefined;
    function Harness() {
      create = useCreateRootShelf(db, ownerPublicId, func).mutateAsync;
      return null;
    }
    renderToString(
      <QueryClientProvider client={createQueryClient()}>
        <Harness />
      </QueryClientProvider>
    );

    const created = await create!({ body: { id: shelfId, name: "Desk" } });
    const outbox = db.select().from(Transaction).all();
    close();

    expect(seen).toEqual(["remote"]);
    expect(created.local).toMatchObject({ id: shelfId });
    expect(outbox).toMatchObject([
      {
        actionType: "CREATE",
        status: "accepted",
        body: { id: shelfId, name: "Desk" },
      },
    ]);
  });

  it("keeps the shelf and marks the outbox unplaced when the remote create fails", async () => {
    const { db, close } = await openFixture();
    const func = jest.fn(async () => {
      throw new TypeError("network down");
    });
    let create:
      | ReturnType<typeof useCreateRootShelf>["mutateAsync"]
      | undefined;
    function Harness() {
      create = useCreateRootShelf(db, ownerPublicId, func).mutateAsync;
      return null;
    }
    renderToString(
      <QueryClientProvider client={createQueryClient()}>
        <Harness />
      </QueryClientProvider>
    );

    await expect(
      create!({ body: { id: shelfId, name: "Desk" } })
    ).rejects.toThrow();
    const shelf = db.select().from(RootShelf).all();
    const outbox = db
      .select()
      .from(Transaction)
      .where(eq(Transaction.actionType, TransactionActionType.CREATE))
      .all();
    close();

    expect(shelf).toHaveLength(1);
    expect(outbox).toMatchObject([{ status: "unplaced" }]);
  });

  it("renames the shelf before the remote update", async () => {
    const { db, close } = await openFixture();
    let create:
      | ReturnType<typeof useCreateRootShelf>["mutateAsync"]
      | undefined;
    let rename:
      | ReturnType<typeof useUpdateMyRootShelfById>["mutateAsync"]
      | undefined;
    function Harness() {
      create = useCreateRootShelf(db, ownerPublicId, async () =>
        createdResponse(shelfId)
      ).mutateAsync;
      rename = useUpdateMyRootShelfById(db, ownerPublicId, async () => {
        expect(
          db.select().from(RootShelf).where(eq(RootShelf.id, shelfId)).get()
            ?.name
        ).toBe("Studio");
        return renamedResponse();
      }).mutateAsync;
      return null;
    }
    renderToString(
      <QueryClientProvider client={createQueryClient()}>
        <Harness />
      </QueryClientProvider>
    );

    await create!({ body: { id: shelfId, name: "Desk" } });
    await rename!({
      body: { rootShelfId: shelfId, values: { name: "Studio" } },
    });
    const outbox = db.select().from(Transaction).all();
    close();

    expect(outbox).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: "CREATE", status: "accepted" }),
        expect.objectContaining({ actionType: "UPDATE", status: "accepted" }),
      ])
    );
  });
});
