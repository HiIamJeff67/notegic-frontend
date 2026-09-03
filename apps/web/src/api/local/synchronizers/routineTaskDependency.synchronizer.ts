import type {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  CreateRoutineTaskDependencyByRoutineIdResponse,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdResponse,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdResponse,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdResponse,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { and, eq, inArray, or } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { RoutineTask, RoutineTaskDependency } from "@/api/local/schemas";

export class RoutineTaskDependencyLocalSynchronizer {
  private static syncDependency = async (
    dependency: GetRoutineTaskDependenciesByRoutineIdResponse["data"][number]
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(RoutineTaskDependency)
      .values(dependency)
      .onConflictDoUpdate({
        target: [
          RoutineTaskDependency.routineTaskId,
          RoutineTaskDependency.previousRoutineTaskId,
        ],
        set: {
          description: dependency.description,
          progress: dependency.progress,
          updatedAt: dependency.updatedAt,
          createdAt: dependency.createdAt,
        },
      });
  };

  static syncGetRoutineTaskDependenciesByRoutineId = async (
    request: GetRoutineTaskDependenciesByRoutineIdRequest,
    response: GetRoutineTaskDependenciesByRoutineIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const routineTaskIds = await tx
        .select({ id: RoutineTask.id })
        .from(RoutineTask)
        .where(eq(RoutineTask.routineId, request.param.routineId));
      const taskIds = routineTaskIds.map(task => task.id);

      if (taskIds.length > 0) {
        await tx
          .delete(RoutineTaskDependency)
          .where(
            or(
              inArray(RoutineTaskDependency.routineTaskId, taskIds),
              inArray(RoutineTaskDependency.previousRoutineTaskId, taskIds)
            )
          );
      }

      if (response.data.length === 0) return;

      await tx.insert(RoutineTaskDependency).values(response.data);
    });
  };

  static syncCreateRoutineTaskDependencyByRoutineId = async (
    _request: CreateRoutineTaskDependencyByRoutineIdRequest,
    response: CreateRoutineTaskDependencyByRoutineIdResponse
  ): Promise<void> => {
    await RoutineTaskDependencyLocalSynchronizer.syncDependency(response.data);
  };

  static syncUpdateRoutineTaskDependencyByRoutineId = async (
    _request: UpdateRoutineTaskDependencyByRoutineIdRequest,
    response: UpdateRoutineTaskDependencyByRoutineIdResponse
  ): Promise<void> => {
    await RoutineTaskDependencyLocalSynchronizer.syncDependency(response.data);
  };

  static syncDeleteRoutineTaskDependencyByRoutineId = async (
    request: DeleteRoutineTaskDependencyByRoutineIdRequest,
    _response: Pick<DeleteRoutineTaskDependencyByRoutineIdResponse, "data">
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
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
  };
}
