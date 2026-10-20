import { gql, InMemoryCache } from "@apollo/client";
import { searchPaginationPolicy } from "./searchPagination.policy";

test("Routine mutation modifiers retain the existing input envelope and empty ID lists", () => {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: { fields: { searchRoutines: searchPaginationPolicy } },
    },
  });
  const query = gql`query Search($input: SearchRoutineInput!) { searchRoutines(input: $input) { totalCount } }`;
  cache.writeQuery({
    query,
    variables: { input: { query: "", stationIds: [], tagIds: [] } },
    data: { searchRoutines: { totalCount: 0 } },
  });
  const modifier = jest.fn((existing, { storeFieldName }) => {
    const input = JSON.parse(
      storeFieldName.slice(storeFieldName.indexOf(":") + 1)
    ).input;
    expect(input).toEqual({
      query: "",
      stationIds: [],
      tagIds: [],
      sortBy: "RELEVANCE",
      sortOrder: "DESC",
    });
    return existing;
  });
  cache.modify({ fields: { searchRoutines: modifier } });
  expect(modifier).toHaveBeenCalledTimes(1);
});

test("partial queries do not invent counts or collapse cursor-only edges", () => {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: { fields: { searchThemes: searchPaginationPolicy } },
    },
  });
  const query = gql`query Search($input: SearchThemeInput!) { searchThemes(input: $input) { totalCount } }`;
  const variables = { input: { query: "" } };
  cache.writeQuery({
    query,
    variables,
    data: { searchThemes: { totalCount: 5 } },
  });
  expect(cache.readQuery({ query, variables })).toEqual({
    searchThemes: { totalCount: 5 },
  });
  const cursors = gql`query Search($input: SearchThemeInput!) { searchThemes(input: $input) { searchEdges { encodedSearchCursor } } }`;
  cache.writeQuery({
    query: cursors,
    variables,
    data: {
      searchThemes: {
        searchEdges: [
          { encodedSearchCursor: "a" },
          { encodedSearchCursor: "b" },
        ],
      },
    },
  });
  expect(
    cache.readQuery<any>({ query: cursors, variables })!.searchThemes
      .searchEdges
  ).toHaveLength(2);
});

test.each([
  "searchRootShelves",
  "searchSubShelves",
  "searchItems",
  "searchBlockPacks",
  "searchBlocks",
  "searchMaterials",
  "searchStations",
  "searchRoutines",
  "searchRoutineTasks",
  "searchRoutineTags",
  "searchRoutineRecords",
  "searchRoutineTaskRecords",
  "searchUsers",
  "searchThemes",
])("%s caches separate filter contexts and merges retried pages once", field => {
  const cache = new InMemoryCache({
    typePolicies: { Query: { fields: { [field]: searchPaginationPolicy } } },
  });
  const query = gql(`query Search($input: SearchInput!) {
    ${field}(input: $input) {
      __typename totalCount searchEdges { __typename encodedSearchCursor node { __typename id } }
      searchPageInfo { __typename hasNextPage hasPreviousPage startEncodedSearchCursor endEncodedSearchCursor }
    }
  }`);
  const connection = (ids: string[], next: boolean, previous: boolean) => ({
    __typename: "SearchConnection",
    totalCount: ids.length,
    searchEdges: ids.map(id => ({
      __typename: "SearchEdge",
      encodedSearchCursor: `cursor-${id}`,
      node: { __typename: "Node", id },
    })),
    searchPageInfo: {
      __typename: "SearchPageInfo",
      hasNextPage: next,
      hasPreviousPage: previous,
      startEncodedSearchCursor: ids.length ? `cursor-${ids[0]}` : null,
      endEncodedSearchCursor: ids.length ? `cursor-${ids.at(-1)}` : null,
    },
  });
  const input = {
    query: "",
    sortBy: "NAME",
    sortOrder: "ASC",
    first: 2,
    stationIds: ["b", "a"],
  };
  const write = (
    values: object,
    ids: string[],
    next: boolean,
    previous: boolean
  ) =>
    cache.writeQuery({
      query,
      variables: { input: { ...input, ...values } },
      data: { [field]: connection(ids, next, previous) },
    });
  write({}, ["a", "b"], true, false);
  write({ after: "cursor-b" }, ["b", "c"], false, true);
  write({ after: "cursor-b" }, ["b", "c"], false, true);
  const result = cache.readQuery<any>({
    query,
    variables: {
      input: {
        ...input,
        first: 99,
        stationIds: ["a", "b"],
        isDeletedAt: false,
      },
    },
  })![field];
  expect(result.searchEdges.map((edge: any) => edge.node.id)).toEqual([
    "a",
    "b",
    "c",
  ]);
  expect(result.searchPageInfo).toMatchObject({
    startEncodedSearchCursor: "cursor-a",
    endEncodedSearchCursor: "cursor-c",
    hasNextPage: false,
    hasPreviousPage: false,
  });
  expect(result.totalCount).toBe(3);
  write({ after: "cursor-c" }, [], false, true);
  expect(
    cache.readQuery<any>({ query, variables: { input } })![field].searchPageInfo
      .endEncodedSearchCursor
  ).toBe("cursor-c");
  for (const changed of [
    { isDeletedAt: true },
    { parentSubShelfId: "other" },
    { rootShelfId: "other" },
    { routineIds: ["other"] },
    { filters: { isDefault: false } },
    { sortOrder: "DESC" },
  ]) {
    write(changed, ["different-filter"], false, false);
    expect(
      cache.readQuery<any>({ query, variables: { input } })![field].searchEdges
    ).toHaveLength(3);
  }
  write({}, ["new-first-page"], false, false);
  expect(
    cache
      .readQuery<any>({ query, variables: { input } })!
      [field].searchEdges.map((edge: any) => edge.node.id)
  ).toEqual(["new-first-page"]);
});

test("items with the same UUID but different types retain separate cache identities", () => {
  const cache = new InMemoryCache({
    typePolicies: {
      PrivateItem: { keyFields: ["id", "type"] },
      Query: { fields: { searchItems: searchPaginationPolicy } },
    },
  });
  const query = gql`query Search($input: SearchItemInput!) {
    searchItems(input: $input) {
      __typename searchEdges { __typename encodedSearchCursor node { __typename id type } }
      totalCount searchPageInfo { __typename hasNextPage hasPreviousPage startEncodedSearchCursor endEncodedSearchCursor }
    }
  }`;
  const input = { query: "" };
  cache.writeQuery({
    query,
    variables: { input },
    data: {
      searchItems: {
        __typename: "SearchItemConnection",
        totalCount: 2,
        searchEdges: ["Material", "BlockPack"].map(type => ({
          __typename: "SearchItemEdge",
          encodedSearchCursor: type,
          node: { __typename: "PrivateItem", id: "same", type },
        })),
        searchPageInfo: {
          __typename: "SearchPageInfo",
          hasNextPage: false,
          hasPreviousPage: false,
          startEncodedSearchCursor: "Material",
          endEncodedSearchCursor: "BlockPack",
        },
      },
    },
  });
  expect(
    cache
      .readQuery<any>({ query, variables: { input } })!
      .searchItems.searchEdges.map((edge: any) => edge.node.type)
  ).toEqual(["Material", "BlockPack"]);
});
