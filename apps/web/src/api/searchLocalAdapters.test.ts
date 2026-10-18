import { RoutineLocalSynchronizer } from "@/api/local/synchronizers/routine.synchronizer";
import { searchRoutinesLocalAdapter } from "./searchLocalAdapters";

jest.mock("@/api/local/synchronizers/routine.synchronizer", () => ({
  RoutineLocalSynchronizer: { syncSearchRoutines: jest.fn() },
}));
jest.mock("@/api/local/synchronizers/rootShelf.synchronizer", () => ({
  RootShelfLocalSynchronizer: {},
}));
jest.mock("@/api/local/synchronizers/routineTag.synchronizer", () => ({
  RoutineTagLocalSynchronizer: {},
}));
jest.mock("@/api/local/synchronizers/station.synchronizer", () => ({
  StationLocalSynchronizer: {},
}));
jest.mock("@/api/local/simulators/routine.simulator", () => ({
  RoutineLocalSimulator: { simulateSearchRoutines: jest.fn() },
}));
jest.mock("@/api/local/simulators/rootShelf.simulator", () => ({
  RootShelfLocalSimulator: {},
}));
jest.mock("@/api/local/simulators/routineTag.simulator", () => ({
  RoutineTagLocalSimulator: {},
}));
jest.mock("@/api/local/simulators/station.simulator", () => ({
  StationLocalSimulator: {},
}));

test("Routine search preserves canonical activation and definition version in the local projection", async () => {
  const node = {
    id: "routine",
    stationId: "station",
    title: "Shared routine",
    isActive: true,
    definitionVersion: 7,
    admissionState: "Eligible",
    timeoutSeconds: 60,
    isPinned: false,
    phase: null,
    period: null,
    timezone: "UTC",
    deletedAt: null,
    updatedAt: new Date(1000),
    createdAt: new Date(0),
    scheduledStartAt: new Date(2000),
    scheduledEndAt: new Date(3000),
  };
  const data = {
    searchRoutines: {
      totalCount: 1,
      searchPageInfo: {},
      searchEdges: [{ encodedSearchCursor: "cursor", node }],
    },
  };
  await searchRoutinesLocalAdapter.sync(data);
  expect(RoutineLocalSynchronizer.syncSearchRoutines).toHaveBeenCalledWith([
    expect.objectContaining({
      id: "routine",
      isActive: true,
      definitionVersion: 7,
    }),
  ]);
  const signature = searchRoutinesLocalAdapter.signature(data);
  for (const changed of [
    { isActive: false },
    { definitionVersion: 8 },
    { admissionState: "QuotaBlocked" },
  ]) {
    expect(
      searchRoutinesLocalAdapter.signature({
        searchRoutines: {
          ...data.searchRoutines,
          searchEdges: [
            { encodedSearchCursor: "cursor", node: { ...node, ...changed } },
          ],
        },
      })
    ).not.toBe(signature);
  }
});
