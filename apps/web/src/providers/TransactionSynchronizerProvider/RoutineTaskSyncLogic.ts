import {
  type CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdRequestSchema,
  type HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTaskByIdRequestSchema,
  type UpdateMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdRequestSchema,
} from "@shared/api/interfaces/routineTask.interface";
import type { InferSelectModel } from "drizzle-orm";
import { Transaction } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import type {
  PreparedSyncJobsResult,
  SyncHeader,
} from "./TransactionSynchronizerProvider";

export const prepareRoutineTaskSyncJobs = ({
  transactions,
  header,
  mutators,
  acknowledge,
}: {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  acknowledge: (
    transaction: InferSelectModel<typeof Transaction>,
    routineId: string,
    expected: number,
    confirmed: number
  ) => Promise<void>;
  mutators: {
    createRoutineTaskMutator: {
      mutateAsync: (
        request: CreateRoutineTaskByRoutineIdRequest
      ) => Promise<unknown>;
    };
    updateRoutineTaskMutator: {
      mutateAsync: (
        request: UpdateMyRoutineTaskByIdRequest
      ) => Promise<unknown>;
    };
    hardDeleteRoutineTaskMutator: {
      mutateAsync: (
        request: HardDeleteMyRoutineTaskByIdRequest
      ) => Promise<unknown>;
    };
  };
}): PreparedSyncJobsResult => {
  const parseFailedSequences = new Set<number>();
  const syncJobs: PreparedSyncJobsResult["syncJobs"] = [];
  const previousByRoutineId = new Map<string, Promise<unknown>>();
  const deferredSequences = new Set<number>();
  for (const transaction of transactions) {
    const request = { header, body: transaction.body };
    const create =
      transaction.actionType === TransactionActionType.CREATE
        ? CreateRoutineTaskByRoutineIdRequestSchema.safeParse(request)
        : null;
    const update =
      transaction.actionType === TransactionActionType.UPDATE
        ? UpdateMyRoutineTaskByIdRequestSchema.safeParse(request)
        : null;
    const remove =
      transaction.actionType === TransactionActionType.HARD_DELETE
        ? HardDeleteMyRoutineTaskByIdRequestSchema.safeParse(request)
        : null;
    if (!create?.success && !update?.success && !remove?.success) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }
    const expected = create?.success
      ? create.data.body.expectedDefinitionVersion
      : update?.success
        ? update.data.body.expectedDefinitionVersion
        : remove?.data?.body.expectedDefinitionVersion;
    if (expected === undefined) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }
    const affected = transaction.affected as {
      routineId?: string;
      kind?: string;
    } | null;
    const routineId = create?.success
      ? create.data.body.routineId
      : affected?.routineId;
    if (!routineId) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    syncJobs.push({
      sequences: new Set([transaction.sequence]),
      run: () => {
        const previous =
          previousByRoutineId.get(routineId) ?? Promise.resolve();
        const ready = previous.catch(error => {
          deferredSequences.add(transaction.sequence);
          throw error;
        });
        const currentOperation = ready.then(async () => {
          const body = create?.success
            ? create.data.body
            : update?.success
              ? update.data.body
              : remove!.data!.body;
          body.expectedDefinitionVersion = (
            transaction.body as { expectedDefinitionVersion?: number }
          ).expectedDefinitionVersion;
          let result: unknown;
          if (create?.success)
            result = await mutators.createRoutineTaskMutator.mutateAsync(
              create.data
            );
          else if (update?.success)
            result = await mutators.updateRoutineTaskMutator.mutateAsync(
              update.data
            );
          else if (remove?.success)
            result = await mutators.hardDeleteRoutineTaskMutator.mutateAsync(
              remove.data
            );
          if (
            typeof result === "object" &&
            result !== null &&
            "success" in result &&
            result.success === false
          )
            throw new Error("Node synchronization failed");
          const confirmed = (
            result as { data?: { definitionVersion?: number } }
          )?.data?.definitionVersion;
          const expected = body.expectedDefinitionVersion;
          if (
            expected === undefined ||
            !Number.isSafeInteger(confirmed) ||
            confirmed! < expected ||
            confirmed! > expected + 1
          )
            throw new Error(
              "Missing or inconsistent acknowledged definition version"
            );
          await acknowledge(transaction, routineId, expected, confirmed!);
          return result;
        });
        previousByRoutineId.set(routineId, currentOperation);
        return currentOperation;
      },
    });
  }
  return {
    syncJobs,
    noopSequences: new Set(),
    parseFailedSequences,
    deferredSequences,
  };
};
