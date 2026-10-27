const mockUseQuery = jest.fn(
  (options: {
    queryFn: () => Promise<unknown>;
    queryKey: readonly unknown[];
    enabled?: boolean;
  }) => ({ refetch: options.queryFn })
);
const mockFetchQuery = jest.fn(
  ({ queryFn }: { queryFn: () => Promise<unknown> }) => queryFn()
);
let mockToken: string | null = "current-token";
const mockEnsureItem = jest.fn((_key: unknown, value: string | undefined) => {
  if (value) mockToken = value;
});

jest.mock("@tanstack/react-query", () => ({ useQuery: mockUseQuery }));
jest.mock("@shared/api/queryClient", () => ({
  getQueryClient: () => ({ fetchQuery: mockFetchQuery }),
}));
jest.mock("@shared/lib/sessionStorageManipulator", () => ({
  SessionStorageManipulator: {
    getItemByKey: () => mockToken,
    ensureItem: mockEnsureItem,
  },
}));

import { useVisualizeQuery } from "./visualize.hook";

const request = {
  header: { userAgent: "explicit-agent", csrfToken: "obsolete-token" },
  param: { permission: "Owner", routineTaskIds: ["fixture-task"] },
};
const response = { data: { data: [] }, refreshableTokens: {} };

beforeEach(() => {
  jest.clearAllMocks();
  mockToken = "current-token";
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "browser-agent", onLine: true },
  });
});

test("adds current session headers when the query executes without changing its input", async () => {
  const queryFunction = jest.fn().mockResolvedValue(response);
  const query = useVisualizeQuery(
    request,
    () => ["visualize", "fixture"],
    queryFunction
  );
  expect(queryFunction).not.toHaveBeenCalled();
  mockToken = "token-after-render";
  await query.refetch();
  expect(queryFunction).toHaveBeenCalledWith({
    ...request,
    header: { userAgent: "explicit-agent", csrfToken: "token-after-render" },
  });
  expect(request.header.csrfToken).toBe("obsolete-token");
  expect(mockUseQuery.mock.calls[0][0].queryKey).toEqual([
    "visualize",
    "fixture",
  ]);
});

test("does not replay cached renewal metadata and reads current transport state on every fetch", async () => {
  const queryFunction = jest
    .fn()
    .mockResolvedValueOnce({
      ...response,
      refreshableTokens: { newCSRFToken: "renewed-token" },
    })
    .mockResolvedValue(response);
  const query = useVisualizeQuery(request, () => ["visualize"], queryFunction);
  await query.refetch();
  expect(mockEnsureItem).not.toHaveBeenCalled();
  mockToken = "renewed-token";
  await query.refetch();
  await query.fetch(request);
  expect(
    queryFunction.mock.calls.map(([value]) => value.header.csrfToken)
  ).toEqual(["current-token", "renewed-token", "renewed-token"]);
});

test("adds browser headers when callers supply only query parameters", async () => {
  const queryFunction = jest.fn().mockResolvedValue(response);
  const query = useVisualizeQuery(
    { param: { permission: "Owner" } },
    () => ["visualize"],
    queryFunction
  );
  await query.refetch();
  expect(queryFunction).toHaveBeenCalledWith({
    param: { permission: "Owner" },
    header: { userAgent: "browser-agent", csrfToken: "current-token" },
  });
});

test("does not reuse a caller's stale token after session storage is cleared", async () => {
  mockToken = null;
  const queryFunction = jest.fn().mockResolvedValue(response);
  const query = useVisualizeQuery(request, () => ["visualize"], queryFunction);
  await query.refetch();
  expect(queryFunction).toHaveBeenCalledWith({
    ...request,
    header: { userAgent: "explicit-agent" },
  });
});

test("keeps absent and offline requests from reaching the invoker", async () => {
  const queryFunction = jest.fn().mockResolvedValue(response);
  const missing = useVisualizeQuery(
    undefined,
    () => ["visualize"],
    queryFunction
  );
  expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
  await expect(missing.refetch()).rejects.toThrow();
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });
  const offline = useVisualizeQuery(
    request,
    () => ["visualize"],
    queryFunction
  );
  await expect(offline.refetch()).rejects.toThrow();
  expect(queryFunction).not.toHaveBeenCalled();
});
