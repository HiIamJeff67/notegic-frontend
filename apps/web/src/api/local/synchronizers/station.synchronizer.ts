import {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import type {
  CreateStationRequest,
  CreateStationResponse,
  CreateStationsRequest,
  CreateStationsResponse,
  DeleteMyStationByIdRequest,
  DeleteMyStationByIdResponse,
  DeleteMyStationsByIdsRequest,
  DeleteMyStationsByIdsResponse,
  GetAllMyStationsResponse,
  GetMyStationByIdResponse,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationByIdResponse,
  HardDeleteMyStationsByIdsRequest,
  HardDeleteMyStationsByIdsResponse,
  RestoreMyStationByIdRequest,
  RestoreMyStationByIdResponse,
  RestoreMyStationsByIdsRequest,
  RestoreMyStationsByIdsResponse,
  UpdateMyStationByIdRequest,
  UpdateMyStationByIdResponse,
  UpdateMyStationsByIdsRequest,
  UpdateMyStationsByIdsResponse,
} from "@shared/api/interfaces/station.interface";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutinesToItems,
  RoutinesToTags,
  RoutinesToTasks,
  Station,
  User,
  UsersToStations,
} from "@/api/local/schemas";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class StationLocalSynchronizer {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[]
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToStations)
        .where(
          and(
            eq(UsersToStations.userPublicId, userPublicId),
            eq(UsersToStations.stationId, Station.id),
            inArray(UsersToStations.permission, permissions)
          )
        )
    );

  static syncGetMyStationById = async (
    response: GetMyStationByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(Station)
        .values({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL,
          routineCount: response.data.routineCount,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: Station.id,
          set: {
            name: response.data.name,
            description: response.data.description,
            icon: response.data.icon,
            headerBackgroundURL: response.data.headerBackgroundURL,
            routineCount: response.data.routineCount,
            deletedAt: response.data.deletedAt,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await tx
        .insert(UsersToStations)
        .values({
          userPublicId: response.embedded.publicId,
          stationId: response.data.id,
          permission: response.data.permission,
        })
        .onConflictDoUpdate({
          target: [UsersToStations.userPublicId, UsersToStations.stationId],
          set: {
            permission: response.data.permission,
            updatedAt: response.data.updatedAt,
          },
        });
    });
  };

  static syncGetAllMyStations = async (
    response: GetAllMyStationsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB.transaction(async tx => {
      await tx
        .insert(Station)
        .values(
          response.data.map(station => ({
            id: station.id,
            name: station.name,
            icon: station.icon,
            headerBackgroundURL: station.headerBackgroundURL,
            routineCount: station.routineCount,
            deletedAt: station.deletedAt,
            updatedAt: station.updatedAt,
            createdAt: station.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Station.id,
          set: {
            name: sql`excluded.name`,
            icon: sql`excluded.icon`,
            headerBackgroundURL: sql`excluded.header_background_url`,
            routineCount: sql`excluded.routine_count`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });

      await tx
        .insert(UsersToStations)
        .values(
          response.data.map(station => ({
            userPublicId: response.embedded.publicId,
            stationId: station.id,
            permission: station.permission,
            updatedAt: station.updatedAt,
            createdAt: station.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: [UsersToStations.userPublicId, UsersToStations.stationId],
          set: {
            permission: sql`excluded.permission`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

  static syncSearchStations = async (
    searchedStations: Array<{
      id: string;
      name: string;
      icon: SupportedIcon | null;
      headerBackgroundURL: string | null;
      permission: AccessControlPermission;
      routineCount: number;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
    }>
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (searchedStations.length === 0) return;

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .insert(Station)
        .values(
          searchedStations.map(station => ({
            id: station.id,
            name: station.name,
            icon: station.icon,
            headerBackgroundURL: station.headerBackgroundURL,
            routineCount: station.routineCount,
            deletedAt: station.deletedAt,
            updatedAt: station.updatedAt,
            createdAt: station.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Station.id,
          set: {
            name: sql`excluded.name`,
            icon: sql`excluded.icon`,
            headerBackgroundURL: sql`excluded.header_background_url`,
            routineCount: sql`excluded.routine_count`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });
      await tx
        .insert(UsersToStations)
        .values(
          searchedStations.map(station => ({
            userPublicId: loggedInUser.publicId,
            stationId: station.id,
            permission: station.permission,
            updatedAt: station.updatedAt,
            createdAt: station.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: [UsersToStations.userPublicId, UsersToStations.stationId],
          set: {
            permission: sql`excluded.permission`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

  static syncCreateStation = async (
    request: CreateStationRequest,
    response: CreateStationResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(Station)
        .values({
          id: response.data.id,
          name: request.body.name,
          description: request.body.description,
          icon: request.body.icon,
          headerBackgroundURL: request.body.headerBackgroundURL,
          createdAt: response.data.createdAt,
          updatedAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: Station.id,
          set: {
            name: sql`excluded.name`,
            description: sql`excluded.description`,
            icon: sql`excluded.icon`,
            headerBackgroundURL: sql`excluded.header_background_url`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
      await tx
        .insert(UsersToStations)
        .values({
          userPublicId: response.embedded.publicId,
          stationId: response.data.id,
          permission: AccessControlPermission.Owner,
          createdAt: response.data.createdAt,
          updatedAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: [UsersToStations.userPublicId, UsersToStations.stationId],
          set: {
            permission: sql`excluded.permission`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

  static syncCreateStations = async (
    request: CreateStationsRequest,
    response: CreateStationsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.createdStations.length === 0) return;

    await localDB.transaction(async tx => {
      await tx
        .insert(Station)
        .values(
          request.body.createdStations.map((station, index) => ({
            id: response.data.ids[index],
            name: station.name,
            description: station.description,
            icon: station.icon,
            headerBackgroundURL: station.headerBackgroundURL,
            createdAt: response.data.createdAt,
            updatedAt: response.data.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Station.id,
          set: {
            name: sql`excluded.name`,
            description: sql`excluded.description`,
            icon: sql`excluded.icon`,
            headerBackgroundURL: sql`excluded.header_background_url`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
      await tx
        .insert(UsersToStations)
        .values(
          response.data.ids.map(stationId => ({
            userPublicId: response.embedded.publicId,
            stationId,
            permission: AccessControlPermission.Owner,
            createdAt: response.data.createdAt,
            updatedAt: response.data.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: [UsersToStations.userPublicId, UsersToStations.stationId],
          set: {
            permission: sql`excluded.permission`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

  static syncUpdateMyStationById = async (
    request: UpdateMyStationByIdRequest,
    response: UpdateMyStationByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(Station)
      .set({
        ...(request.body.values.name !== undefined && {
          name: request.body.values.name,
        }),
        ...(request.body.values.description !== undefined && {
          description: request.body.values.description,
        }),
        ...(request.body.values.icon !== undefined && {
          icon: request.body.values.icon,
        }),
        ...(request.body.values.headerBackgroundURL !== undefined && {
          headerBackgroundURL: request.body.values.headerBackgroundURL,
        }),
        ...(request.body.setNull?.icon && { icon: null }),
        ...(request.body.setNull?.headerBackgroundURL && {
          headerBackgroundURL: null,
        }),
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          eq(Station.id, request.body.stationId),
          StationLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ]
          )
        )
      );
  };

  static syncUpdateMyStationsByIds = async (
    request: UpdateMyStationsByIdsRequest,
    response: UpdateMyStationsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const station of request.body.updatedStations) {
        await tx
          .update(Station)
          .set({
            ...(station.values.name !== undefined && {
              name: station.values.name,
            }),
            ...(station.values.description !== undefined && {
              description: station.values.description,
            }),
            ...(station.values.icon !== undefined && {
              icon: station.values.icon,
            }),
            ...(station.values.headerBackgroundURL !== undefined && {
              headerBackgroundURL: station.values.headerBackgroundURL,
            }),
            ...(station.setNull?.icon && { icon: null }),
            ...(station.setNull?.headerBackgroundURL && {
              headerBackgroundURL: null,
            }),
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              eq(Station.id, station.stationId),
              StationLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
      }
    });
  };

  static syncRestoreMyStationById = async (
    _request: RestoreMyStationByIdRequest,
    response: RestoreMyStationByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(Station)
      .values({
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        icon: response.data.icon,
        headerBackgroundURL: response.data.headerBackgroundURL,
        routineCount: response.data.routineCount,
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoUpdate({
        target: Station.id,
        set: {
          name: response.data.name,
          description: response.data.description,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL,
          routineCount: response.data.routineCount,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncRestoreMyStationsByIds = async (
    _request: RestoreMyStationsByIdsRequest,
    response: RestoreMyStationsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB
      .insert(Station)
      .values(
        response.data.map(station => ({
          id: station.id,
          name: station.name,
          description: station.description,
          icon: station.icon,
          headerBackgroundURL: station.headerBackgroundURL,
          routineCount: station.routineCount,
          deletedAt: station.deletedAt,
          updatedAt: station.updatedAt,
          createdAt: station.createdAt,
        }))
      )
      .onConflictDoUpdate({
        target: Station.id,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          icon: sql`excluded.icon`,
          headerBackgroundURL: sql`excluded.header_background_url`,
          routineCount: sql`excluded.routine_count`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncDeleteMyStationById = async (
    request: DeleteMyStationByIdRequest,
    response: DeleteMyStationByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(Station)
      .set({
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.deletedAt,
      })
      .where(
        and(
          eq(Station.id, request.body.stationId),
          StationLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        )
      );
  };

  static syncDeleteMyStationsByIds = async (
    request: DeleteMyStationsByIdsRequest,
    response: DeleteMyStationsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(Station)
      .set({
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.deletedAt,
      })
      .where(
        and(
          inArray(Station.id, request.body.stationIds),
          StationLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        )
      );
  };

  static syncHardDeleteMyStationById = async (
    request: HardDeleteMyStationByIdRequest,
    _response: HardDeleteMyStationByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(eq(Routine.stationId, request.body.stationId));
      const routineIds = routines.map(routine => routine.id);

      if (routineIds.length > 0) {
        await tx
          .delete(RoutinesToItems)
          .where(inArray(RoutinesToItems.routineId, routineIds));
        await tx
          .delete(RoutinesToTags)
          .where(inArray(RoutinesToTags.routineId, routineIds));
        await tx
          .delete(RoutinesToTasks)
          .where(inArray(RoutinesToTasks.routineId, routineIds));
        await tx.delete(Routine).where(inArray(Routine.id, routineIds));
      }
      await tx
        .delete(UsersToStations)
        .where(eq(UsersToStations.stationId, request.body.stationId));
      await tx.delete(Station).where(eq(Station.id, request.body.stationId));
    });
  };

  static syncHardDeleteMyStationsByIds = async (
    request: HardDeleteMyStationsByIdsRequest,
    _response: HardDeleteMyStationsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.stationIds.length === 0) return;

    await localDB.transaction(async tx => {
      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(inArray(Routine.stationId, request.body.stationIds));
      const routineIds = routines.map(routine => routine.id);

      if (routineIds.length > 0) {
        await tx
          .delete(RoutinesToItems)
          .where(inArray(RoutinesToItems.routineId, routineIds));
        await tx
          .delete(RoutinesToTags)
          .where(inArray(RoutinesToTags.routineId, routineIds));
        await tx
          .delete(RoutinesToTasks)
          .where(inArray(RoutinesToTasks.routineId, routineIds));
        await tx.delete(Routine).where(inArray(Routine.id, routineIds));
      }
      await tx
        .delete(UsersToStations)
        .where(inArray(UsersToStations.stationId, request.body.stationIds));
      await tx
        .delete(Station)
        .where(inArray(Station.id, request.body.stationIds));
    });
  };
}
