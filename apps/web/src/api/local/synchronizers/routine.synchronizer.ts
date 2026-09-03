import {
  AccessControlPermission,
  RoutinePeriod,
  RoutinePhase,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import type {
  CreateRoutineByStationIdRequest,
  CreateRoutineByStationIdResponse,
  CreateRoutinesByStationIdsRequest,
  CreateRoutinesByStationIdsResponse,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutineByIdResponse,
  DeleteMyRoutinesByIdsRequest,
  DeleteMyRoutinesByIdsResponse,
  GetAllMyRoutinesByTimeRangeResponse,
  GetMyRoutineByIdResponse,
  GetMyRoutinesByStationIdResponse,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutineByIdResponse,
  HardDeleteMyRoutinesByIdsRequest,
  HardDeleteMyRoutinesByIdsResponse,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdResponse,
  LinkRoutineItemsByIdsRequest,
  LinkRoutineItemsByIdsResponse,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdResponse,
  LinkRoutineTagsByIdsRequest,
  LinkRoutineTagsByIdsResponse,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutineByIdResponse,
  RestoreMyRoutinesByIdsRequest,
  RestoreMyRoutinesByIdsResponse,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutineByIdResponse,
  UpdateMyRoutinesByIdsRequest,
  UpdateMyRoutinesByIdsResponse,
} from "@shared/api/interfaces/routine.interface";
import { and, eq, exists, inArray, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Item,
  Routine,
  RoutinesToItems,
  RoutinesToTags,
  RoutinesToTasks,
  RoutineTag,
  RoutineTask,
  Station,
  User,
  UsersToStations,
} from "@/api/local/schemas";

export class RoutineLocalSynchronizer {
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

  static syncGetMyRoutineById = async (
    response: GetMyRoutineByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(Routine)
        .values({
          id: response.data.id,
          stationId: response.data.stationId,
          title: response.data.title,
          description: response.data.description,
          status: response.data.status,
          phase: response.data.phase,
          isPinned: response.data.isPinned,
          scheduledStartAt: response.data.scheduledStartAt,
          scheduledEndAt: response.data.scheduledEndAt,
          period: response.data.period,
          timezone: response.data.timezone,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: Routine.id,
          set: {
            stationId: response.data.stationId,
            title: response.data.title,
            description: response.data.description,
            status: response.data.status,
            phase: response.data.phase,
            isPinned: response.data.isPinned,
            scheduledStartAt: response.data.scheduledStartAt,
            scheduledEndAt: response.data.scheduledEndAt,
            period: response.data.period,
            timezone: response.data.timezone,
            deletedAt: response.data.deletedAt,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await tx
        .delete(RoutinesToTags)
        .where(eq(RoutinesToTags.routineId, response.data.id));
      await tx
        .delete(RoutinesToTasks)
        .where(eq(RoutinesToTasks.routineId, response.data.id));
      await tx
        .delete(RoutinesToItems)
        .where(eq(RoutinesToItems.routineId, response.data.id));

      if (response.data.tagIds.length > 0) {
        const routineTags = await tx
          .select({ id: RoutineTag.id })
          .from(RoutineTag)
          .where(inArray(RoutineTag.id, response.data.tagIds));

        if (routineTags.length > 0) {
          await tx.insert(RoutinesToTags).values(
            routineTags.map(routineTag => ({
              routineId: response.data.id,
              tagId: routineTag.id,
              createdAt: response.data.updatedAt,
            }))
          );
        }
      }

      if (response.data.taskIds.length > 0) {
        const routineTasks = await tx
          .select({ id: RoutineTask.id })
          .from(RoutineTask)
          .where(inArray(RoutineTask.id, response.data.taskIds));

        if (routineTasks.length > 0) {
          await tx.insert(RoutinesToTasks).values(
            routineTasks.map(routineTask => ({
              routineId: response.data.id,
              taskId: routineTask.id,
              createdAt: response.data.updatedAt,
            }))
          );
        }
      }

      if (response.data.itemIds.length > 0) {
        const items = await tx
          .select({ id: Item.id })
          .from(Item)
          .where(inArray(Item.id, response.data.itemIds));

        if (items.length > 0) {
          await tx.insert(RoutinesToItems).values(
            items.map(item => ({
              routineId: response.data.id,
              itemId: item.id,
            }))
          );
        }
      }
    });
  };

  static syncGetAllMyRoutinesByTimeRange = async (
    response: GetAllMyRoutinesByTimeRangeResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB.transaction(async tx => {
      await tx
        .insert(Routine)
        .values(
          response.data.map(routine => ({
            id: routine.id,
            stationId: routine.stationId,
            title: routine.title,
            status: routine.status,
            phase: routine.phase,
            isPinned: routine.isPinned,
            scheduledStartAt: routine.scheduledStartAt,
            scheduledEndAt: routine.scheduledEndAt,
            period: routine.period,
            timezone: routine.timezone,
            deletedAt: routine.deletedAt,
            updatedAt: routine.updatedAt,
            createdAt: routine.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Routine.id,
          set: {
            stationId: sql`excluded.station_id`,
            title: sql`excluded.title`,
            status: sql`excluded.status`,
            phase: sql`excluded.phase`,
            isPinned: sql`excluded.is_pinned`,
            scheduledStartAt: sql`excluded.scheduled_start_at`,
            scheduledEndAt: sql`excluded.scheduled_end_at`,
            period: sql`excluded.period`,
            timezone: sql`excluded.timezone`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });

      const routineIds = response.data.map(routine => routine.id);
      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.routineId, routineIds));
      await tx
        .delete(RoutinesToTasks)
        .where(inArray(RoutinesToTasks.routineId, routineIds));
      await tx
        .delete(RoutinesToItems)
        .where(inArray(RoutinesToItems.routineId, routineIds));

      const tagIds = [
        ...new Set(response.data.flatMap(routine => routine.tagIds)),
      ];
      const taskIds = [
        ...new Set(response.data.flatMap(routine => routine.taskIds)),
      ];
      const itemIds = [
        ...new Set(response.data.flatMap(routine => routine.itemIds)),
      ];

      if (tagIds.length > 0) {
        const routineTags = await tx
          .select({ id: RoutineTag.id })
          .from(RoutineTag)
          .where(inArray(RoutineTag.id, tagIds));
        const existingRoutineTagIds = new Set(
          routineTags.map(routineTag => routineTag.id)
        );
        const relations = response.data.flatMap(routine =>
          routine.tagIds
            .filter(tagId => existingRoutineTagIds.has(tagId))
            .map(tagId => ({
              routineId: routine.id,
              tagId,
              createdAt: routine.updatedAt,
            }))
        );
        if (relations.length > 0) {
          await tx.insert(RoutinesToTags).values(relations);
        }
      }

      if (taskIds.length > 0) {
        const routineTasks = await tx
          .select({ id: RoutineTask.id })
          .from(RoutineTask)
          .where(inArray(RoutineTask.id, taskIds));
        const existingRoutineTaskIds = new Set(
          routineTasks.map(routineTask => routineTask.id)
        );
        const relations = response.data.flatMap(routine =>
          routine.taskIds
            .filter(taskId => existingRoutineTaskIds.has(taskId))
            .map(taskId => ({
              routineId: routine.id,
              taskId,
              createdAt: routine.updatedAt,
            }))
        );
        if (relations.length > 0) {
          await tx.insert(RoutinesToTasks).values(relations);
        }
      }

      if (itemIds.length > 0) {
        const items = await tx
          .select({ id: Item.id })
          .from(Item)
          .where(inArray(Item.id, itemIds));
        const existingItemIds = new Set(items.map(item => item.id));
        const relations = response.data.flatMap(routine =>
          routine.itemIds
            .filter(itemId => existingItemIds.has(itemId))
            .map(itemId => ({
              routineId: routine.id,
              itemId,
            }))
        );
        if (relations.length > 0) {
          await tx.insert(RoutinesToItems).values(relations);
        }
      }
    });
  };

  static syncGetMyRoutinesByStationId = async (
    response: GetMyRoutinesByStationIdResponse
  ): Promise<void> => {
    await RoutineLocalSynchronizer.syncGetAllMyRoutinesByTimeRange(response);
  };

  static syncSearchRoutines = async (
    searchedRoutines: Array<{
      id: string;
      stationId: string;
      title: string;
      status: RoutineStatus;
      phase: RoutinePhase | null;
      isPinned: boolean;
      scheduledStartAt: Date;
      scheduledEndAt: Date;
      period: RoutinePeriod | null;
      timezone: string;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
      tagIds: string[];
      taskIds: string[];
      itemIds: string[];
    }>
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (searchedRoutines.length === 0) return;

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .insert(Routine)
        .values(
          searchedRoutines.map(routine => ({
            id: routine.id,
            stationId: routine.stationId,
            title: routine.title,
            status: routine.status,
            phase: routine.phase,
            isPinned: routine.isPinned,
            scheduledStartAt: routine.scheduledStartAt,
            scheduledEndAt: routine.scheduledEndAt,
            period: routine.period,
            timezone: routine.timezone,
            deletedAt: routine.deletedAt,
            updatedAt: routine.updatedAt,
            createdAt: routine.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Routine.id,
          set: {
            stationId: sql`excluded.station_id`,
            title: sql`excluded.title`,
            status: sql`excluded.status`,
            phase: sql`excluded.phase`,
            isPinned: sql`excluded.is_pinned`,
            scheduledStartAt: sql`excluded.scheduled_start_at`,
            scheduledEndAt: sql`excluded.scheduled_end_at`,
            period: sql`excluded.period`,
            timezone: sql`excluded.timezone`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });

      const routineIds = searchedRoutines.map(routine => routine.id);
      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.routineId, routineIds));
      await tx
        .delete(RoutinesToTasks)
        .where(inArray(RoutinesToTasks.routineId, routineIds));
      await tx
        .delete(RoutinesToItems)
        .where(inArray(RoutinesToItems.routineId, routineIds));
      const tagIds = [
        ...new Set(searchedRoutines.flatMap(routine => routine.tagIds)),
      ];
      const taskIds = [
        ...new Set(searchedRoutines.flatMap(routine => routine.taskIds)),
      ];
      const itemIds = [
        ...new Set(searchedRoutines.flatMap(routine => routine.itemIds)),
      ];
      const existingRoutineTagIds =
        tagIds.length === 0
          ? new Set<string>()
          : new Set(
              (
                await tx
                  .select({ id: RoutineTag.id })
                  .from(RoutineTag)
                  .where(inArray(RoutineTag.id, tagIds))
              ).map(routineTag => routineTag.id)
            );
      const existingRoutineTaskIds =
        taskIds.length === 0
          ? new Set<string>()
          : new Set(
              (
                await tx
                  .select({ id: RoutineTask.id })
                  .from(RoutineTask)
                  .where(inArray(RoutineTask.id, taskIds))
              ).map(routineTask => routineTask.id)
            );
      const existingItemIds =
        itemIds.length === 0
          ? new Set<string>()
          : new Set(
              (
                await tx
                  .select({ id: Item.id })
                  .from(Item)
                  .where(inArray(Item.id, itemIds))
              ).map(item => item.id)
            );
      const tagRelations = searchedRoutines.flatMap(routine =>
        routine.tagIds
          .filter(tagId => existingRoutineTagIds.has(tagId))
          .map(tagId => ({
            routineId: routine.id,
            tagId,
          }))
      );
      const taskRelations = searchedRoutines.flatMap(routine =>
        routine.taskIds
          .filter(taskId => existingRoutineTaskIds.has(taskId))
          .map(taskId => ({
            routineId: routine.id,
            taskId,
          }))
      );
      const itemRelations = searchedRoutines.flatMap(routine =>
        routine.itemIds
          .filter(itemId => existingItemIds.has(itemId))
          .map(itemId => ({
            routineId: routine.id,
            itemId,
          }))
      );
      if (tagRelations.length > 0) {
        await tx.insert(RoutinesToTags).values(tagRelations);
      }
      if (taskRelations.length > 0) {
        await tx.insert(RoutinesToTasks).values(taskRelations);
      }
      if (itemRelations.length > 0) {
        await tx.insert(RoutinesToItems).values(itemRelations);
      }
    });
  };

  static syncCreateRoutineByStationId = async (
    request: CreateRoutineByStationIdRequest,
    response: CreateRoutineByStationIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx.insert(Routine).values({
        id: response.data.id,
        stationId: request.body.stationId,
        title: request.body.title,
        description: request.body.description,
        status: RoutineStatus.Scheduled,
        isPinned: request.body.isPinned ?? false,
        scheduledStartAt:
          request.body.scheduledStartAt ?? response.data.createdAt,
        scheduledEndAt: request.body.scheduledEndAt ?? response.data.createdAt,
        period: request.body.period ?? null,
        timezone: request.body.timezone ?? "UTC",
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      });
      await tx
        .update(Station)
        .set({
          routineCount: sql`${Station.routineCount} + 1`,
          updatedAt: response.data.createdAt,
        })
        .where(eq(Station.id, request.body.stationId));
    });
  };

  static syncCreateRoutinesByStationIds = async (
    request: CreateRoutinesByStationIdsRequest,
    response: CreateRoutinesByStationIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.createdRoutines.length === 0) return;

    await localDB.transaction(async tx => {
      await tx.insert(Routine).values(
        request.body.createdRoutines.map((routine, index) => ({
          id: response.data.ids[index],
          stationId: routine.stationId,
          title: routine.title,
          description: routine.description,
          status: RoutineStatus.Scheduled,
          isPinned: routine.isPinned ?? false,
          scheduledStartAt: routine.scheduledStartAt ?? response.data.createdAt,
          scheduledEndAt: routine.scheduledEndAt ?? response.data.createdAt,
          period: routine.period ?? null,
          timezone: routine.timezone ?? "UTC",
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        }))
      );

      const routineCounts = new Map<string, number>();
      for (const routine of request.body.createdRoutines) {
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
            updatedAt: response.data.createdAt,
          })
          .where(eq(Station.id, stationId));
      }
    });
  };

  static syncUpdateMyRoutineById = async (
    request: UpdateMyRoutineByIdRequest,
    response: UpdateMyRoutineByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const existingRoutine = await tx.query.Routine.findFirst({
        where: eq(Routine.id, request.body.routineId),
      });

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
          updatedAt: response.data.updatedAt,
        })
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            RoutineLocalSynchronizer.getPassPermissionCheckSQL(
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

      if (
        existingRoutine !== undefined &&
        request.body.values.stationId !== undefined &&
        existingRoutine.stationId !== request.body.values.stationId
      ) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
            updatedAt: response.data.updatedAt,
          })
          .where(eq(Station.id, existingRoutine.stationId));
        await tx
          .update(Station)
          .set({
            routineCount: sql`${Station.routineCount} + 1`,
            updatedAt: response.data.updatedAt,
          })
          .where(eq(Station.id, request.body.values.stationId));
      }
    });
  };

  static syncUpdateMyRoutinesByIds = async (
    request: UpdateMyRoutinesByIdsRequest,
    response: UpdateMyRoutinesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const routine of request.body.updatedRoutines) {
        const existingRoutine = await tx.query.Routine.findFirst({
          where: eq(Routine.id, routine.routineId),
        });

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
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              eq(Routine.id, routine.routineId),
              RoutineLocalSynchronizer.getPassPermissionCheckSQL(
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

        if (
          existingRoutine !== undefined &&
          routine.values.stationId !== undefined &&
          existingRoutine.stationId !== routine.values.stationId
        ) {
          await tx
            .update(Station)
            .set({
              routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
              updatedAt: response.data.updatedAt,
            })
            .where(eq(Station.id, existingRoutine.stationId));
          await tx
            .update(Station)
            .set({
              routineCount: sql`${Station.routineCount} + 1`,
              updatedAt: response.data.updatedAt,
            })
            .where(eq(Station.id, routine.values.stationId));
        }
      }
    });
  };

  static syncLinkRoutineTagById = async (
    request: LinkRoutineTagByIdRequest,
    response: LinkRoutineTagByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
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
          createdAt: response.data.updatedAt,
        });
      }
    });
  };

  static syncLinkRoutineTagsByIds = async (
    request: LinkRoutineTagsByIdsRequest,
    response: LinkRoutineTagsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const relation of request.body.linkedRoutinesAndTags) {
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
            createdAt: response.data.updatedAt,
          });
        }
      }
    });
  };

  static syncLinkRoutineItemById = async (
    request: LinkRoutineItemByIdRequest,
    response: LinkRoutineItemByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
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
          createdAt: response.data.updatedAt,
        });
      }
    });
  };

  static syncLinkRoutineItemsByIds = async (
    request: LinkRoutineItemsByIdsRequest,
    response: LinkRoutineItemsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const relation of request.body.linkedRoutinesAndItems) {
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
            createdAt: response.data.updatedAt,
          });
        }
      }
    });
  };

  static syncRestoreMyRoutineById = async (
    _request: RestoreMyRoutineByIdRequest,
    response: RestoreMyRoutineByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(Routine)
      .values(response.data)
      .onConflictDoUpdate({
        target: Routine.id,
        set: {
          stationId: response.data.stationId,
          title: response.data.title,
          description: response.data.description,
          status: response.data.status,
          phase: response.data.phase,
          isPinned: response.data.isPinned,
          scheduledStartAt: response.data.scheduledStartAt,
          scheduledEndAt: response.data.scheduledEndAt,
          period: response.data.period,
          timezone: response.data.timezone,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncRestoreMyRoutinesByIds = async (
    _request: RestoreMyRoutinesByIdsRequest,
    response: RestoreMyRoutinesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB
      .insert(Routine)
      .values(response.data)
      .onConflictDoUpdate({
        target: Routine.id,
        set: {
          stationId: sql`excluded.station_id`,
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          status: sql`excluded.status`,
          phase: sql`excluded.phase`,
          isPinned: sql`excluded.is_pinned`,
          scheduledStartAt: sql`excluded.scheduled_start_at`,
          scheduledEndAt: sql`excluded.scheduled_end_at`,
          period: sql`excluded.period`,
          timezone: sql`excluded.timezone`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncDeleteMyRoutineById = async (
    request: DeleteMyRoutineByIdRequest,
    response: DeleteMyRoutineByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(Routine)
      .set({
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.deletedAt,
      })
      .where(
        and(
          eq(Routine.id, request.body.routineId),
          RoutineLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        )
      );
  };

  static syncDeleteMyRoutinesByIds = async (
    request: DeleteMyRoutinesByIdsRequest,
    response: DeleteMyRoutinesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(Routine)
      .set({
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.deletedAt,
      })
      .where(
        and(
          inArray(Routine.id, request.body.routineIds),
          RoutineLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        )
      );
  };

  static syncHardDeleteMyRoutineById = async (
    request: HardDeleteMyRoutineByIdRequest,
    response: HardDeleteMyRoutineByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const routine = await tx.query.Routine.findFirst({
        where: eq(Routine.id, request.body.routineId),
      });
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
      if (routine !== undefined) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
            updatedAt: response.data.deletedAt,
          })
          .where(eq(Station.id, routine.stationId));
      }
    });
  };

  static syncHardDeleteMyRoutinesByIds = async (
    request: HardDeleteMyRoutinesByIdsRequest,
    response: HardDeleteMyRoutinesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.routineIds.length === 0) return;

    await localDB.transaction(async tx => {
      const routines = await tx
        .select({ stationId: Routine.stationId })
        .from(Routine)
        .where(inArray(Routine.id, request.body.routineIds));
      await tx
        .delete(RoutinesToItems)
        .where(inArray(RoutinesToItems.routineId, request.body.routineIds));
      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.routineId, request.body.routineIds));
      await tx
        .delete(RoutinesToTasks)
        .where(inArray(RoutinesToTasks.routineId, request.body.routineIds));
      await tx
        .delete(Routine)
        .where(inArray(Routine.id, request.body.routineIds));

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
            updatedAt: response.data.deletedAt,
          })
          .where(eq(Station.id, stationId));
      }
    });
  };
}
