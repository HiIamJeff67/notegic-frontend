import { SupportedIcon } from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";
import { RoutineTask } from "./routineTask.schema";
import { UsersToStations } from "./usersToStations.schema";

export const Station = sqliteTable("StationTable", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("undefined"),
  description: text("description").notNull().default(""),
  icon: text("icon").$type<SupportedIcon>(),
  headerBackgroundURL: text("header_background_url"),
  routineCount: integer("routine_count").notNull().default(0),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const StationRelations = relations(Station, ({ many }) => ({
  usersToStations: many(UsersToStations),
  routines: many(Routine),
  routineTasks: many(RoutineTask),
}));
