import {
  RoutinePeriod,
  RoutinePhase,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RoutinesToItems } from "./routinesToItems.schema";
import { RoutinesToTags } from "./routinesToTags.schema";
import { RoutinesToTasks } from "./routinesToTasks.schema";
import { Station } from "./station.schema";

export const Routine = sqliteTable(
  "RoutineTable",
  {
    id: text("id").primaryKey(),
    stationId: text("station_id")
      .notNull()
      .references(() => Station.id),
    title: text("title").notNull().default("undefined"),
    description: text("description").notNull().default(""),
    status: text("status")
      .$type<RoutineStatus>()
      .notNull()
      .default(RoutineStatus.Scheduled),
    phase: text("phase").$type<RoutinePhase>(),
    isPinned: integer("is_pinned", { mode: "boolean" })
      .notNull()
      .default(false),
    scheduledStartAt: integer("scheduled_start_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    scheduledEndAt: integer("scheduled_end_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    period: text("period").$type<RoutinePeriod>(),
    timezone: text("timezone").notNull().default("UTC"),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [index("routine_station_idx").on(table.stationId)]
);

export const RoutineRelations = relations(Routine, ({ one, many }) => ({
  station: one(Station, {
    fields: [Routine.stationId],
    references: [Station.id],
  }),
  routinesToTags: many(RoutinesToTags),
  routinesToTasks: many(RoutinesToTasks),
  routinesToItems: many(RoutinesToItems),
}));
