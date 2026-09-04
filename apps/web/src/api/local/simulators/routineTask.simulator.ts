import {
  AccessControlPermission,
  AllAccessControlPermissions,
} from "@shared/api/interfaces/enums";
import type {
  GetAllMyRoutineTasksRequest,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTasksByRoutineIdRequest,
  GetMyRoutineTasksByRoutineIdsRequest,
} from "@shared/api/interfaces/routineTask.interface";
import { and, asc, desc, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutineTask,
  Station,
  User,
  UsersToStations,
} from "@/api/local/schemas";

export class RoutineTaskLocalSimulator {
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
        title: RoutineTask.title,
        purpose: RoutineTask.purpose,
        phase: RoutineTask.phase,
        costUnit: RoutineTask.costUnit,
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
        title: RoutineTask.title,
        purpose: RoutineTask.purpose,
        phase: RoutineTask.phase,
        costUnit: RoutineTask.costUnit,
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
