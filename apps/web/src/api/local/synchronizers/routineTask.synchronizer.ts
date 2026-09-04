import type {
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTasksByRoutineIdResponse,
  GetMyRoutineTasksByRoutineIdsResponse,
} from "@shared/api/interfaces/routineTask.interface";
import { sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { RoutineTask } from "@/api/local/schemas";

export class RoutineTaskLocalSynchronizer {
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
          phase: response.data.phase,
          costUnit: response.data.costUnit,
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
          phase: routineTask.phase,
          costUnit: routineTask.costUnit,
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
          phase: sql`excluded.phase`,
          costUnit: sql`excluded.cost_unit`,
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
          phase: sql`excluded.phase`,
          costUnit: sql`excluded.cost_unit`,
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
