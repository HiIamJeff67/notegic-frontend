import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { CreateRootShelfResponse } from "@shared/api/interfaces/rootShelf.interface";
import { client } from "@shared/api/local/client";
import { type MigrationEntry, Migrator } from "@shared/api/local/migrator";
import { localSchemaHead } from "@shared/api/local/schemaHead";
import { RootShelf, User } from "@shared/api/local/schemas";
import { getSQLiteDriver } from "@shared/api/local/driver";
import { QueryClientProvider } from "@tanstack/react-query";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { renderToString } from "react-dom/server";
import { createQueryClient } from "../../queryClient";
import { ShelfItemProvider } from "./ShelfItemProvider";
import { useShelfItem } from "./useShelfItem";

const ownerPublicId = "33333333-3333-4333-8333-333333333333";
const migrationsDirectory = path.resolve(__dirname, "../../local/migrations");

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
  const directory = mkdtempSync(path.join(tmpdir(), "notegic-shelf-provider-"));
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
    client: client(getSQLiteDriver(sqlite)),
    close: () => sqlite.close(),
  };
};

const responseFor = (id: string): CreateRootShelfResponse => ({
  success: true,
  data: {
    id,
    lastAnalyzedAt: new Date("2026-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  exception: null,
  embedded: { publicId: ownerPublicId },
});

describe("shelf item provider", () => {
  it("adds the local shelf to the shared shelf state", async () => {
    const { db, client: local, close } = await openFixture();
    let shelfItem: ReturnType<typeof useShelfItem> | undefined;
    function Consumer() {
      shelfItem = useShelfItem();
      return null;
    }
    renderToString(
      <QueryClientProvider client={createQueryClient()}>
        <ShelfItemProvider
          ownerPublicId={ownerPublicId}
          client={local}
          createRootShelf={async request =>
            responseFor(request.body.id ?? "missing")
          }
          updateRootShelf={async () => {
            throw new Error("unused");
          }}
          deleteRootShelf={async () => {
            throw new Error("unused");
          }}
          createSubShelf={async () => {
            throw new Error("unused");
          }}
          updateSubShelf={async () => {
            throw new Error("unused");
          }}
          deleteSubShelf={async () => {
            throw new Error("unused");
          }}
          createMaterial={async () => {
            throw new Error("unused");
          }}
          updateMaterial={async () => {
            throw new Error("unused");
          }}
          deleteMaterial={async () => {
            throw new Error("unused");
          }}
          createBlockPack={async () => {
            throw new Error("unused");
          }}
        >
          <Consumer />
        </ShelfItemProvider>
      </QueryClientProvider>
    );

    await shelfItem?.createRootShelf("Desk");
    const stored = db.select().from(RootShelf).all();
    const shelves = shelfItem?.shelvesRef.current;
    close();

    expect(shelves).toMatchObject([{ name: "Desk" }]);
    expect(stored).toMatchObject([{ name: "Desk" }]);
  });
});
