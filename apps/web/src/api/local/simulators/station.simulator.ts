import { toGraphQLSupportedIcon } from "@shared/api/graphql/conversions";
import {
  SearchSortOrder,
  type SearchStationInput,
  SearchStationSortBy,
  type SearchStationsQuery,
  UserPlan,
  UserRole,
  UserStatus,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  AllAccessControlPermissions,
} from "@shared/api/interfaces/enums";
import type {
  CreateStationRequest,
  CreateStationsRequest,
  DeleteMyStationByIdRequest,
  DeleteMyStationsByIdsRequest,
  GetAllMyStationsRequest,
  GetMyStationByIdRequest,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationsByIdsRequest,
  RestoreMyStationByIdRequest,
  RestoreMyStationsByIdsRequest,
  UpdateMyStationByIdRequest,
  UpdateMyStationsByIdsRequest,
} from "@shared/api/interfaces/station.interface";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutinesToItems,
  RoutinesToTags,
  RoutinesToTasks,
  Station,
  Transaction,
  User,
  UsersToStations,
} from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class StationLocalSimulator {
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

  static simulateSearchStations = async (
    input: SearchStationInput
  ): Promise<SearchStationsQuery["searchStations"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });

    if (loggedInUser === undefined) {
      return {
        __typename: "SearchStationConnection",
        searchEdges: [],
        searchPageInfo: {
          __typename: "SearchPageInfo",
          hasNextPage: false,
          hasPreviousPage: false,
          startEncodedSearchCursor: null,
          endEncodedSearchCursor: null,
        },
        totalCount: 0,
        searchTime: performance.now() - startedAt,
      };
    }

    const accessibleStations = await localDB
      .select({
        id: Station.id,
        name: Station.name,
        icon: Station.icon,
        headerBackgroundURL: Station.headerBackgroundURL,
        permission: UsersToStations.permission,
        routineCount: Station.routineCount,
        deletedAt: Station.deletedAt,
        updatedAt: Station.updatedAt,
        createdAt: Station.createdAt,
      })
      .from(Station)
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Station.id),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      );

    const normalizedQuery = input.query.trim().toLowerCase();
    const stations = accessibleStations.filter(station => {
      if (station.deletedAt !== null) return false;
      if (normalizedQuery.length === 0) return true;
      return station.name.toLowerCase().includes(normalizedQuery);
    });

    stations.sort((left, right) => {
      const sortBy = input.sortBy ?? SearchStationSortBy.Relevance;
      const sortOrder = input.sortOrder ?? SearchSortOrder.Asc;
      let comparison = 0;

      if (sortBy === SearchStationSortBy.RoutineCount) {
        comparison = left.routineCount - right.routineCount;
      } else if (sortBy === SearchStationSortBy.LastUpdate) {
        comparison = left.updatedAt.getTime() - right.updatedAt.getTime();
      } else if (sortBy === SearchStationSortBy.CreatedAt) {
        comparison = left.createdAt.getTime() - right.createdAt.getTime();
      } else {
        comparison = left.name.localeCompare(right.name);
      }
      if (comparison === 0) {
        comparison = left.name.localeCompare(right.name);
      }
      return sortOrder === SearchSortOrder.Desc ? -comparison : comparison;
    });

    let afterId: string | null = null;
    if (input.after) {
      try {
        const decoded = JSON.parse(atob(input.after)) as {
          id?: unknown;
          fields?: { id?: unknown };
        };
        const decodedId = decoded.id ?? decoded.fields?.id;
        afterId = typeof decodedId === "string" ? decodedId : null;
      } catch {
        afterId = null;
      }
    }
    const afterIndex =
      afterId === null
        ? -1
        : stations.findIndex(station => station.id === afterId);
    const startIndex = afterIndex >= 0 ? afterIndex + 1 : 0;
    const first = Math.max(0, input.first ?? 10);
    const pagedStations = stations.slice(startIndex, startIndex + first);

    return {
      __typename: "SearchStationConnection",
      searchEdges: pagedStations.map(station => {
        const icon = toGraphQLSupportedIcon(station.icon);

        return {
          __typename: "SearchStationEdge",
          encodedSearchCursor: btoa(JSON.stringify({ id: station.id })),
          node: {
            __typename: "PrivateStation",
            id: station.id,
            name: station.name,
            icon,
            headerBackgroundURL: station.headerBackgroundURL,
            permission: station.permission,
            routineCount: station.routineCount,
            deletedAt: station.deletedAt,
            updatedAt: station.updatedAt,
            createdAt: station.createdAt,
            owner: {
              __typename: "PublicUser",
              publicId: loggedInUser.publicId,
              name: loggedInUser.name,
              displayName: loggedInUser.displayName,
              role: UserRole.Normal,
              plan: UserPlan.Free,
              status: loggedInUser.status as UserStatus,
              createdAt: loggedInUser.createdAt,
            },
            sharers: [],
            routines: [],
          },
        };
      }),
      searchPageInfo: {
        __typename: "SearchPageInfo",
        hasNextPage: startIndex + first < stations.length,
        hasPreviousPage: startIndex > 0,
        startEncodedSearchCursor:
          pagedStations.length > 0
            ? btoa(JSON.stringify({ id: pagedStations[0].id }))
            : null,
        endEncodedSearchCursor:
          pagedStations.length > 0
            ? btoa(
                JSON.stringify({
                  id: pagedStations[pagedStations.length - 1].id,
                })
              )
            : null,
      },
      totalCount: pagedStations.length,
      searchTime: performance.now() - startedAt,
    } as unknown as SearchStationsQuery["searchStations"];
  };

  static simulateGetMyStationById = async (
    request: GetMyStationByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    const stations = await localDB
      .select({
        id: Station.id,
        name: Station.name,
        description: Station.description,
        icon: Station.icon,
        headerBackgroundURL: Station.headerBackgroundURL,
        permission: UsersToStations.permission,
        routineCount: Station.routineCount,
        deletedAt: Station.deletedAt,
        updatedAt: Station.updatedAt,
        createdAt: Station.createdAt,
      })
      .from(Station)
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Station.id),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      )
      .where(eq(Station.id, request.param.stationId))
      .limit(1);

    const station = stations[0];
    if (!station) return null;

    const isDeleted = request.param.isDeleted ?? false;
    return (station.deletedAt !== null) === isDeleted ? station : null;
  };

  static simulateGetAllMyStations = async (
    request: GetAllMyStationsRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    const stations = await localDB
      .select({
        id: Station.id,
        name: Station.name,
        icon: Station.icon,
        headerBackgroundURL: Station.headerBackgroundURL,
        permission: UsersToStations.permission,
        routineCount: Station.routineCount,
        deletedAt: Station.deletedAt,
        updatedAt: Station.updatedAt,
        createdAt: Station.createdAt,
      })
      .from(Station)
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Station.id),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      );

    const areDeleted = request.param?.areDeleted ?? false;
    return stations.filter(
      station => (station.deletedAt !== null) === areDeleted
    );
  };

  static simulateCreateStation = async (
    request: CreateStationRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const id = request.body.id ?? generateUUID();
      const createdAt = new Date();
      request.body.id = id;

      await tx.insert(Station).values({
        id,
        name: request.body.name,
        description: request.body.description,
        icon: request.body.icon,
        headerBackgroundURL: request.body.headerBackgroundURL,
        createdAt,
        updatedAt: createdAt,
      });
      await tx.insert(UsersToStations).values({
        userPublicId: loggedInUser.publicId,
        stationId: id,
        permission: AccessControlPermission.Owner,
        createdAt,
        updatedAt: createdAt,
      });
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateStations = async (
    request: CreateStationsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const createdAt = new Date();
      const stations = request.body.createdStations.map(station => {
        const id = station.id ?? generateUUID();
        station.id = id;
        return {
          id,
          name: station.name,
          description: station.description,
          icon: station.icon,
          headerBackgroundURL: station.headerBackgroundURL,
          createdAt,
          updatedAt: createdAt,
        };
      });

      if (stations.length > 0) {
        await tx.insert(Station).values(stations);
        await tx.insert(UsersToStations).values(
          stations.map(station => ({
            userPublicId: loggedInUser.publicId,
            stationId: station.id,
            permission: AccessControlPermission.Owner,
            createdAt,
            updatedAt: createdAt,
          }))
        );
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyStationById = async (
    request: UpdateMyStationByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
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
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(Station.id, request.body.stationId),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyStationsByIds = async (
    request: UpdateMyStationsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const updatedAt = new Date();
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
            updatedAt,
          })
          .where(
            and(
              eq(Station.id, station.stationId),
              StationLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyStationById = async (
    request: RestoreMyStationByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(Station)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            eq(Station.id, request.body.stationId),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyStationsByIds = async (
    request: RestoreMyStationsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(Station)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            inArray(Station.id, request.body.stationIds),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyStationById = async (
    request: DeleteMyStationByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const deletedAt = new Date();
      await tx
        .update(Station)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            eq(Station.id, request.body.stationId),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyStationsByIds = async (
    request: DeleteMyStationsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const deletedAt = new Date();
      await tx
        .update(Station)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            inArray(Station.id, request.body.stationIds),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyStationById = async (
    request: HardDeleteMyStationByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const permittedStations = await tx
        .select({ id: Station.id })
        .from(Station)
        .where(
          and(
            eq(Station.id, request.body.stationId),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      if (permittedStations.length === 0) return;

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
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.HARD_DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyStationsByIds = async (
    request: HardDeleteMyStationsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const permittedStations = await tx
        .select({ id: Station.id })
        .from(Station)
        .where(
          and(
            inArray(Station.id, request.body.stationIds),
            StationLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      const stationIds = permittedStations.map(station => station.id);
      if (stationIds.length === 0) return;

      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(inArray(Routine.stationId, stationIds));
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
        .where(inArray(UsersToStations.stationId, stationIds));
      await tx.delete(Station).where(inArray(Station.id, stationIds));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Station,
        actionType: TransactionActionType.HARD_DELETE,
        body: {
          ...request.body,
          stationIds,
        },
        affected: request.affected,
      });
    });
  };
}
