import type { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import type {
  CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdResponse,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTasksByRoutineIdResponse,
  GetMyRoutineTasksByRoutineIdsResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdResponse,
} from "@shared/api/interfaces/routineTask.interface";
import { parseRoutineTaskDefinition } from "@shared/api/interfaces/routineTask.interface";
import { and, eq, gte, lt, type InferSelectModel, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutinesToTasks,
  RoutineTask,
  RoutineTaskDependency,
  RoutineTaskDependencyGraphDraft,
  Transaction,
} from "@/api/local/schemas";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { RoutineTaskLocalSimulator } from "@/api/local/simulators/routineTask.simulator";

export class RoutineTaskLocalSynchronizer {
  static acknowledgeMutation = async (
    acknowledged: InferSelectModel<typeof Transaction>,
    routineId: string,
    expected: number,
    confirmed: number
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return localDB.transaction(async tx => {
      const pending = await tx
        .select()
        .from(Transaction)
        .where(
          and(
            eq(Transaction.ownerPublicId, acknowledged.ownerPublicId),
            eq(Transaction.entityType, TransactionEntityType.RoutineTask),
            gte(Transaction.sequence, acknowledged.sequence)
          )
        );
      const advanced: Array<{ sequence: number; body: unknown }> = [];
      for (const successor of pending) {
        if (successor.sequence === acknowledged.sequence) continue;
        const body = successor.body as {
          routineId?: string;
          expectedDefinitionVersion?: number;
        };
        const affected = successor.affected as { routineId?: string } | null;
        if (
          (body.routineId ?? affected?.routineId) !== routineId ||
          body.expectedDefinitionVersion !== expected
        )
          continue;
        const nextBody = { ...body, expectedDefinitionVersion: confirmed };
        advanced.push({ sequence: successor.sequence, body: nextBody });
        await tx
          .update(Transaction)
          .set({ body: nextBody })
          .where(eq(Transaction.sequence, successor.sequence));
      }
      const [draft] = await tx
        .select()
        .from(RoutineTaskDependencyGraphDraft)
        .where(eq(RoutineTaskDependencyGraphDraft.routineId, routineId));
      if (draft) {
        const edges = JSON.parse(draft.edges) as Array<{
          expectedDefinitionVersion?: number;
          syncStatus?: string;
        }>;
        for (const edge of edges) {
          if (
            edge.syncStatus === "pending" &&
            edge.expectedDefinitionVersion === expected
          )
            edge.expectedDefinitionVersion = confirmed;
        }
        await tx
          .update(RoutineTaskDependencyGraphDraft)
          .set({ edges: JSON.stringify(edges) })
          .where(eq(RoutineTaskDependencyGraphDraft.routineId, routineId));
      }
      await tx
        .update(Routine)
        .set({ definitionVersion: confirmed })
        .where(
          and(
            eq(Routine.id, routineId),
            eq(Routine.definitionVersion, expected)
          )
        );
      await tx
        .delete(Transaction)
        .where(eq(Transaction.sequence, acknowledged.sequence));
      return advanced;
    });
  };

  static syncUpdateMyRoutineTaskById = async (
    request: UpdateMyRoutineTaskByIdRequest,
    response: UpdateMyRoutineTaskByIdResponse
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const pending = await RoutineTaskLocalSimulator.getPendingMutations();
    if (
      pending.some(
        transaction =>
          (transaction.body as { routineTaskId?: string }).routineTaskId ===
          request.body.routineTaskId
      )
    )
      return;
    const [existing] = await localDB
      .select()
      .from(RoutineTask)
      .where(eq(RoutineTask.id, request.body.routineTaskId));
    if (!existing) return;
    const definition = parseRoutineTaskDefinition({
      ...existing,
      ...request.body.values,
      purpose:
        existing.kind === "Start"
          ? request.body.values.purpose
          : ((request.body.values.purpose ??
              request.body.values.payload?.purpose ??
              (existing.payload as Record<string, unknown>)
                ?.purpose) as RoutineTaskPurpose),
    });
    await localDB
      .update(RoutineTask)
      .set({
        ...request.body.values,
        payload: definition.payload,
        updatedAt: response.data.updatedAt,
      })
      .where(eq(RoutineTask.id, request.body.routineTaskId));
    if (response.data.definitionVersion !== undefined)
      await localDB
        .update(Routine)
        .set({ definitionVersion: response.data.definitionVersion })
        .where(
          and(
            eq(Routine.id, existing.routineId),
            lt(Routine.definitionVersion, response.data.definitionVersion)
          )
        );
  };

  static syncHardDeleteMyRoutineTaskById = async (
    request: HardDeleteMyRoutineTaskByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const id = request.body.routineTaskId;
      await tx
        .delete(RoutineTaskDependency)
        .where(
          sql`${RoutineTaskDependency.routineTaskId} = ${id} OR ${RoutineTaskDependency.previousRoutineTaskId} = ${id}`
        );
      await tx.delete(RoutinesToTasks).where(eq(RoutinesToTasks.taskId, id));
      await tx.delete(RoutineTask).where(eq(RoutineTask.id, id));
    });
  };

  static syncCreateRoutineTaskByRoutineId = async (
    request: CreateRoutineTaskByRoutineIdRequest,
    response: CreateRoutineTaskByRoutineIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const definition = parseRoutineTaskDefinition(request.body);
    const pending = await RoutineTaskLocalSimulator.getPendingMutations();
    if (
      pending.some(transaction => {
        const body = transaction.body as {
          id?: string;
          routineTaskId?: string;
        };
        return (body.id ?? body.routineTaskId) === response.data.id;
      })
    )
      return;

    await localDB.transaction(async tx => {
      if (response.data.definitionVersion !== undefined)
        await tx
          .update(Routine)
          .set({ definitionVersion: response.data.definitionVersion })
          .where(
            and(
              eq(Routine.id, request.body.routineId),
              lt(Routine.definitionVersion, response.data.definitionVersion)
            )
          );
      await tx
        .insert(RoutineTask)
        .values({
          id: response.data.id,
          routineId: request.body.routineId,
          kind: request.body.kind ?? "Action",
          x: request.body.x ?? 0,
          y: request.body.y ?? 0,
          title: request.body.title,
          payload: definition.payload,
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
            kind: request.body.kind ?? "Action",
            x: request.body.x ?? 0,
            y: request.body.y ?? 0,
            title: request.body.title,
            payload: definition.payload,
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
      if (request.body.kind === "Start") return;
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

    const pending = await RoutineTaskLocalSimulator.getPendingMutations();
    if (
      pending.some(transaction => {
        const body = transaction.body as {
          id?: string;
          routineTaskId?: string;
        };
        return (body.id ?? body.routineTaskId) === response.data.id;
      })
    )
      return;
    await localDB
      .insert(RoutineTask)
      .values(response.data)
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          routineId: response.data.routineId,
          kind: response.data.kind,
          x: response.data.x,
          y: response.data.y,
          title: response.data.title,
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
    const pending = await RoutineTaskLocalSimulator.getPendingMutations();
    const pendingIds = new Set(
      pending.map(transaction => {
        const body = transaction.body as {
          id?: string;
          routineTaskId?: string;
        };
        return body.id ?? body.routineTaskId;
      })
    );
    const incoming = response.data.filter(task => !pendingIds.has(task.id));
    if (incoming.length === 0) return;
    await localDB
      .insert(RoutineTask)
      .values(
        incoming.map(routineTask => ({
          id: routineTask.id,
          routineId: routineTask.routineId,
          kind: routineTask.kind,
          x: routineTask.x,
          y: routineTask.y,
          title: routineTask.title,
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
          kind: sql`excluded.kind`,
          x: sql`excluded.x`,
          y: sql`excluded.y`,
          title: sql`excluded.title`,
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
    await RoutineTaskLocalSynchronizer.syncGetMyRoutineTasksByRoutineIds(
      response
    );
  };
}
