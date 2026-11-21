import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { drizzle, type SqliteRemoteResult } from "drizzle-orm/sqlite-proxy";

export type SqlMethod = "run" | "all" | "get" | "values";

export type Driver = {
  execute(
    sql: string,
    params: unknown[],
    method: SqlMethod
  ): Promise<{ rows: unknown[] | undefined }>;
};

export type Client = BaseSQLiteDatabase<
  "async",
  SqliteRemoteResult,
  Record<string, never>
>;

export const client = (driver: Driver): Client =>
  drizzle(async (sql, params, method) => {
    const result = await driver.execute(sql, params, method);
    return { rows: result.rows as unknown[] };
  });

let activeDriver: Driver | undefined;

const unavailableDriver: Driver = {
  execute: () => {
    throw new NotegicLocalDatabaseError(
      LocalDatabaseClientExceptions.LocalDatabaseUnavailable()
    );
  },
};

export const defaultClient = client({
  execute: (sql, params, method) =>
    (activeDriver ?? unavailableDriver).execute(sql, params, method),
});

export const connectDefaultClient = (driver: Driver) => {
  activeDriver = driver;
  return defaultClient;
};
