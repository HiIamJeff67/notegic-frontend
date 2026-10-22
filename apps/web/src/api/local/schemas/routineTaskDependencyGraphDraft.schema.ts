import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";

export interface RoutineTaskDependencyGraphDraftNode {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

export interface RoutineTaskDependencyGraphDraftEdge {
  id: string;
  source: string;
  target: string;
  description?: string;
  progress?: number;
  syncStatus?: "synced" | "pending" | "invalid";
  expectedDefinitionVersion?: number;
  operation?: "create" | "update" | "delete";
  errorKey?: string;
  // Legacy localized text; new drafts persist errorKey instead.
  errorMessage?: string;
}

export const RoutineTaskDependencyGraphDraft = sqliteTable(
  "RoutineTaskDependencyGraphDraftTable",
  {
    routineId: text("routine_id")
      .primaryKey()
      .references(() => Routine.id, { onDelete: "cascade" }),
    nodes: text("nodes").$type<string>().notNull().default("[]"),
    edges: text("edges").$type<string>().notNull().default("[]"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  }
);
