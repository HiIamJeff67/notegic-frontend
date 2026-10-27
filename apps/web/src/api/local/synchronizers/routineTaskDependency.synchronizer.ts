import type {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  CreateRoutineTaskDependencyByRoutineIdResponse,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdResponse,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdResponse,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdResponse,
  UpdateRoutineTaskGraphByRoutineIdRequest,
  UpdateRoutineTaskGraphByRoutineIdResponse,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  Routine,
  RoutineTask,
  RoutineTaskDependency,
  RoutineTaskDependencyGraphDraft,
  RoutinesToTasks,
  Transaction,
} from "@/api/local/schemas";

export class RoutineTaskDependencyLocalSynchronizer {
  static syncUpdateRoutineTaskGraphByRoutineId = async (
    request: UpdateRoutineTaskGraphByRoutineIdRequest,
    graph: UpdateRoutineTaskGraphByRoutineIdResponse["data"]
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const pending = await tx
        .select({ sequence: Transaction.sequence })
        .from(Transaction)
        .where(
          sql`json_extract(${Transaction.body}, '$.routineId') = ${request.param.routineId} OR json_extract(${Transaction.affected}, '$.routineId') = ${request.param.routineId}`
        )
        .limit(1);
      if (pending.length)
        throw new NotegicAPIError(
          new NotegicException(
            {
              reason: "DefinitionConflict",
              domain: "Routine",
              operation: "UpdateGraphCache",
              message:
                "Pending local mutations must be synchronized before updating the graph cache",
              retryable: false,
            },
            409
          )
        ).setPresentation("workspace.fields.pendingSync");
      const cached = await tx
        .select({ id: RoutineTask.id })
        .from(RoutineTask)
        .where(eq(RoutineTask.routineId, request.param.routineId));
      const currentIds = cached.map(task => task.id);
      const confirmedIds = new Set(graph.tasks.map(task => task.id));
      const removedIds = currentIds.filter(id => !confirmedIds.has(id));
      if (currentIds.length)
        await tx
          .delete(RoutineTaskDependency)
          .where(
            or(
              inArray(RoutineTaskDependency.routineTaskId, currentIds),
              inArray(RoutineTaskDependency.previousRoutineTaskId, currentIds)
            )
          );
      if (removedIds.length) {
        await tx
          .delete(RoutinesToTasks)
          .where(inArray(RoutinesToTasks.taskId, removedIds));
        await tx.delete(RoutineTask).where(inArray(RoutineTask.id, removedIds));
      }
      if (graph.tasks.length)
        await tx
          .insert(RoutineTask)
          .values(graph.tasks)
          .onConflictDoUpdate({
            target: RoutineTask.id,
            set: {
              kind: sql`excluded.kind`,
              title: sql`excluded.title`,
              payload: sql`excluded.payload`,
              priority: sql`excluded.priority`,
              maxAttempts: sql`excluded.max_attempts`,
              x: sql`excluded.x`,
              y: sql`excluded.y`,
              previousRoutineTaskIds: sql`excluded.previous_routine_task_ids`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      if (graph.dependencies.length)
        await tx.insert(RoutineTaskDependency).values(graph.dependencies);
      await tx
        .delete(RoutinesToTasks)
        .where(eq(RoutinesToTasks.routineId, request.param.routineId));
      const actionLinks = graph.tasks
        .filter(task => task.kind === "Action")
        .map(task => ({
          routineId: request.param.routineId,
          taskId: task.id,
          createdAt: task.createdAt,
        }));
      if (actionLinks.length)
        await tx.insert(RoutinesToTasks).values(actionLinks);
      await tx
        .update(Routine)
        .set({
          definitionVersion: graph.definitionVersion,
          updatedAt: graph.updatedAt,
        })
        .where(eq(Routine.id, request.param.routineId));
      await tx
        .delete(RoutineTaskDependencyGraphDraft)
        .where(
          eq(RoutineTaskDependencyGraphDraft.routineId, request.param.routineId)
        );
    });
  };

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
