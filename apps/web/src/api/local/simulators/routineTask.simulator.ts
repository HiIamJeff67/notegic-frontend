import {
  AccessControlPermission,
  AllAccessControlPermissions,
  type RoutineTaskPurpose,
} from "@shared/api/interfaces/enums";
import type {
  CreateRoutineTaskByRoutineIdRequest,
  GetAllMyRoutineTasksRequest,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTasksByRoutineIdRequest,
  GetMyRoutineTasksByRoutineIdsRequest,
  HardDeleteMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdRequest,
} from "@shared/api/interfaces/routineTask.interface";
import { normalizeRoutineTaskDefinition } from "@shared/api/interfaces/routineTask.interface";
import { and, asc, desc, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutinesToTasks,
  RoutineTask,
  RoutineTaskDependency,
  Station,
  Transaction,
  User,
  UsersToStations,
} from "@/api/local/schemas";

import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";

export class RoutineTaskLocalSimulator {
  static getPendingMutations = async () => {
    if (!localDB.isReady) await localDB.ensureReady();
    const user = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!user) return [];
    return localDB
      .select()
      .from(Transaction)
      .where(
        and(
          eq(Transaction.ownerPublicId, user.publicId),
          eq(Transaction.entityType, TransactionEntityType.RoutineTask)
        )
      );
  };

  static resetPendingRetries = async (routineId: string) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const user = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!user) return;
    await localDB
      .update(Transaction)
      .set({ retryCount: 0, lastError: null })
      .where(
        and(
          eq(Transaction.ownerPublicId, user.publicId),
          eq(Transaction.entityType, TransactionEntityType.RoutineTask),
          sql`COALESCE(json_extract(${Transaction.body}, '$.routineId'), json_extract(${Transaction.affected}, '$.routineId')) = ${routineId}`
        )
      );
  };

  static simulateCreateRoutineTaskByRoutineId = async (
    request: CreateRoutineTaskByRoutineIdRequest
  ) => {
    const normalized = normalizeRoutineTaskDefinition(request.body);
    if (!localDB.isReady) await localDB.ensureReady();
    return localDB.transaction(async tx => {
      const user = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!user || !request.body.id)
        throw new Error("A signed-in user and stable node id are required");
      const [routine] = await tx
        .select()
        .from(Routine)
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
              tx,
              user.publicId,
              [
                AccessControlPermission.Write,
                AccessControlPermission.Admin,
                AccessControlPermission.Owner,
              ]
            )
          )
        );
      if (!routine) throw new Error("Routine write permission is required");
      const createdAt = new Date();
      await tx.insert(RoutineTask).values({
        id: request.body.id,
        routineId: routine.id,
        kind: request.body.kind ?? "Action",
        x: request.body.x ?? 0,
        y: request.body.y ?? 0,
        title: request.body.title,
        payload: normalized.payload,
        priority: request.body.priority ?? 0,
        maxAttempts: request.body.maxAttempts ?? 1,
        previousRoutineTaskIds: [],
        createdAt,
        updatedAt: createdAt,
      });
      if (normalized.kind === "Action")
        await tx.insert(RoutinesToTasks).values({
          routineId: routine.id,
          taskId: request.body.id,
          createdAt,
        });
      await tx.insert(Transaction).values({
        ownerPublicId: user.publicId,
        entityType: TransactionEntityType.RoutineTask,
        actionType: TransactionActionType.CREATE,
        body: {
          ...request.body,
          payload: normalized.payload,
          expectedDefinitionVersion:
            request.body.expectedDefinitionVersion ?? routine.definitionVersion,
        },
        affected: { routineId: routine.id, kind: normalized.kind },
      });
      return { id: request.body.id, createdAt };
    });
  };

  static simulateUpdateMyRoutineTaskById = async (
    request: UpdateMyRoutineTaskByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return localDB.transaction(async tx => {
      const user = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!user) throw new Error("A signed-in user is required");
      const [entry] = await tx
        .select({ task: RoutineTask, routine: Routine })
        .from(RoutineTask)
        .innerJoin(Routine, eq(Routine.id, RoutineTask.routineId))
        .where(
          and(
            eq(RoutineTask.id, request.body.routineTaskId),
            RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
              tx,
              user.publicId,
              [
                AccessControlPermission.Write,
                AccessControlPermission.Admin,
                AccessControlPermission.Owner,
              ]
            )
          )
        );
      if (!entry) throw new Error("Routine write permission is required");
      if (
        request.body.values.routineId &&
        request.body.values.routineId !== entry.task.routineId
      )
        throw new Error("Moving a node requires an online permission check");
      const normalized = normalizeRoutineTaskDefinition({
        ...entry.task,
        ...request.body.values,
        purpose:
          entry.task.kind === "Start"
            ? request.body.values.purpose
            : ((request.body.values.purpose ??
                request.body.values.payload?.purpose ??
                (entry.task.payload as Record<string, unknown>)
                  ?.purpose) as RoutineTaskPurpose),
      });
      const updatedAt = new Date();
      await tx
        .update(RoutineTask)
        .set({
          ...request.body.values,
          payload: normalized.payload,
          updatedAt,
        })
        .where(eq(RoutineTask.id, entry.task.id));
      await tx.insert(Transaction).values({
        ownerPublicId: user.publicId,
        entityType: TransactionEntityType.RoutineTask,
        actionType: TransactionActionType.UPDATE,
        body: {
          ...request.body,
          values: {
            ...request.body.values,
            payload: normalized.payload,
          },
          expectedDefinitionVersion:
            request.body.expectedDefinitionVersion ??
            entry.routine.definitionVersion,
        },
        affected: { routineId: entry.task.routineId, kind: entry.task.kind },
      });
      return { updatedAt };
    });
  };

  static simulateHardDeleteMyRoutineTaskById = async (
    request: HardDeleteMyRoutineTaskByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return localDB.transaction(async tx => {
      const user = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!user) throw new Error("A signed-in user is required");
      const [entry] = await tx
        .select({ task: RoutineTask, routine: Routine })
        .from(RoutineTask)
        .innerJoin(Routine, eq(Routine.id, RoutineTask.routineId))
        .where(
          and(
            eq(RoutineTask.id, request.body.routineTaskId),
            RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
              tx,
              user.publicId,
              [
                AccessControlPermission.Write,
                AccessControlPermission.Admin,
                AccessControlPermission.Owner,
              ]
            )
          )
        );
      if (!entry) throw new Error("Routine write permission is required");
      await tx
        .delete(RoutineTaskDependency)
        .where(
          sql`${RoutineTaskDependency.routineTaskId} = ${entry.task.id} OR ${RoutineTaskDependency.previousRoutineTaskId} = ${entry.task.id}`
        );
      await tx
        .delete(RoutinesToTasks)
        .where(eq(RoutinesToTasks.taskId, entry.task.id));
      await tx.delete(RoutineTask).where(eq(RoutineTask.id, entry.task.id));
      await tx.insert(Transaction).values({
        ownerPublicId: user.publicId,
        entityType: TransactionEntityType.RoutineTask,
        actionType: TransactionActionType.HARD_DELETE,
        body: request.body,
        affected: { routineId: entry.task.routineId, kind: entry.task.kind },
      });
      return { deletedAt: new Date() };
    });
  };

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

  static simulateGetMyRoutineTaskById = async (
    request: GetMyRoutineTaskByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    if (request.param.isDeleted === true) return null;

    const routineTasks = await localDB
      .select()
      .from(RoutineTask)
      .innerJoin(Routine, eq(Routine.id, RoutineTask.routineId))
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .where(
        and(
          eq(RoutineTask.id, request.param.routineTaskId),
          isNull(Station.deletedAt),
          RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            AllAccessControlPermissions
          )
        )
      )
      .limit(1);

    return routineTasks[0]?.RoutineTaskTable ?? null;
  };

  static simulateGetMyRoutineTasksByRoutineIds = async (
    request: GetMyRoutineTasksByRoutineIdsRequest
  ) => {
    if (request.param.areDeleted === true) return [];

    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    return await localDB
      .select({
        id: RoutineTask.id,
        routineId: RoutineTask.routineId,
        kind: RoutineTask.kind,
        x: RoutineTask.x,
        y: RoutineTask.y,
        title: RoutineTask.title,
        payload: RoutineTask.payload,
        priority: RoutineTask.priority,
        maxAttempts: RoutineTask.maxAttempts,
        previousRoutineTaskIds: RoutineTask.previousRoutineTaskIds,
        updatedAt: RoutineTask.updatedAt,
        createdAt: RoutineTask.createdAt,
      })
      .from(RoutineTask)
      .innerJoin(Routine, eq(Routine.id, RoutineTask.routineId))
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .where(
        and(
          inArray(RoutineTask.routineId, request.param.routineIds),
          isNull(Station.deletedAt),
          RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            AllAccessControlPermissions
          )
        )
      )
      .orderBy(desc(RoutineTask.priority), asc(RoutineTask.id));
  };

  static simulateGetMyRoutineTasksByRoutineId = async (
    request: GetMyRoutineTasksByRoutineIdRequest
  ) => {
    return RoutineTaskLocalSimulator.simulateGetMyRoutineTasksByRoutineIds({
      ...request,
      param: {
        routineIds: [request.param.routineId],
        areDeleted: request.param.areDeleted,
      },
    });
  };

  static simulateGetAllMyRoutineTasks = async (
    request?: GetAllMyRoutineTasksRequest
  ) => {
    if (request?.param?.areDeleted === true) return [];

    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    return await localDB
      .select({
        id: RoutineTask.id,
        routineId: RoutineTask.routineId,
        kind: RoutineTask.kind,
        x: RoutineTask.x,
        y: RoutineTask.y,
        title: RoutineTask.title,
        payload: RoutineTask.payload,
        priority: RoutineTask.priority,
        maxAttempts: RoutineTask.maxAttempts,
        previousRoutineTaskIds: RoutineTask.previousRoutineTaskIds,
        updatedAt: RoutineTask.updatedAt,
        createdAt: RoutineTask.createdAt,
      })
      .from(RoutineTask)
      .innerJoin(Routine, eq(Routine.id, RoutineTask.routineId))
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .where(
        and(
          isNull(Station.deletedAt),
          RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            AllAccessControlPermissions
          )
        )
      )
      .orderBy(desc(RoutineTask.priority), asc(RoutineTask.id));
  };
}
