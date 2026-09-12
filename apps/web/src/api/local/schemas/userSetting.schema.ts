import {
  Language,
  UserSettingDensity,
  UserSettingStartSurface,
} from "@shared/api/interfaces/enums";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { User } from "./user.schema";

export const UserSetting = sqliteTable("UserSettingTable", {
  userPublicId: text("user_public_id")
    .primaryKey()
    .references(() => User.publicId, { onDelete: "cascade" }),
  language: text("language").$type<Language>().notNull(),
  density: text("density").$type<UserSettingDensity>().notNull(),
  startSurface: text("start_surface")
    .$type<UserSettingStartSurface>()
    .notNull(),
  reduceMotion: integer("reduce_motion", { mode: "boolean" }).notNull(),
  lineWrap: integer("line_wrap", { mode: "boolean" }).notNull(),
  quickInsert: integer("quick_insert", { mode: "boolean" }).notNull(),
  privatePreviews: integer("private_previews", { mode: "boolean" }).notNull(),
  routineNudges: integer("routine_nudges", { mode: "boolean" }).notNull(),
  syncNotifications: integer("sync_notifications", {
    mode: "boolean",
  }).notNull(),
  quietMode: integer("quiet_mode", { mode: "boolean" }).notNull(),
  quietModeStartMinute: integer("quiet_mode_start_minute").notNull(),
  quietModeEndMinute: integer("quiet_mode_end_minute").notNull(),
});
