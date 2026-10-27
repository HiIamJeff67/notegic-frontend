import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { mutationFnCreateBlockPack } from "@/api/invokers/blockPack.invoker";
import { BlockPackLocalSimulator } from "@/api/local/simulators/blockPack.simulator";
import { useCreateBlockPack } from "./blockPack.hook";

const mockUseMutation = jest.fn(
  (options: {
    mutationFn: (request: unknown) => Promise<unknown>;
    onError: (error: unknown, request: unknown) => Promise<void>;
  }) => options
);
jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: never) => mockUseMutation(options),
}));
jest.mock("@shared/api/queryClient", () => ({ getQueryClient: jest.fn() }));
jest.mock("@/api/invokers/blockPack.invoker", () => ({
  mutationFnCreateBlockPack: jest.fn(),
}));
jest.mock("@/api/local/synchronizers/blockPack.synchronizer", () => ({
  BlockPackLocalSynchronizer: {},
}));
jest.mock("@/api/local/simulators/blockPack.simulator", () => ({
  BlockPackLocalSimulator: { simulateCreateBlockPack: jest.fn() },
}));

const originalNavigator = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator"
);
const id = "09311e30-6adc-4979-84e1-2912dd200fa4";
const request = {
  body: {
    parentSubShelfId: id,
    name: "Fixture",
    icon: null,
    headerBackgroundURL: null,
  },
  affected: { rootShelfId: id, parentSubShelfId: id },
};
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });
});
afterEach(() => {
  if (originalNavigator)
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  else Reflect.deleteProperty(globalThis, "navigator");
});

test("invalid offline input is translated and never reaches the queue or transport", async () => {
  useCreateBlockPack();
  const options = mockUseMutation.mock.calls[0][0];
  const invalid = { ...request, body: { ...request.body, name: " " } };
  let caught: unknown;
  try {
    await options.mutationFn(invalid);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(NotegicValidationError);
  expect((caught as NotegicValidationError).getPresentation).toBe(
    "validation.nameRequired"
  );
  await options.onError(caught, invalid);
  expect(
    BlockPackLocalSimulator.simulateCreateBlockPack
  ).not.toHaveBeenCalled();
  expect(mutationFnCreateBlockPack).not.toHaveBeenCalled();
  expect(invalid.body.name).toBe(" ");
});

test("valid offline input retains the existing local queue flow", async () => {
  useCreateBlockPack();
  const options = mockUseMutation.mock.calls[0][0];
  let caught: unknown;
  try {
    await options.mutationFn(request);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(NotegicFetchError);
  await options.onError(caught, request);
  expect(BlockPackLocalSimulator.simulateCreateBlockPack).toHaveBeenCalledWith(
    request
  );
  expect(mutationFnCreateBlockPack).not.toHaveBeenCalled();
});
