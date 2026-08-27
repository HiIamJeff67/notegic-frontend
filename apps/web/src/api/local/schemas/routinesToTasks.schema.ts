import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";
import { RoutineTask } from "./routineTask.schema";

export const RoutinesToTasks = sqliteTable(
  "RoutinesToTasksTable",
  {
    routineId: text("routine_id")
      .notNull()
      .references(() => Routine.id),
    taskId: text("task_id")
      .notNull()
      .references(() => RoutineTask.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("routines_to_tasks_routine_idx").on(table.routineId),
    index("routines_to_tasks_task_idx").on(table.taskId),
  ]
);

export const RoutinesToTasksRelations = relations(
  RoutinesToTasks,
  ({ one }) => ({
    routine: one(Routine, {
      fields: [RoutinesToTasks.routineId],
      references: [Routine.id],
    }),
    task: one(RoutineTask, {
      fields: [RoutinesToTasks.taskId],
      references: [RoutineTask.id],
    }),
  })
);
