import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { mutationFnCreateMyMaterial } from "@/api/invokers/material.invoker";
import { MaterialLocalSimulator } from "@/api/local/simulators/material.simulator";
import { useCreateMyMaterial, useUpdateMyMaterialById } from "./material.hook";

const mockUseMutation = jest.fn(
  (options: { mutationFn: (request: unknown) => Promise<unknown> }) => options
);
jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: never) => mockUseMutation(options),
}));
jest.mock("@shared/api/queryClient", () => ({ getQueryClient: jest.fn() }));
jest.mock("@/api/invokers/material.invoker", () => ({
  mutationFnCreateMyMaterial: jest.fn(),
}));
jest.mock("@/api/functions/material.clientFn", () => ({
  SaveMyMaterialById: jest.fn(),
}));
jest.mock("@/api/local/synchronizers/material.synchronizer", () => ({
  MaterialLocalSynchronizer: {},
}));
jest.mock("@/api/local/simulators/material.simulator", () => ({
  MaterialLocalSimulator: {
    simulateCreateMyMaterial: jest.fn(),
    simulateUpdateMyMaterialById: jest.fn(),
  },
}));

const navigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator"
);
const id = "12345678-1234-4234-8234-123456789abc";
const request = {
  body: { name: "Material", parentSubShelfId: id },
  affected: { parentSubShelfId: id, rootShelfId: id },
};
const run = (request: unknown) =>
  mockUseMutation.mock.calls.at(-1)![0].mutationFn(request);
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });
});
afterEach(() => {
  if (navigatorDescriptor)
    Object.defineProperty(globalThis, "navigator", navigatorDescriptor);
  else Reflect.deleteProperty(globalThis, "navigator");
});

test("invalid offline create and rename fail before persistence or transport", async () => {
  useCreateMyMaterial();
  await expect(
    run({ ...request, body: { ...request.body, name: " " } })
  ).rejects.toBeInstanceOf(NotegicValidationError);
  useUpdateMyMaterialById();
  await expect(
    run({
      body: { materialId: id, values: { name: " " } },
      affected: request.affected,
    })
  ).rejects.toBeInstanceOf(NotegicValidationError);
  expect(
    MaterialLocalSimulator.simulateCreateMyMaterial
  ).not.toHaveBeenCalled();
  expect(
    MaterialLocalSimulator.simulateUpdateMyMaterialById
  ).not.toHaveBeenCalled();
  expect(mutationFnCreateMyMaterial).not.toHaveBeenCalled();
});

test("interactive offline creation returns the persisted local identity", async () => {
  jest
    .mocked(MaterialLocalSimulator.simulateCreateMyMaterial)
    .mockResolvedValueOnce({ id, createdAt: new Date(0) });
  useCreateMyMaterial();
  await expect(run(request)).resolves.toMatchObject({
    success: true,
    data: { id },
    embedded: { publicId: "" },
  });
});

test("replay during an upstream outage never creates another local item or queue entry", async () => {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: true },
  });
  const error = new NotegicAPIError(FetchClientExceptions.MissingNetwork());
  jest.mocked(mutationFnCreateMyMaterial).mockRejectedValue(error);
  useCreateMyMaterial({ offlineFallback: false });
  await expect(run(request)).rejects.toBe(error);
  await expect(run(request)).rejects.toBe(error);
  expect(mutationFnCreateMyMaterial).toHaveBeenCalledTimes(2);
  expect(
    MaterialLocalSimulator.simulateCreateMyMaterial
  ).not.toHaveBeenCalled();
});
