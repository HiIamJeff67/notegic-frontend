import type { RoutineTaskDependencyGraphDraftEdge } from "@shared/graph";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";

export interface RoutineTaskDependencyGraphDraftNode {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

export type { RoutineTaskDependencyGraphDraftEdge } from "@shared/graph";

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
