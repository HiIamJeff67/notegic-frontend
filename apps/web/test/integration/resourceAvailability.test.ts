import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { queryKeys } from "@shared/api/queryKeys";
import {
  useHardDeleteMyBlockPacksByIds,
  useDeleteMyBlockPackById,
  useDeleteMyBlockPacksByIds,
  useGetMyBlockPackById,
} from "@/api/hooks/blockPack.hook";
import {
  useHardDeleteMyMaterialsByIds,
  useDeleteMyMaterialById,
  useDeleteMyMaterialsByIds,
  useGetMyMaterialAndItsParentById,
} from "@/api/hooks/material.hook";
import {
  useHardDeleteMyRoutineById,
  useHardDeleteMyRoutinesByIds,
  useDeleteMyRoutineById,
  useDeleteMyRoutinesByIds,
  useGetMyRoutineById,
} from "@/api/hooks/routine.hook";
import {
  useHardDeleteMyRoutineTasksByIds,
  useHardDeleteMyRoutineTaskById,
  useGetMyRoutineTaskById,
} from "@/api/hooks/routineTask.hook";
import * as blockPackInvoker from "@/api/invokers/blockPack.invoker";
import * as materialInvoker from "@/api/invokers/material.invoker";
import * as routineInvoker from "@/api/invokers/routine.invoker";
import * as taskInvoker from "@/api/invokers/routineTask.invoker";
import { BlockPackLocalSimulator } from "@/api/local/simulators/blockPack.simulator";
import { MaterialLocalSimulator } from "@/api/local/simulators/material.simulator";
import { RoutineLocalSimulator } from "@/api/local/simulators/routine.simulator";
import { RoutineTaskLocalSimulator } from "@/api/local/simulators/routineTask.simulator";

jest.mock("@/api/functions/material.clientFn", () => ({
  SaveMyMaterialById: jest.fn(),
}));
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const { QueryClient } = jest.requireActual<
  typeof import("@tanstack/react-query")
>("@tanstack/react-query");
const mockClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity } },
});
jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => {
    mockUseMutation(options);
    return {};
  },
  useQuery: (options: unknown) => {
    mockUseQuery(options);
    return {};
  },
}));
jest.mock("@shared/api/queryClient", () => ({
  getQueryClient: () => mockClient,
}));
jest.mock("@/api/availability", () => ({ isRemoteUnavailable: () => false }));
jest.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({
    cache: { modify: jest.fn(), gc: jest.fn(), evict: jest.fn() },
  }),
}));
jest.mock("@/api/invokers/blockPack.invoker", () => ({
  queryFnGetMyBlockPackById: jest.fn(),
}));
jest.mock("@/api/invokers/material.invoker", () => ({
  queryFnGetMyMaterialAndItsParentById: jest.fn(),
}));
jest.mock("@/api/invokers/routine.invoker", () => ({
  queryFnGetMyRoutineById: jest.fn(),
}));
jest.mock("@/api/invokers/routineTask.invoker", () => ({
  queryFnGetMyRoutineTaskById: jest.fn(),
}));
jest.mock("@/api/local/simulators/blockPack.simulator", () => ({
  BlockPackLocalSimulator: { simulateGetMyBlockPackById: jest.fn() },
}));
jest.mock("@/api/local/simulators/material.simulator", () => ({
  MaterialLocalSimulator: { simulateGetMyMaterialAndItsParentById: jest.fn() },
}));
jest.mock("@/api/local/simulators/routine.simulator", () => ({
  RoutineLocalSimulator: { simulateGetMyRoutineById: jest.fn() },
}));
jest.mock("@/api/local/simulators/routineTask.simulator", () => ({
  RoutineTaskLocalSimulator: { simulateGetMyRoutineTaskById: jest.fn() },
}));
jest.mock("@/api/local/synchronizers/blockPack.synchronizer", () => ({
  BlockPackLocalSynchronizer: { syncHardDeleteMyBlockPacksByIds: jest.fn() },
}));
jest.mock("@/api/local/synchronizers/material.synchronizer", () => ({
  MaterialLocalSynchronizer: { syncHardDeleteMyMaterialsByIds: jest.fn() },
}));
jest.mock("@/api/local/synchronizers/routine.synchronizer", () => ({
  RoutineLocalSynchronizer: {},
}));
jest.mock("@/api/local/synchronizers/routineTask.synchronizer", () => ({
  RoutineTaskLocalSynchronizer: { syncHardDeleteMyRoutineTaskById: jest.fn() },
}));

const id = "12345678-1234-4234-8234-123456789abc";
const error = (status: number, reason = "NotFound") =>
  new NotegicAPIError(
    new NotegicException({
      code: status,
      prefix: "Fixture",
      status,
      reason,
      message: reason,
    })
  );
const fixtures = [
  {
    name: "BlockPack",
    hook: () => useGetMyBlockPackById({ param: { blockPackId: id } }),
    invoke: blockPackInvoker.queryFnGetMyBlockPackById,
    local: BlockPackLocalSimulator.simulateGetMyBlockPackById,
  },
  {
    name: "Material",
    hook: () => useGetMyMaterialAndItsParentById({ param: { materialId: id } }),
    invoke: materialInvoker.queryFnGetMyMaterialAndItsParentById,
    local: MaterialLocalSimulator.simulateGetMyMaterialAndItsParentById,
  },
  {
    name: "Routine",
    hook: () => useGetMyRoutineById({ param: { routineId: id } }),
    invoke: routineInvoker.queryFnGetMyRoutineById,
    local: RoutineLocalSimulator.simulateGetMyRoutineById,
  },
  {
    name: "RoutineTask",
    hook: () => useGetMyRoutineTaskById({ param: { routineTaskId: id } }),
    invoke: taskInvoker.queryFnGetMyRoutineTaskById,
    local: RoutineTaskLocalSimulator.simulateGetMyRoutineTaskById,
  },
];
beforeEach(() => {
  jest.clearAllMocks();
  mockClient.clear();
});
afterAll(() => mockClient.clear());
describe.each(fixtures)("$name availability", ({ hook, invoke, local }) => {
  test.each([
    403, 404, 410,
  ])("authoritative HTTP %i never falls back to stale local data", async status => {
    jest
      .mocked(invoke)
      .mockRejectedValue(error(status, status === 404 ? "NotFound" : "Denied"));
    jest.mocked(local).mockResolvedValue({ id } as never);
    hook();
    await expect(
      mockUseQuery.mock.calls
        .at(-1)![0]
        .queryFn({ signal: new AbortController().signal })
    ).resolves.toMatchObject({ success: false, data: null });
    expect(local).not.toHaveBeenCalled();
  });
  test("missing network retains locally available work", async () => {
    jest
      .mocked(invoke)
      .mockRejectedValue(
        new NotegicFetchError(FetchClientExceptions.MissingNetwork())
      );
    jest.mocked(local).mockResolvedValue({ id } as never);
    hook();
    await expect(
      mockUseQuery.mock.calls
        .at(-1)![0]
        .queryFn({ signal: new AbortController().signal })
    ).resolves.toMatchObject({ success: true, data: { id } });
    expect(local).toHaveBeenCalledTimes(1);
  });
  test("an internal server failure remains an error rather than Not Found", async () => {
    const failure = error(500, "InternalServerError");
    jest.mocked(invoke).mockRejectedValue(failure);
    hook();
    await expect(
      mockUseQuery.mock.calls
        .at(-1)![0]
        .queryFn({ signal: new AbortController().signal })
    ).rejects.toBe(failure);
    expect(local).not.toHaveBeenCalled();
  });
  test("a cancelled read never persists its late remote response", async () => {
    const controller = new AbortController();
    let release!: (response: unknown) => void;
    jest.mocked(invoke).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          release = resolve;
        }) as never
    );
    hook();
    const read = mockUseQuery.mock.calls
      .at(-1)![0]
      .queryFn({ signal: controller.signal });
    controller.abort();
    release({ success: true, data: { id } });
    await expect(read).rejects.toMatchObject({ name: "AbortError" });
    expect(local).not.toHaveBeenCalled();
  });
});

test.each([
  {
    name: "BlockPack hard delete",
    hook: useHardDeleteMyBlockPacksByIds,
    key: queryKeys.blockPack.oneById(id),
    body: { blockPackIds: [id] },
    affected: {},
  },
  {
    name: "Material hard delete",
    hook: useHardDeleteMyMaterialsByIds,
    key: queryKeys.material.oneById(id, true),
    body: { materialIds: [id] },
    affected: {},
  },
  {
    name: "Routine hard delete",
    hook: useHardDeleteMyRoutineById,
    key: queryKeys.routine.oneById(id),
    body: { routineId: id },
    affected: {},
  },
  {
    name: "Routine bulk hard delete",
    hook: useHardDeleteMyRoutinesByIds,
    key: queryKeys.routine.oneById(id),
    body: { routineIds: [id] },
    affected: {},
  },
  {
    name: "RoutineTask bulk",
    hook: useHardDeleteMyRoutineTasksByIds,
    key: queryKeys.routineTask.oneById(id),
    body: { routineTaskIds: [id] },
    affected: {},
  },

  {
    name: "BlockPack single",
    hook: useDeleteMyBlockPackById,
    key: queryKeys.blockPack.oneById(id),
    body: { blockPackId: id },
    affected: { rootShelfId: id, parentSubShelfId: id },
  },
  {
    name: "BlockPack bulk",
    hook: useDeleteMyBlockPacksByIds,
    key: queryKeys.blockPack.oneById(id),
    body: { blockPackIds: [id] },
    affected: { rootShelfIds: [id], parentSubShelfIds: [id] },
  },
  {
    name: "Material single",
    hook: useDeleteMyMaterialById,
    key: queryKeys.material.oneById(id, true),
    body: { materialId: id },
    affected: { rootShelfId: id, parentSubShelfId: id },
  },
  {
    name: "Material bulk",
    hook: useDeleteMyMaterialsByIds,
    key: queryKeys.material.oneById(id, true),
    body: { materialIds: [id] },
    affected: { rootShelfIds: [id], parentSubShelfIds: [id] },
  },
  {
    name: "Routine single",
    hook: useDeleteMyRoutineById,
    key: queryKeys.routine.oneById(id),
    body: { routineId: id },
    affected: {},
  },
  {
    name: "Routine bulk",
    hook: useDeleteMyRoutinesByIds,
    key: queryKeys.routine.oneById(id),
    body: { routineIds: [id] },
    affected: {},
  },
  {
    name: "RoutineTask",
    hook: useHardDeleteMyRoutineTaskById,
    key: queryKeys.routineTask.oneById(id),
    body: { routineTaskId: id },
    affected: {},
  },
])("$name confirmation clears open details; failed deletion does not", async ({
  hook,
  key,
  body,
  affected,
}) => {
  const cached = { success: true, data: { id } };
  mockClient.setQueryData(key, cached);
  hook();
  const { onSuccess } = mockUseMutation.mock.calls.at(-1)![0];
  await onSuccess({ success: false }, { body, affected });
  expect(mockClient.getQueryData(key)).toEqual(cached);
  // The offline simulator already persisted its tombstone before this acknowledgement.
  await onSuccess(
    {
      success: true,
      data: { deletedAt: new Date() },
      embedded: { publicId: "" },
    },
    { body, affected }
  );
  expect(mockClient.getQueryData(key)).toMatchObject({ data: null });
});
