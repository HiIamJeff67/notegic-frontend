import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { RoutineTask } from "./routineTask.schema";

export const RoutineTaskDependency = sqliteTable(
  "RoutineDependencyTable",
  {
    routineTaskId: text("routine_task_id")
      .notNull()
      .references(() => RoutineTask.id, { onDelete: "cascade" }),
    previousRoutineTaskId: text("previous_routine_task_id")
      .notNull()
      .references(() => RoutineTask.id, { onDelete: "cascade" }),
    description: text("description").notNull().default(""),
    progress: integer("progress").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    primaryKey({
      columns: [table.routineTaskId, table.previousRoutineTaskId],
    }),
    index("routine_dependency_idx_previous_routine_task_id").on(
      table.previousRoutineTaskId
    ),
  ]
);
