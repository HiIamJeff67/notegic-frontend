import { AllAccessControlPermissions } from "@shared/api/interfaces/enums";
import type {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { and, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutineTask,
  RoutineTaskDependency,
  Station,
  User,
  UsersToStations,
} from "@/api/local/schemas";

export class RoutineTaskDependencyLocalSimulator {
  private static getPassPermissionCheckSQL = (userPublicId: string) =>
    exists(
      localDB
        .select({ one: sql`1` })
        .from(UsersToStations)
        .where(
          and(
            eq(UsersToStations.userPublicId, userPublicId),
            eq(UsersToStations.stationId, Routine.stationId),
            inArray(UsersToStations.permission, AllAccessControlPermissions)
          )
        )
    );

  static simulateGetRoutineTaskDependenciesByRoutineId = async (
    request: GetRoutineTaskDependenciesByRoutineIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const routineTasks = await localDB
      .select({ id: RoutineTask.id })
      .from(RoutineTask)
      .innerJoin(Routine, eq(Routine.id, RoutineTask.routineId))
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .where(
        and(
          eq(Routine.id, request.param.routineId),
          isNull(Station.deletedAt),
          RoutineTaskDependencyLocalSimulator.getPassPermissionCheckSQL(
            loggedInUser.publicId
          )
        )
      );
    const taskIds = routineTasks.map(task => task.id);
    if (taskIds.length === 0) return [];

    return await localDB
      .select()
      .from(RoutineTaskDependency)
      .where(
        and(
          inArray(RoutineTaskDependency.routineTaskId, taskIds),
          inArray(RoutineTaskDependency.previousRoutineTaskId, taskIds)
        )
      );
  };

  static simulateCreateRoutineTaskDependencyByRoutineId = async (
    request: CreateRoutineTaskDependencyByRoutineIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const createdAt = new Date();
    const dependency = {
      routineTaskId: request.body.routineTaskId,
      previousRoutineTaskId: request.body.previousRoutineTaskId,
      description: request.body.description ?? "",
      progress: request.body.progress ?? 0,
      updatedAt: createdAt,
      createdAt,
    };

    await localDB.insert(RoutineTaskDependency).values(dependency);
    return dependency;
  };

  static simulateUpdateRoutineTaskDependencyByRoutineId = async (
    request: UpdateRoutineTaskDependencyByRoutineIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return await localDB.transaction(async tx => {
      const updatedAt = new Date();
      await tx
        .update(RoutineTaskDependency)
        .set({
          ...(request.body.description !== undefined && {
            description: request.body.description ?? "",
          }),
          ...(request.body.progress !== undefined && {
            progress: request.body.progress ?? 0,
          }),
          updatedAt,
        })
        .where(
          and(
            eq(RoutineTaskDependency.routineTaskId, request.body.routineTaskId),
            eq(
              RoutineTaskDependency.previousRoutineTaskId,
              request.body.previousRoutineTaskId
            )
          )
        );

      const dependency = await tx
        .select()
        .from(RoutineTaskDependency)
        .where(
          and(
            eq(RoutineTaskDependency.routineTaskId, request.body.routineTaskId),
            eq(
              RoutineTaskDependency.previousRoutineTaskId,
              request.body.previousRoutineTaskId
            )
          )
        )
        .limit(1);
      return dependency[0] ?? null;
    });
  };

  static simulateDeleteRoutineTaskDependencyByRoutineId = async (
    request: DeleteRoutineTaskDependencyByRoutineIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return await localDB.transaction(async tx => {
      const dependencies = await tx
        .select({ routineTaskId: RoutineTaskDependency.routineTaskId })
        .from(RoutineTaskDependency)
        .where(
          and(
            eq(RoutineTaskDependency.routineTaskId, request.body.routineTaskId),
            eq(
              RoutineTaskDependency.previousRoutineTaskId,
              request.body.previousRoutineTaskId
            )
          )
        )
        .limit(1);
      await tx
        .delete(RoutineTaskDependency)
        .where(
          and(
            eq(RoutineTaskDependency.routineTaskId, request.body.routineTaskId),
            eq(
              RoutineTaskDependency.previousRoutineTaskId,
              request.body.previousRoutineTaskId
            )
          )
        );
      return { deletedCount: dependencies.length };
    });
  };
}
