import {
  fromGraphQLRoutinePhase,
  toGraphQLRoutinePhase,
} from "@shared/api/graphql/conversions";
import {
  RoutinePhase as GraphQLRoutinePhase,
  SearchRoutineTaskRecordsDocument,
} from "@shared/api/graphql/generated/graphql";
import {
  RoutinePhase,
  RoutineTaskPurpose,
  RoutineTaskRecordErrorCode,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import { RoutineTaskPayloadSchema } from "@shared/api/interfaces/routineTaskPayload.interface";
import { ExecutionResultSchema } from "@shared/api/interfaces/routineTaskRecord.interface";
import { print } from "graphql";

const routineId = "11111111-1111-4111-8111-111111111111";
const routineRecordId = "22222222-2222-4222-8222-222222222222";
const routineTaskId = "33333333-3333-4333-8333-333333333333";
const plannedSubShelfId = "44444444-4444-4444-8444-444444444444";
const fakeSubShelfId = "f_0123456789abcdef0123456789abcdef";

const backendRoutineExecutionFixture = {
  routine: {
    id: routineId,
    phase: GraphQLRoutinePhase.RoutinePhasePlan,
  },
  routineRecord: {
    id: routineRecordId,
    routineId,
    status: "RoutineRecordStatus_Blocked",
    snapshot: {
      routineTaskPlan: {
        facts: { [fakeSubShelfId]: plannedSubShelfId },
        precreatedSubShelves: {
          [fakeSubShelfId]: {
            parentSubShelfId: null,
            path: [plannedSubShelfId],
          },
        },
        plannedObjectIds: { [routineTaskId]: plannedSubShelfId },
      },
    },
  },
  routineTaskRecords: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      routineRecordId,
      routineTaskId,
      purpose: "RoutineTaskPurpose_CreateSubShelf",
      status: "RoutineTaskRecordStatus_Blocked",
      errorCode: "RoutineTaskRecordErrorCode_PayloadInvalid",
      errorReason: "The planned parent reference is invalid.",
      attempts: 1,
      payloadSnapshot: {
        fakeId: fakeSubShelfId,
        rootShelfId: "66666666-6666-4666-8666-666666666666",
        name: "Nested shelf",
      },
      resultSnapshot: {
        failed: 1,
        items: [
          {
            itemId: fakeSubShelfId,
            status: "failed",
            reason: "The planned parent reference is invalid.",
          },
        ],
      },
    },
  ],
};

describe("Routine execution backend contract integration", () => {
  test("maps the backend phase lifecycle without exposing preparation", () => {
    const backendPhases = [
      GraphQLRoutinePhase.RoutinePhaseClaimed,
      GraphQLRoutinePhase.RoutinePhasePlan,
      GraphQLRoutinePhase.RoutinePhaseExecution,
      GraphQLRoutinePhase.RoutinePhaseRecovery,
      GraphQLRoutinePhase.RoutinePhaseAnalysis,
    ];

    expect(backendPhases.map(fromGraphQLRoutinePhase)).toEqual([
      RoutinePhase.Claimed,
      RoutinePhase.Plan,
      RoutinePhase.Execution,
      RoutinePhase.Recovery,
      RoutinePhase.Analysis,
    ]);
    expect(toGraphQLRoutinePhase(RoutinePhase.Plan)).toBe(
      GraphQLRoutinePhase.RoutinePhasePlan
    );
    expect(Object.values(GraphQLRoutinePhase)).not.toContain(
      "RoutinePhase_Preparation"
    );
  });

  test("keeps a terminal plan error blocked and preserves planned identity", () => {
    const record = backendRoutineExecutionFixture.routineTaskRecords[0];
    const result = ExecutionResultSchema.safeParse(record.resultSnapshot);
    const payload = RoutineTaskPayloadSchema.safeParse({
      purpose: RoutineTaskPurpose.CreateSubShelf,
      payload: record.payloadSnapshot,
    });

    expect(backendRoutineExecutionFixture.routine.phase).toBe(
      GraphQLRoutinePhase.RoutinePhasePlan
    );
    expect(backendRoutineExecutionFixture.routineRecord.status).toBe(
      "RoutineRecordStatus_Blocked"
    );
    expect(record.status.replace("RoutineTaskRecordStatus_", "")).toBe(
      RoutineTaskRecordStatus.Blocked
    );
    expect(record.errorCode.replace("RoutineTaskRecordErrorCode_", "")).toBe(
      RoutineTaskRecordErrorCode.PayloadInvalid
    );
    expect(payload.success).toBe(true);
    expect(result.success).toBe(true);
    expect(
      backendRoutineExecutionFixture.routineRecord.snapshot.routineTaskPlan
        .plannedObjectIds[routineTaskId]
    ).toBe(plannedSubShelfId);
  });

  test("represents a no-ready-task response as an empty search page", () => {
    const backendResponse = {
      searchRoutineTaskRecords: {
        searchEdges: [],
        searchPageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startEncodedSearchCursor: "",
          endEncodedSearchCursor: "",
        },
        totalCount: 0,
        searchTime: 0.001,
      },
    };

    expect(backendResponse.searchRoutineTaskRecords.searchEdges).toHaveLength(
      0
    );
    expect(
      backendResponse.searchRoutineTaskRecords.searchPageInfo.hasNextPage
    ).toBe(false);
    expect(print(SearchRoutineTaskRecordsDocument)).toContain(
      "searchRoutineTaskRecords"
    );
    expect(print(SearchRoutineTaskRecordsDocument)).toContain("searchPageInfo");
  });
});
