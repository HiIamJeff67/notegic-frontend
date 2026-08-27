import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { eq, relations } from "drizzle-orm";
import {
  integer,
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { Station } from "./station.schema";
import { User } from "./user.schema";

export const UsersToStations = sqliteTable(
  "UsersToStationsTable",
  {
    userPublicId: text("user_public_id")
      .notNull()
      .references(() => User.publicId),
    stationId: text("station_id")
      .notNull()
      .references(() => Station.id),
    permission: text("permission").$type<AccessControlPermission>().notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("users_to_stations_station_idx").on(table.stationId),
    primaryKey({ columns: [table.userPublicId, table.stationId] }),
    uniqueIndex("users_to_stations_unique_idx_station_owner")
      .on(table.stationId)
      .where(eq(table.permission, AccessControlPermission.Owner)),
  ]
);

export const UsersToStationsRelations = relations(
  UsersToStations,
  ({ one }) => ({
    user: one(User, {
      fields: [UsersToStations.userPublicId],
      references: [User.publicId],
    }),
    station: one(Station, {
      fields: [UsersToStations.stationId],
      references: [Station.id],
    }),
  })
);
