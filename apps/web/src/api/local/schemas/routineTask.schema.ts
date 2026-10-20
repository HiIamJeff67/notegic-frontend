import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";
import { RoutinesToTasks } from "./routinesToTasks.schema";

export const RoutineTask = sqliteTable(
  "RoutineTaskTable",
  {
    id: text("id").primaryKey(),
    routineId: text("routine_id")
      .notNull()
      .references(() => Routine.id),
    kind: text("kind").$type<"Start" | "Action">().notNull().default("Action"),
    x: real("x").notNull().default(0),
    y: real("y").notNull().default(0),
    title: text("title").notNull().default("undefined"),
    payload: text("payload", { mode: "json" }).$type<unknown>().notNull(),
    priority: integer("priority").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(1),
    previousRoutineTaskIds: text("previous_routine_task_ids", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [index("routine_task_routine_idx").on(table.routineId)]
);

export const RoutineTaskRelations = relations(RoutineTask, ({ one, many }) => ({
  routine: one(Routine, {
    fields: [RoutineTask.routineId],
    references: [Routine.id],
  }),
  routinesToTasks: many(RoutinesToTasks),
}));
