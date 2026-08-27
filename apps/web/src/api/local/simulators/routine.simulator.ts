import {
  toGraphQLRoutinePeriod,
  toGraphQLRoutineStatus,
} from "@shared/api/graphql/conversions";
import {
  type SearchRoutineInput,
  SearchRoutineSortBy,
  type SearchRoutinesQuery,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  AllAccessControlPermissions,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import type {
  CreateRoutineByStationIdRequest,
  CreateRoutinesByStationIdsRequest,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutinesByIdsRequest,
  GetAllMyRoutinesByTimeRangeRequest,
  GetMyRoutineByIdRequest,
  GetMyRoutinesByStationIdRequest,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutinesByIdsRequest,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemsByIdsRequest,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagsByIdsRequest,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutinesByIdsRequest,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutinesByIdsRequest,
} from "@shared/api/interfaces/routine.interface";
import { localDB } from "@/api/local/db";
import {
  Item,
  Routine,
  RoutinesToItems,
  RoutinesToTags,
  RoutinesToTasks,
  RoutineTag,
  Station,
  Transaction,
  User,
  UsersToShelves,
  UsersToStations,
} from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import {
  and,
  asc,
  eq,
  exists,
  gt,
  inArray,
  isNull,
  lt,
  sql,
} from "drizzle-orm";

export class RoutineLocalSimulator {
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
            eq(UsersToStations.stationId, Routine.stationId),
            inArray(UsersToStations.permission, permissions)
          )
        )
    );

  static simulateSearchRoutines = async (
    input: SearchRoutineInput
  ): Promise<SearchRoutinesQuery["searchRoutines"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });

    if (loggedInUser === undefined) {
      return {
        __typename: "SearchRoutineConnection",
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

    const accessibleRoutines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
      })
      .from(Routine)
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      );

    const routineIdsByTag =
      input.tagIds.length === 0
        ? null
        : new Set(
            (
              await localDB
                .select({
                  routineId: RoutinesToTags.routineId,
                })
                .from(RoutinesToTags)
                .where(inArray(RoutinesToTags.tagId, input.tagIds))
            ).map(relation => relation.routineId)
          );
    const normalizedQuery = input.query.trim().toLowerCase();
    const routines = accessibleRoutines.filter(routine => {
      if (routine.deletedAt !== null) return false;
      if (
        input.stationIds.length > 0 &&
        !(input.stationIds as string[]).includes(routine.stationId)
      ) {
        return false;
      }
      if (routineIdsByTag && !routineIdsByTag.has(routine.id)) return false;
      if (normalizedQuery.length === 0) return true;
      return routine.title.toLowerCase().includes(normalizedQuery);
    });

    routines.sort((left, right) => {
      const sortBy = input.sortBy ?? SearchRoutineSortBy.Relevance;
      const sortOrder = input.sortOrder ?? SearchSortOrder.Asc;
      let comparison = 0;

      if (sortBy === SearchRoutineSortBy.Status) {
        comparison = left.status.localeCompare(right.status);
      } else if (sortBy === SearchRoutineSortBy.ScheduledStartAt) {
        comparison =
          left.scheduledStartAt.getTime() - right.scheduledStartAt.getTime();
      } else if (sortBy === SearchRoutineSortBy.ScheduledEndAt) {
        comparison =
          left.scheduledEndAt.getTime() - right.scheduledEndAt.getTime();
      } else if (sortBy === SearchRoutineSortBy.Period) {
        comparison = (left.period ?? "").localeCompare(right.period ?? "");
      } else if (sortBy === SearchRoutineSortBy.LastUpdate) {
        comparison = left.updatedAt.getTime() - right.updatedAt.getTime();
      } else if (sortBy === SearchRoutineSortBy.CreatedAt) {
        comparison = left.createdAt.getTime() - right.createdAt.getTime();
      } else {
        comparison = left.title.localeCompare(right.title);
      }
      if (comparison === 0) {
        comparison = left.title.localeCompare(right.title);
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
        : routines.findIndex(routine => routine.id === afterId);
    const startIndex = afterIndex >= 0 ? afterIndex + 1 : 0;
    const first = Math.max(0, input.first ?? 10);
    const pagedRoutines = routines.slice(startIndex, startIndex + first);
    const pagedRoutineIds = pagedRoutines.map(routine => routine.id);
    const linkedTags =
      pagedRoutineIds.length === 0
        ? []
        : await localDB
            .select({
              routineId: RoutinesToTags.routineId,
              tagId: RoutinesToTags.tagId,
            })
            .from(RoutinesToTags)
            .where(inArray(RoutinesToTags.routineId, pagedRoutineIds));
    const linkedTasks =
      pagedRoutineIds.length === 0
        ? []
        : await localDB
            .select({
              routineId: RoutinesToTasks.routineId,
              taskId: RoutinesToTasks.taskId,
            })
            .from(RoutinesToTasks)
            .where(inArray(RoutinesToTasks.routineId, pagedRoutineIds));
    const linkedItems =
      pagedRoutineIds.length === 0
        ? []
        : await localDB
            .select({
              routineId: RoutinesToItems.routineId,
              itemId: RoutinesToItems.itemId,
            })
            .from(RoutinesToItems)
            .where(inArray(RoutinesToItems.routineId, pagedRoutineIds));

    return {
      __typename: "SearchRoutineConnection",
      searchEdges: pagedRoutines.map(routine => {
        const status = toGraphQLRoutineStatus(routine.status);
        const period = toGraphQLRoutinePeriod(routine.period);
        return {
          __typename: "SearchRoutineEdge",
          encodedSearchCursor: btoa(JSON.stringify({ id: routine.id })),
          node: {
            __typename: "PrivateRoutine",
            id: routine.id,
            stationId: routine.stationId,
            title: routine.title,
            status,
            isPinned: routine.isPinned,
            scheduledStartAt: routine.scheduledStartAt,
            scheduledEndAt: routine.scheduledEndAt,
            period,
            timezone: routine.timezone,
            deletedAt: routine.deletedAt,
            updatedAt: routine.updatedAt,
            createdAt: routine.createdAt,
            tagIds: linkedTags
              .filter(tag => tag.routineId === routine.id)
              .map(tag => tag.tagId),
            taskIds: linkedTasks
              .filter(task => task.routineId === routine.id)
              .map(task => task.taskId),
            itemIds: linkedItems
              .filter(item => item.routineId === routine.id)
              .map(item => item.itemId),
          },
        };
      }),
      searchPageInfo: {
        __typename: "SearchPageInfo",
        hasNextPage: startIndex + pagedRoutines.length < routines.length,
        hasPreviousPage: startIndex > 0,
        startEncodedSearchCursor:
          pagedRoutines.length > 0
            ? btoa(JSON.stringify({ id: pagedRoutines[0].id }))
            : null,
        endEncodedSearchCursor:
          pagedRoutines.length > 0
            ? btoa(
                JSON.stringify({
                  id: pagedRoutines[pagedRoutines.length - 1].id,
                })
              )
            : null,
      },
      totalCount: routines.length,
      searchTime: performance.now() - startedAt,
    } as unknown as SearchRoutinesQuery["searchRoutines"];
  };

  static simulateGetMyRoutineById = async (
    request: GetMyRoutineByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    const routines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        description: Routine.description,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
      })
      .from(Routine)
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      )
      .where(eq(Routine.id, request.param.routineId))
      .limit(1);

    const routine = routines[0];
    if (!routine) return null;

    const isDeleted = request.param.isDeleted ?? false;
    if ((routine.deletedAt !== null) !== isDeleted) return null;

    const relations = await localDB
      .select({ tagId: RoutinesToTags.tagId })
      .from(RoutinesToTags)
      .where(eq(RoutinesToTags.routineId, routine.id));
    const taskRelations = await localDB
      .select({ taskId: RoutinesToTasks.taskId })
      .from(RoutinesToTasks)
      .where(eq(RoutinesToTasks.routineId, routine.id));
    const itemRelations = await localDB
      .select({ itemId: RoutinesToItems.itemId })
      .from(RoutinesToItems)
      .where(eq(RoutinesToItems.routineId, routine.id));
    return {
      ...routine,
      tagIds: relations.map(relation => relation.tagId),
      taskIds: taskRelations.map(relation => relation.taskId),
      itemIds: itemRelations.map(relation => relation.itemId),
    };
  };

  static simulateGetMyRoutinesByStationId = async (
    request: GetMyRoutinesByStationIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    const routines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
      })
      .from(Routine)
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      )
      .where(
        and(
          eq(Routine.stationId, request.param.stationId),
          isNull(Station.deletedAt),
          request.param.areDeleted === true
            ? sql`${Routine.deletedAt} IS NOT NULL`
            : isNull(Routine.deletedAt)
        )
      )
      .orderBy(
        asc(Routine.scheduledStartAt),
        asc(Routine.scheduledEndAt),
        asc(Routine.id)
      );
    if (routines.length === 0) return [];

    const relations = await localDB
      .select({
        routineId: RoutinesToTags.routineId,
        tagId: RoutinesToTags.tagId,
      })
      .from(RoutinesToTags)
      .where(
        inArray(
          RoutinesToTags.routineId,
          routines.map(routine => routine.id)
        )
      );
    const taskRelations = await localDB
      .select({
        routineId: RoutinesToTasks.routineId,
        taskId: RoutinesToTasks.taskId,
      })
      .from(RoutinesToTasks)
      .where(
        inArray(
          RoutinesToTasks.routineId,
          routines.map(routine => routine.id)
        )
      );
    const itemRelations = await localDB
      .select({
        routineId: RoutinesToItems.routineId,
        itemId: RoutinesToItems.itemId,
      })
      .from(RoutinesToItems)
      .where(
        inArray(
          RoutinesToItems.routineId,
          routines.map(routine => routine.id)
        )
      );
    return routines.map(routine => ({
      ...routine,
      tagIds: relations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.tagId),
      taskIds: taskRelations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.taskId),
      itemIds: itemRelations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.itemId),
    }));
  };

  static simulateGetAllMyRoutinesByTimeRange = async (
    request: GetAllMyRoutinesByTimeRangeRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];
    const from = new Date(request.param.from as string | number | Date);
    const to = new Date(request.param.to as string | number | Date);

    const routines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
      })
      .from(Routine)
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      )
      .where(
        and(
          inArray(Routine.stationId, request.param.stationIds),
          isNull(Station.deletedAt),
          request.param.areDeleted === true
            ? sql`${Routine.deletedAt} IS NOT NULL`
            : isNull(Routine.deletedAt),
          lt(Routine.scheduledStartAt, to),
          gt(Routine.scheduledEndAt, from)
        )
      )
      .orderBy(
        asc(Routine.scheduledStartAt),
        asc(Routine.scheduledEndAt),
        asc(Routine.id)
      );
    if (routines.length === 0) return [];

    const relations = await localDB
      .select({
        routineId: RoutinesToTags.routineId,
        tagId: RoutinesToTags.tagId,
      })
      .from(RoutinesToTags)
      .where(
        inArray(
          RoutinesToTags.routineId,
          routines.map(routine => routine.id)
        )
      );
    const taskRelations = await localDB
      .select({
        routineId: RoutinesToTasks.routineId,
        taskId: RoutinesToTasks.taskId,
      })
      .from(RoutinesToTasks)
      .where(
        inArray(
          RoutinesToTasks.routineId,
          routines.map(routine => routine.id)
        )
      );
    const itemRelations = await localDB
      .select({
        routineId: RoutinesToItems.routineId,
        itemId: RoutinesToItems.itemId,
      })
      .from(RoutinesToItems)
      .where(
        inArray(
          RoutinesToItems.routineId,
          routines.map(routine => routine.id)
        )
      );
    return routines.map(routine => ({
      ...routine,
      tagIds: relations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.tagId),
      taskIds: taskRelations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.taskId),
      itemIds: itemRelations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.itemId),
    }));
  };

  static simulateCreateRoutineByStationId = async (
    request: CreateRoutineByStationIdRequest
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
        .innerJoin(
          UsersToStations,
          and(
            eq(UsersToStations.stationId, Station.id),
            eq(UsersToStations.userPublicId, loggedInUser.publicId),
            inArray(UsersToStations.permission, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        )
        .where(
          and(
            eq(Station.id, request.body.stationId),
            sql`${Station.deletedAt} IS NULL`
          )
        );
      if (permittedStations.length === 0) return;

      const id = request.body.id ?? generateUUID();
      const createdAt = new Date();
      request.body.id = id;
      await tx.insert(Routine).values({
        id,
        stationId: request.body.stationId,
        title: request.body.title,
        description: request.body.description,
        status: request.body.status ?? RoutineStatus.Scheduled,
        isPinned: request.body.isPinned ?? false,
        scheduledStartAt: request.body.scheduledStartAt ?? createdAt,
        scheduledEndAt: request.body.scheduledEndAt ?? createdAt,
        period: request.body.period ?? null,
        timezone: request.body.timezone ?? "UTC",
        createdAt,
        updatedAt: createdAt,
      });
      await tx
        .update(Station)
        .set({
          routineCount: sql`${Station.routineCount} + 1`,
          updatedAt: createdAt,
        })
        .where(eq(Station.id, request.body.stationId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateRoutinesByStationIds = async (
    request: CreateRoutinesByStationIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const stationIds = [
        ...new Set(
          request.body.createdRoutines.map(routine => routine.stationId)
        ),
      ];
      const permittedStations =
        stationIds.length === 0
          ? []
          : await tx
              .select({ id: Station.id })
              .from(Station)
              .innerJoin(
                UsersToStations,
                and(
                  eq(UsersToStations.stationId, Station.id),
                  eq(UsersToStations.userPublicId, loggedInUser.publicId),
                  inArray(UsersToStations.permission, [
                    AccessControlPermission.Owner,
                    AccessControlPermission.Admin,
                    AccessControlPermission.Write,
                  ])
                )
              )
              .where(
                and(
                  inArray(Station.id, stationIds),
                  sql`${Station.deletedAt} IS NULL`
                )
              );
      const permittedStationIds = new Set(
        permittedStations.map(station => station.id)
      );
      const createdAt = new Date();
      request.body.createdRoutines = request.body.createdRoutines.filter(
        routine => permittedStationIds.has(routine.stationId)
      );
      const routines = request.body.createdRoutines.map(routine => {
        const id = routine.id ?? generateUUID();
        routine.id = id;
        return {
          id,
          stationId: routine.stationId,
          title: routine.title,
          description: routine.description,
          status: routine.status ?? RoutineStatus.Scheduled,
          isPinned: routine.isPinned ?? false,
          scheduledStartAt: routine.scheduledStartAt ?? createdAt,
          scheduledEndAt: routine.scheduledEndAt ?? createdAt,
          period: routine.period ?? null,
          timezone: routine.timezone ?? "UTC",
          createdAt,
          updatedAt: createdAt,
        };
      });
      if (routines.length === 0) return;

      await tx.insert(Routine).values(routines);
      const routineCounts = new Map<string, number>();
      for (const routine of routines) {
        routineCounts.set(
          routine.stationId,
          (routineCounts.get(routine.stationId) ?? 0) + 1
        );
      }
      for (const [stationId, count] of routineCounts) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`${Station.routineCount} + ${count}`,
            updatedAt: createdAt,
          })
          .where(eq(Station.id, stationId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRoutineById = async (
    request: UpdateMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const existingRoutine = await tx.query.Routine.findFirst({
        where: and(
          eq(Routine.id, request.body.routineId),
          RoutineLocalSimulator.getPassPermissionCheckSQL(
            tx,
            loggedInUser.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ]
          )
        ),
      });
      if (existingRoutine === undefined) return;

      if (
        request.body.values.stationId !== undefined &&
        request.body.values.stationId !== existingRoutine.stationId
      ) {
        const targetStation = await tx
          .select({ id: Station.id })
          .from(Station)
          .innerJoin(
            UsersToStations,
            and(
              eq(UsersToStations.stationId, Station.id),
              eq(UsersToStations.userPublicId, loggedInUser.publicId),
              inArray(UsersToStations.permission, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
            )
          )
          .where(eq(Station.id, request.body.values.stationId));
        if (targetStation.length === 0) return;
      }

      const updatedAt = new Date();
      await tx
        .update(Routine)
        .set({
          ...(request.body.values.stationId !== undefined && {
            stationId: request.body.values.stationId,
          }),
          ...(request.body.values.title !== undefined && {
            title: request.body.values.title,
          }),
          ...(request.body.values.description !== undefined && {
            description: request.body.values.description,
          }),
          ...(request.body.values.status !== undefined && {
            status: request.body.values.status,
          }),
          ...(request.body.values.isPinned !== undefined && {
            isPinned: request.body.values.isPinned,
          }),
          ...(request.body.values.scheduledStartAt !== undefined && {
            scheduledStartAt: request.body.values.scheduledStartAt,
          }),
          ...(request.body.values.scheduledEndAt !== undefined && {
            scheduledEndAt: request.body.values.scheduledEndAt,
          }),
          ...(request.body.values.period !== undefined && {
            period: request.body.values.period,
          }),
          ...(request.body.values.timezone !== undefined && {
            timezone: request.body.values.timezone,
          }),
          ...(request.body.setNull?.period && { period: null }),
          updatedAt,
        })
        .where(eq(Routine.id, request.body.routineId));

      if (
        request.body.values.stationId !== undefined &&
        request.body.values.stationId !== existingRoutine.stationId
      ) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
            updatedAt,
          })
          .where(eq(Station.id, existingRoutine.stationId));
        await tx
          .update(Station)
          .set({
            routineCount: sql`${Station.routineCount} + 1`,
            updatedAt,
          })
          .where(eq(Station.id, request.body.values.stationId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRoutinesByIds = async (
    request: UpdateMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const updatedAt = new Date();
      const validUpdates = [];
      for (const routine of request.body.updatedRoutines) {
        const existingRoutine = await tx.query.Routine.findFirst({
          where: and(
            eq(Routine.id, routine.routineId),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          ),
        });
        if (existingRoutine === undefined) continue;

        if (
          routine.values.stationId !== undefined &&
          routine.values.stationId !== existingRoutine.stationId
        ) {
          const targetStation = await tx
            .select({ id: Station.id })
            .from(Station)
            .innerJoin(
              UsersToStations,
              and(
                eq(UsersToStations.stationId, Station.id),
                eq(UsersToStations.userPublicId, loggedInUser.publicId),
                inArray(UsersToStations.permission, [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ])
              )
            )
            .where(eq(Station.id, routine.values.stationId));
          if (targetStation.length === 0) continue;
        }

        await tx
          .update(Routine)
          .set({
            ...(routine.values.stationId !== undefined && {
              stationId: routine.values.stationId,
            }),
            ...(routine.values.title !== undefined && {
              title: routine.values.title,
            }),
            ...(routine.values.description !== undefined && {
              description: routine.values.description,
            }),
            ...(routine.values.status !== undefined && {
              status: routine.values.status,
            }),
            ...(routine.values.isPinned !== undefined && {
              isPinned: routine.values.isPinned,
            }),
            ...(routine.values.scheduledStartAt !== undefined && {
              scheduledStartAt: routine.values.scheduledStartAt,
            }),
            ...(routine.values.scheduledEndAt !== undefined && {
              scheduledEndAt: routine.values.scheduledEndAt,
            }),
            ...(routine.values.period !== undefined && {
              period: routine.values.period,
            }),
            ...(routine.values.timezone !== undefined && {
              timezone: routine.values.timezone,
            }),
            ...(routine.setNull?.period && { period: null }),
            updatedAt,
          })
          .where(eq(Routine.id, routine.routineId));

        if (
          routine.values.stationId !== undefined &&
          routine.values.stationId !== existingRoutine.stationId
        ) {
          await tx
            .update(Station)
            .set({
              routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
              updatedAt,
            })
            .where(eq(Station.id, existingRoutine.stationId));
          await tx
            .update(Station)
            .set({
              routineCount: sql`${Station.routineCount} + 1`,
              updatedAt,
            })
            .where(eq(Station.id, routine.values.stationId));
        }
        validUpdates.push(routine);
      }
      if (validUpdates.length === 0) return;

      request.body.updatedRoutines = validUpdates;
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateLinkRoutineTagById = async (
    request: LinkRoutineTagByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            sql`${Routine.deletedAt} IS NULL`,
            RoutineLocalSimulator.getPassPermissionCheckSQL(
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
      const tags = await tx
        .select({ id: RoutineTag.id })
        .from(RoutineTag)
        .where(
          and(
            eq(RoutineTag.ownerPublicId, loggedInUser.publicId),
            eq(RoutineTag.id, request.body.routineTagId)
          )
        );
      if (routines.length === 0 || tags.length === 0) return;

      await tx
        .delete(RoutinesToTags)
        .where(
          and(
            eq(RoutinesToTags.routineId, request.body.routineId),
            eq(RoutinesToTags.tagId, request.body.routineTagId)
          )
        );
      if (!request.body.isUnlink) {
        await tx.insert(RoutinesToTags).values({
          routineId: request.body.routineId,
          tagId: request.body.routineTagId,
        });
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToTags,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateLinkRoutineTagsByIds = async (
    request: LinkRoutineTagsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const validRelations = [];
      for (const relation of request.body.linkedRoutinesAndTags) {
        const routines = await tx
          .select({ id: Routine.id })
          .from(Routine)
          .where(
            and(
              eq(Routine.id, relation.routineId),
              sql`${Routine.deletedAt} IS NULL`,
              RoutineLocalSimulator.getPassPermissionCheckSQL(
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
        const tags = await tx
          .select({ id: RoutineTag.id })
          .from(RoutineTag)
          .where(
            and(
              eq(RoutineTag.ownerPublicId, loggedInUser.publicId),
              eq(RoutineTag.id, relation.routineTagId)
            )
          );
        if (routines.length === 0 || tags.length === 0) continue;

        await tx
          .delete(RoutinesToTags)
          .where(
            and(
              eq(RoutinesToTags.routineId, relation.routineId),
              eq(RoutinesToTags.tagId, relation.routineTagId)
            )
          );
        if (!request.body.isUnlink) {
          await tx.insert(RoutinesToTags).values({
            routineId: relation.routineId,
            tagId: relation.routineTagId,
          });
        }
        validRelations.push(relation);
      }
      if (validRelations.length === 0) return;

      request.body.linkedRoutinesAndTags = validRelations;
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToTags,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateLinkRoutineItemById = async (
    request: LinkRoutineItemByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            sql`${Routine.deletedAt} IS NULL`,
            RoutineLocalSimulator.getPassPermissionCheckSQL(
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
      const items = await tx
        .select({ id: Item.id })
        .from(Item)
        .innerJoin(
          UsersToShelves,
          and(
            eq(UsersToShelves.rootShelfId, Item.rootShelfId),
            eq(UsersToShelves.userPublicId, loggedInUser.publicId),
            inArray(UsersToShelves.permission, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        )
        .where(
          and(
            eq(Item.id, request.body.itemId),
            eq(Item.type, request.body.itemType),
            sql`${Item.deletedAt} IS NULL`
          )
        );
      if (routines.length === 0 || items.length === 0) return;

      await tx
        .delete(RoutinesToItems)
        .where(
          and(
            eq(RoutinesToItems.routineId, request.body.routineId),
            eq(RoutinesToItems.itemId, request.body.itemId)
          )
        );
      if (!request.body.isUnlink) {
        await tx.insert(RoutinesToItems).values({
          routineId: request.body.routineId,
          itemId: request.body.itemId,
        });
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToItems,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateLinkRoutineItemsByIds = async (
    request: LinkRoutineItemsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const validRelations = [];
      for (const relation of request.body.linkedRoutinesAndItems) {
        const routines = await tx
          .select({ id: Routine.id })
          .from(Routine)
          .where(
            and(
              eq(Routine.id, relation.routineId),
              sql`${Routine.deletedAt} IS NULL`,
              RoutineLocalSimulator.getPassPermissionCheckSQL(
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
        const items = await tx
          .select({ id: Item.id })
          .from(Item)
          .innerJoin(
            UsersToShelves,
            and(
              eq(UsersToShelves.rootShelfId, Item.rootShelfId),
              eq(UsersToShelves.userPublicId, loggedInUser.publicId),
              inArray(UsersToShelves.permission, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
            )
          )
          .where(
            and(
              eq(Item.id, relation.itemId),
              eq(Item.type, relation.itemType),
              sql`${Item.deletedAt} IS NULL`
            )
          );
        if (routines.length === 0 || items.length === 0) continue;

        await tx
          .delete(RoutinesToItems)
          .where(
            and(
              eq(RoutinesToItems.routineId, relation.routineId),
              eq(RoutinesToItems.itemId, relation.itemId)
            )
          );
        if (!request.body.isUnlink) {
          await tx.insert(RoutinesToItems).values({
            routineId: relation.routineId,
            itemId: relation.itemId,
          });
        }
        validRelations.push(relation);
      }
      if (validRelations.length === 0) return;

      request.body.linkedRoutinesAndItems = validRelations;
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToItems,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyRoutineById = async (
    request: RestoreMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(Routine)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyRoutinesByIds = async (
    request: RestoreMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(Routine)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            inArray(Routine.id, request.body.routineIds),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyRoutineById = async (
    request: DeleteMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const deletedAt = new Date();
      await tx
        .update(Routine)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyRoutinesByIds = async (
    request: DeleteMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const deletedAt = new Date();
      await tx
        .update(Routine)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            inArray(Routine.id, request.body.routineIds),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyRoutineById = async (
    request: HardDeleteMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routine = await tx.query.Routine.findFirst({
        where: and(
          eq(Routine.id, request.body.routineId),
          RoutineLocalSimulator.getPassPermissionCheckSQL(
            tx,
            loggedInUser.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        ),
      });
      if (routine === undefined) return;

      const deletedAt = new Date();
      await tx
        .delete(RoutinesToItems)
        .where(eq(RoutinesToItems.routineId, request.body.routineId));
      await tx
        .delete(RoutinesToTags)
        .where(eq(RoutinesToTags.routineId, request.body.routineId));
      await tx
        .delete(RoutinesToTasks)
        .where(eq(RoutinesToTasks.routineId, request.body.routineId));
      await tx.delete(Routine).where(eq(Routine.id, request.body.routineId));
      await tx
        .update(Station)
        .set({
          routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
          updatedAt: deletedAt,
        })
        .where(eq(Station.id, routine.stationId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.HARD_DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyRoutinesByIds = async (
    request: HardDeleteMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routines = await tx
        .select({ id: Routine.id, stationId: Routine.stationId })
        .from(Routine)
        .where(
          and(
            inArray(Routine.id, request.body.routineIds),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      const routineIds = routines.map(routine => routine.id);
      if (routineIds.length === 0) return;

      const deletedAt = new Date();
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

      const routineCounts = new Map<string, number>();
      for (const routine of routines) {
        routineCounts.set(
          routine.stationId,
          (routineCounts.get(routine.stationId) ?? 0) + 1
        );
      }
      for (const [stationId, count] of routineCounts) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`MAX(0, ${Station.routineCount} - ${count})`,
            updatedAt: deletedAt,
          })
          .where(eq(Station.id, stationId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.HARD_DELETE,
        body: {
          ...request.body,
          routineIds,
        },
        affected: request.affected,
      });
    });
  };
}
