import type { Database } from "better-sqlite3";
import type { Driver } from "./client";

const transactionSql = /^(begin|commit|rollback|savepoint|release)\b/i;

export const getSQLiteDriver = (sqlite: Database): Driver => ({
  execute: async (sql, params, method) => {
    const text = sql.trim();
    if (method === "run" && transactionSql.test(text)) {
      sqlite.exec(text);
      return { rows: undefined };
    }
    const statement = sqlite.prepare(sql);
    const bound = params as never[];
    if (method === "run") {
      statement.run(...bound);
      return { rows: [] };
    }
    if (method === "get") {
      const row = statement.raw().get(...bound) as unknown[] | undefined;
      return { rows: row };
    }
    return { rows: statement.raw().all(...bound) as unknown[][] };
  },
});
