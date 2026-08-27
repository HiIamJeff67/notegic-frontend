import {
  RoutinePeriod,
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";
import { RoutinesToTasks } from "./routinesToTasks.schema";

export const RoutineTask = sqliteTable(
  "RoutineTaskTable",
  {
    id: text("id").primaryKey(),
    routineId: text("routine_id")
      .notNull()
      .references(() => Routine.id),
    title: text("title").notNull().default("undefined"),
    purpose: text("purpose").$type<RoutineTaskPurpose>().notNull(),
    costUnit: integer("cost_unit").notNull().default(0),
    payload: text("payload", { mode: "json" }).$type<unknown>().notNull(),
    priority: integer("priority").notNull().default(0),
    status: text("status")
      .$type<RoutineTaskStatus>()
      .notNull()
      .default(RoutineTaskStatus.Idle),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(1),
    period: text("period").$type<RoutinePeriod>(),
    nextScheduledAt: integer("next_scheduled_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    actualStartedAt: integer("actual_started_at", { mode: "timestamp" }),
    actualEndedAt: integer("actual_ended_at", { mode: "timestamp" }),
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
