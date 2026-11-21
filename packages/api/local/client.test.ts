import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { sql } from "drizzle-orm";
import { connectDefaultClient, defaultClient } from "./client";

describe("defaultClient", () => {
  it("forwards sql after the app connects a driver", async () => {
    await expect(defaultClient.run(sql`select 1`)).rejects.toMatchObject({
      cause: expect.any(NotegicLocalDatabaseError),
    });
    const seen: string[] = [];
    connectDefaultClient({
      execute: async statement => {
        seen.push(statement);
        return { rows: [] };
      },
    });
    await defaultClient.run(sql`select 1`);
    expect(
      seen.some(statement => statement.toLowerCase().includes("select"))
    ).toBe(true);
  });
});
