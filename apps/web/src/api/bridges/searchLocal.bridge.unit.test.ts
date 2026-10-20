import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "./searchLocal.bridge";

const mockClient = { writeQuery: jest.fn() };
const mockResult = {
  client: mockClient,
  variables: {
    input: { query: "same", sortBy: "NAME", sortOrder: "ASC", first: 2 },
  } as { input: Record<string, unknown> },
  data: { searchRoutines: { searchEdges: [{ node: { id: "old" } }] } },
  fetchMore: jest.fn(),
};

jest.mock("@apollo/client/react", () => ({
  useLazyQuery: () => [jest.fn(), mockResult],
  useQuery: () => mockResult,
}));
jest.mock("react", () => ({
  useCallback: (value: unknown) => value,
  useMemo: (value: () => unknown) => value(),
  useRef: (current: unknown) => ({ current }),
  useEffect: () => {},
}));
jest.mock("@/api/local/policy", () => ({
  isLocalPreferenceEnabled: () => true,
}));

test.each([
  "lazy",
  "query",
])("%s offline fetchMore retains filters and applies the existing merger", async mode => {
  mockClient.writeQuery.mockClear();
  mockResult.fetchMore.mockRejectedValue(new TypeError("Failed to fetch"));
  const adapter = {
    fieldName: "searchRoutines" as const,
    simulate: jest
      .fn()
      .mockResolvedValue({ searchEdges: [{ node: { id: "new" } }] }),
    signature: jest.fn().mockReturnValue("signature"),
    sync: jest.fn(),
    syncErrorMessage: "sync failed",
    simulateErrorMessage: "simulate failed",
  };
  const document = {};
  const hook =
    mode === "lazy"
      ? useLocalSearchLazyQuery(document, undefined, adapter)[1]
      : useLocalSearchQuery(document, mockResult.variables, undefined, adapter);
  const updateQuery = jest.fn((previous, { fetchMoreResult }) => ({
    searchRoutines: {
      searchEdges: [
        ...previous.searchRoutines.searchEdges,
        ...fetchMoreResult.searchRoutines.searchEdges,
      ],
    },
  }));
  await hook.fetchMore({
    variables: { input: { after: "cursor" } },
    updateQuery,
  });
  expect(adapter.simulate).toHaveBeenCalledWith({
    ...mockResult.variables.input,
    after: "cursor",
  });
  expect(updateQuery).toHaveBeenCalledTimes(1);
  expect(mockClient.writeQuery).toHaveBeenLastCalledWith({
    query: document,
    variables: mockResult.variables,
    data: {
      searchRoutines: {
        searchEdges: [{ node: { id: "old" } }, { node: { id: "new" } }],
      },
    },
  });
});

test.each([
  "lazy",
  "query",
])("%s does not turn an invalid cursor into an offline first page", async mode => {
  const error = new Error("Invalid search cursor");
  mockResult.fetchMore.mockRejectedValue(error);
  const adapter = {
    fieldName: "searchRoutines" as const,
    simulate: jest.fn(),
    sync: jest.fn(),
    signature: jest.fn(),
    syncErrorMessage: "",
    simulateErrorMessage: "",
  };
  const hook =
    mode === "lazy"
      ? useLocalSearchLazyQuery({}, undefined, adapter)[1]
      : useLocalSearchQuery({}, mockResult.variables, undefined, adapter);
  await expect(
    hook.fetchMore({ variables: { input: { after: "old" } } })
  ).rejects.toBe(error);
  expect(adapter.simulate).not.toHaveBeenCalled();
});
