import type {
  CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdResponse,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTasksByRoutineIdResponse,
  GetMyRoutineTasksByRoutineIdsResponse,
} from "@shared/api/interfaces/routineTask.interface";
import { and, eq, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { RoutinesToTasks, RoutineTask } from "@/api/local/schemas";

export class RoutineTaskLocalSynchronizer {
  static syncCreateRoutineTaskByRoutineId = async (
    request: CreateRoutineTaskByRoutineIdRequest,
    response: CreateRoutineTaskByRoutineIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(RoutineTask)
        .values({
          id: response.data.id,
          routineId: request.body.routineId,
          title: request.body.title,
          purpose: request.body.purpose,
          payload: request.body.payload,
          priority: request.body.priority ?? 0,
          maxAttempts: request.body.maxAttempts ?? 1,
          previousRoutineTaskIds: [],
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: RoutineTask.id,
          set: {
            routineId: request.body.routineId,
            title: request.body.title,
            purpose: request.body.purpose,
            payload: request.body.payload,
            priority: request.body.priority ?? 0,
            maxAttempts: request.body.maxAttempts ?? 1,
            previousRoutineTaskIds: [],
            updatedAt: response.data.createdAt,
          },
        });
      await tx
        .delete(RoutinesToTasks)
        .where(
          and(
            eq(RoutinesToTasks.routineId, request.body.routineId),
            eq(RoutinesToTasks.taskId, response.data.id)
          )
        );
      await tx.insert(RoutinesToTasks).values({
        routineId: request.body.routineId,
        taskId: response.data.id,
        createdAt: response.data.createdAt,
      });
    });
  };

  static syncGetMyRoutineTaskById = async (
    response: GetMyRoutineTaskByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(RoutineTask)
      .values(response.data)
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          routineId: response.data.routineId,
          title: response.data.title,
          purpose: response.data.purpose,
          payload: response.data.payload,
          priority: response.data.priority,
          maxAttempts: response.data.maxAttempts,
          previousRoutineTaskIds: response.data.previousRoutineTaskIds,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetMyRoutineTasksByRoutineIds = async (
    response: GetMyRoutineTasksByRoutineIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB
      .insert(RoutineTask)
      .values(
        response.data.map(routineTask => ({
          id: routineTask.id,
          routineId: routineTask.routineId,
          title: routineTask.title,
          purpose: routineTask.purpose,
          payload: routineTask.payload,
          priority: routineTask.priority,
          maxAttempts: routineTask.maxAttempts,
          previousRoutineTaskIds: routineTask.previousRoutineTaskIds,
          updatedAt: routineTask.updatedAt,
          createdAt: routineTask.createdAt,
        }))
      )
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          routineId: sql`excluded.routine_id`,
          title: sql`excluded.title`,
          purpose: sql`excluded.purpose`,
          payload: sql`excluded.payload`,
          priority: sql`excluded.priority`,
          maxAttempts: sql`excluded.max_attempts`,
          previousRoutineTaskIds: sql`excluded.previous_routine_task_ids`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetMyRoutineTasksByRoutineId = async (
    response: GetMyRoutineTasksByRoutineIdResponse
  ): Promise<void> => {
    await RoutineTaskLocalSynchronizer.syncGetMyRoutineTasksByRoutineIds(
      response
    );
  };

  static syncGetAllMyRoutineTasks = async (
    response: GetAllMyRoutineTasksResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB
      .insert(RoutineTask)
      .values(response.data)
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          routineId: sql`excluded.routine_id`,
          title: sql`excluded.title`,
          purpose: sql`excluded.purpose`,
          payload: sql`excluded.payload`,
          priority: sql`excluded.priority`,
          maxAttempts: sql`excluded.max_attempts`,
          previousRoutineTaskIds: sql`excluded.previous_routine_task_ids`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };
}
