import type { InferSelectModel } from "drizzle-orm";
import type { Transaction } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { prepareRoutineTaskSyncJobs } from "./RoutineTaskSyncLogic";

const routineId = "12345678-1234-4234-8234-123456789abc";
const taskId = "22345678-1234-4234-8234-123456789abc";
const transaction = (
  sequence: number,
  actionType: TransactionActionType,
  body: unknown,
  parentId = routineId
): InferSelectModel<typeof Transaction> => ({
  sequence,
  actionType,
  body,
  entityType: TransactionEntityType.RoutineTask,
  ownerPublicId: "user",
  affected: { routineId: parentId, kind: "Start" },
  retryCount: 0,
  lastError: null,
  createdAt: new Date(0),
});
const createBody = {
  id: taskId,
  routineId,
  kind: "Start",
  title: "Daily",
  payload: { schemaVersion: 1, isActive: true },
  expectedDefinitionVersion: 7,
};
const prepare = (
  transactions: InferSelectModel<typeof Transaction>[],
  failUpdate = false
) => {
  const seen: number[] = [];
  const mutators = {
    createRoutineTaskMutator: {
      mutateAsync: jest.fn(async (request: any) => {
        seen.push(request.body.expectedDefinitionVersion);
        return {
          success: true,
          data: {
            definitionVersion: request.body.expectedDefinitionVersion + 1,
          },
        };
      }),
    },
    updateRoutineTaskMutator: {
      mutateAsync: jest.fn(async (request: any) => {
        seen.push(request.body.expectedDefinitionVersion);
        if (failUpdate) throw new Error("Network unavailable");
        return {
          success: true,
          data: { definitionVersion: request.body.expectedDefinitionVersion },
        };
      }),
    },
    hardDeleteRoutineTaskMutator: {
      mutateAsync: jest.fn(async (request: any) => {
        seen.push(request.body.expectedDefinitionVersion);
        return {
          success: true,
          data: {
            definitionVersion: request.body.expectedDefinitionVersion + 1,
          },
        };
      }),
    },
  };
  const acknowledge = jest.fn(
    async (acknowledged, parent, expected, confirmed) => {
      for (const pending of transactions) {
        const body = pending.body as Record<string, unknown>;
        const affected = pending.affected as { routineId: string };
        if (
          pending.sequence > acknowledged.sequence &&
          affected.routineId === parent &&
          body.expectedDefinitionVersion === expected
        )
          pending.body = { ...body, expectedDefinitionVersion: confirmed };
      }
    }
  );
  return {
    result: prepareRoutineTaskSyncJobs({
      header: { userAgent: "test" },
      transactions,
      mutators,
      acknowledge,
    }),
    mutators,
    acknowledge,
    seen,
  };
};

describe("RoutineTask synchronization", () => {
  it("uses acknowledged versions, including definition-neutral edits", async () => {
    const { result, seen } = prepare([
      transaction(1, TransactionActionType.CREATE, createBody),
      transaction(2, TransactionActionType.UPDATE, {
        routineTaskId: taskId,
        values: { x: 42 },
        expectedDefinitionVersion: 7,
      }),
      transaction(3, TransactionActionType.HARD_DELETE, {
        routineTaskId: taskId,
        expectedDefinitionVersion: 7,
      }),
    ]);
    await Promise.all(result.syncJobs.map(job => job.run()));
    expect(seen).toEqual([7, 8, 8]);
  });

  it("retains the advanced version across partial failure and reconstruction", async () => {
    const pending = [
      transaction(1, TransactionActionType.CREATE, createBody),
      transaction(2, TransactionActionType.UPDATE, {
        routineTaskId: taskId,
        values: { x: 42 },
        expectedDefinitionVersion: 7,
      }),
    ];
    const first = prepare(pending, true);
    const settled = await Promise.allSettled(
      first.result.syncJobs.map(job => job.run())
    );
    expect(settled.map(result => result.status)).toEqual([
      "fulfilled",
      "rejected",
    ]);
    expect((pending[1].body as any).expectedDefinitionVersion).toBe(8);
    const reloaded = JSON.parse(JSON.stringify(pending.slice(1)));
    const retry = prepare(reloaded);
    await Promise.all(retry.result.syncJobs.map(job => job.run()));
    expect(retry.seen).toEqual([8]);
  });

  it("defers successors without preventing independent routines from synchronizing", async () => {
    const other = "32345678-1234-4234-8234-123456789abc";
    const { result, mutators } = prepare(
      [
        transaction(1, TransactionActionType.UPDATE, {
          routineTaskId: taskId,
          values: { x: 42 },
          expectedDefinitionVersion: 7,
        }),
        transaction(2, TransactionActionType.HARD_DELETE, {
          routineTaskId: taskId,
          expectedDefinitionVersion: 7,
        }),
        transaction(
          3,
          TransactionActionType.CREATE,
          { ...createBody, routineId: other },
          other
        ),
      ],
      true
    );
    const settled = await Promise.allSettled(
      result.syncJobs.map(job => job.run())
    );
    expect(settled.map(result => result.status)).toEqual([
      "rejected",
      "rejected",
      "fulfilled",
    ]);
    expect(
      mutators.hardDeleteRoutineTaskMutator.mutateAsync
    ).not.toHaveBeenCalled();
    expect(result.deferredSequences).toEqual(new Set([2]));
  });

  it("does not guess a version or acknowledge an offline fallback", async () => {
    const { result, mutators, acknowledge } = prepare([
      transaction(1, TransactionActionType.CREATE, createBody),
    ]);
    mutators.createRoutineTaskMutator.mutateAsync.mockResolvedValueOnce({
      success: false,
      data: { definitionVersion: 8 },
    });
    await expect(result.syncJobs[0].run()).rejects.toThrow();
    expect(acknowledge).not.toHaveBeenCalled();
  });

  it("does not overwrite a successor's different conflict boundary", async () => {
    const { result, seen } = prepare([
      transaction(1, TransactionActionType.CREATE, createBody),
      transaction(2, TransactionActionType.UPDATE, {
        routineTaskId: taskId,
        values: { x: 42 },
        expectedDefinitionVersion: 10,
      }),
    ]);
    await Promise.all(result.syncJobs.map(job => job.run()));
    expect(seen).toEqual([7, 10]);
  });

  it("never sends an unversioned queued write", async () => {
    const { result, mutators } = prepare([
      transaction(1, TransactionActionType.UPDATE, {
        routineTaskId: taskId,
        values: { x: 4 },
      }),
    ]);
    expect(result.parseFailedSequences).toEqual(new Set([1]));
    expect(
      mutators.updateRoutineTaskMutator.mutateAsync
    ).not.toHaveBeenCalled();
  });

  it("retains invalid requests as parse failures", () => {
    const { result } = prepare([
      transaction(1, TransactionActionType.UPDATE, {
        routineTaskId: "invalid",
        values: {},
      }),
    ]);
    expect(result.parseFailedSequences).toEqual(new Set([1]));
    expect(result.noopSequences.size).toBe(0);
  });
});
