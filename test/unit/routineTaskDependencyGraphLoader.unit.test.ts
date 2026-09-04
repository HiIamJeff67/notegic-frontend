import type { UUID } from "crypto";

const mockGetClientRequestHeaders = jest.fn();
const mockGetMyRoutineTasksByRoutineId = jest.fn();
const mockGetRoutineTaskDependenciesByRoutineId = jest.fn();
const mockSyncGetMyRoutineTasksByRoutineId = jest.fn();
const mockSyncGetRoutineTaskDependenciesByRoutineId = jest.fn();

jest.mock("@/api/clientHeaders", () => ({
  getClientRequestHeaders: mockGetClientRequestHeaders,
}));

jest.mock("@/api/invokers/routineTask.invoker", () => ({
  queryFnGetMyRoutineTasksByRoutineId: mockGetMyRoutineTasksByRoutineId,
}));

jest.mock("@/api/invokers/routineTaskDependency.invoker", () => ({
  queryFnGetRoutineTaskDependenciesByRoutineId:
    mockGetRoutineTaskDependenciesByRoutineId,
}));

jest.mock("@/api/local/synchronizers/routineTask.synchronizer", () => ({
  RoutineTaskLocalSynchronizer: {
    syncGetMyRoutineTasksByRoutineId: mockSyncGetMyRoutineTasksByRoutineId,
  },
}));

jest.mock(
  "@/api/local/synchronizers/routineTaskDependency.synchronizer",
  () => ({
    RoutineTaskDependencyLocalSynchronizer: {
      syncGetRoutineTaskDependenciesByRoutineId:
        mockSyncGetRoutineTaskDependenciesByRoutineId,
    },
  })
);

import { queryKeys } from "@shared/api/queryKeys";
import { prefetchRoutineTaskDependencyGraph } from "@/api/prefetches/routineTaskDependencyGraph.prefetch";

describe("RoutineTask dependency graph route prefetch", () => {
  beforeEach(() => {
    mockGetClientRequestHeaders.mockReset();
    mockGetMyRoutineTasksByRoutineId.mockReset();
    mockGetRoutineTaskDependenciesByRoutineId.mockReset();
    mockSyncGetMyRoutineTasksByRoutineId.mockReset();
    mockSyncGetRoutineTaskDependenciesByRoutineId.mockReset();

    mockGetClientRequestHeaders.mockReturnValue({ userAgent: "test" });
    mockGetMyRoutineTasksByRoutineId.mockResolvedValue({
      data: [],
      embedded: { publicId: "user-public-id" },
    });
    mockGetRoutineTaskDependenciesByRoutineId.mockResolvedValue({ data: [] });
  });

  test("prefetches tasks and dependencies and synchronizes both responses", async () => {
    const routineId = "11111111-1111-4111-8111-111111111111" as UUID;
    const prefetchQuery = jest.fn(
      async ({ queryFn }: { queryFn: () => Promise<unknown> }) => queryFn()
    );

    await prefetchRoutineTaskDependencyGraph(routineId, {
      prefetchQuery,
    } as never);

    const header = { userAgent: "test" };
    expect(prefetchQuery).toHaveBeenCalledTimes(2);
    expect(
      prefetchQuery.mock.calls.map(([options]) => options.queryKey)
    ).toEqual([
      queryKeys.routineTask.manyByRoutineId(routineId),
      queryKeys.routineTaskDependency.byRoutineId(routineId),
    ]);
    expect(mockGetMyRoutineTasksByRoutineId).toHaveBeenCalledWith({
      header,
      param: { routineId },
    });
    expect(mockGetRoutineTaskDependenciesByRoutineId).toHaveBeenCalledWith({
      header,
      param: { routineId },
    });
    expect(mockSyncGetMyRoutineTasksByRoutineId).toHaveBeenCalledWith({
      data: [],
      embedded: { publicId: "user-public-id" },
    });
    expect(mockSyncGetRoutineTaskDependenciesByRoutineId).toHaveBeenCalledWith(
      {
        header,
        param: { routineId },
      },
      { data: [] }
    );
  });
});
