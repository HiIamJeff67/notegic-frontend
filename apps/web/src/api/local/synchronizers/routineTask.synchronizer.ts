import type {
  GetAllMyRoutineTasksByRoutineIdsResponse,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdResponse,
} from "@shared/api/interfaces/routineTask.interface";
import { localDB } from "@/api/local/db";
import { RoutineTask } from "@/api/local/schemas";
import { sql } from "drizzle-orm";

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
          costUnit: response.data.costUnit,
          payload: response.data.payload,
          priority: response.data.priority,
          status: response.data.status,
          attempts: response.data.attempts,
          maxAttempts: response.data.maxAttempts,
          period: response.data.period,
          nextScheduledAt: response.data.nextScheduledAt,
          scheduledAt: response.data.scheduledAt,
          actualStartedAt: response.data.actualStartedAt,
          actualEndedAt: response.data.actualEndedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetAllMyRoutineTasksByRoutineIds = async (
    response: GetAllMyRoutineTasksByRoutineIdsResponse
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
          costUnit: routineTask.costUnit,
          payload: {},
          priority: routineTask.priority,
          status: routineTask.status,
          attempts: routineTask.attempts,
          maxAttempts: routineTask.maxAttempts,
          period: routineTask.period,
          nextScheduledAt: routineTask.nextScheduledAt,
          scheduledAt: routineTask.scheduledAt,
          actualStartedAt: routineTask.actualStartedAt,
          actualEndedAt: routineTask.actualEndedAt,
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
          costUnit: sql`excluded.cost_unit`,
          priority: sql`excluded.priority`,
          status: sql`excluded.status`,
          attempts: sql`excluded.attempts`,
          maxAttempts: sql`excluded.max_attempts`,
          period: sql`excluded.period`,
          nextScheduledAt: sql`excluded.next_scheduled_at`,
          scheduledAt: sql`excluded.scheduled_at`,
          actualStartedAt: sql`excluded.actual_started_at`,
          actualEndedAt: sql`excluded.actual_ended_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
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
          costUnit: sql`excluded.cost_unit`,
          payload: sql`excluded.payload`,
          priority: sql`excluded.priority`,
          status: sql`excluded.status`,
          attempts: sql`excluded.attempts`,
          maxAttempts: sql`excluded.max_attempts`,
          period: sql`excluded.period`,
          nextScheduledAt: sql`excluded.next_scheduled_at`,
          scheduledAt: sql`excluded.scheduled_at`,
          actualStartedAt: sql`excluded.actual_started_at`,
          actualEndedAt: sql`excluded.actual_ended_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };
}
