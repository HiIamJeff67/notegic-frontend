import type { RunResult } from "better-sqlite3";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

export type LocalDB = BaseSQLiteDatabase<"sync", RunResult, any, any>;
