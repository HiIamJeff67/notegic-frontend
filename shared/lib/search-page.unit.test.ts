import { matchesSearch, searchPage } from "./search-page";

const rows = [
  {
    id: "b",
    name: "same",
    time: new Date("2026-10-19T01:00:00.100Z"),
    count: 2,
  },
  { id: "d", name: "z", time: new Date("2026-10-19T01:00:02Z"), count: 1 },
  {
    id: "a",
    name: "same",
    time: new Date("2026-10-19T01:00:00.900Z"),
    count: 2,
  },
  { id: "c", name: "同名🌱", time: new Date("2026-10-19T01:00:01Z"), count: 3 },
];
const keys = {
  RELEVANCE: (row: (typeof rows)[number]) => row.name,
  NAME: (row: (typeof rows)[number]) => row.name,
  CREATED_AT: (row: (typeof rows)[number]) => row.time,
  COUNT: (row: (typeof rows)[number]) => row.count,
};

describe.each([
  "rootShelves",
  "stations",
  "routines",
  "routineTags",
])("%s keyset pages", scope => {
  test.each([
    "ASC",
    "DESC",
  ])("traverses tied names in %s without skipping the probe row", sortOrder => {
    const input = { query: "", sortBy: "NAME", sortOrder, first: 2 };
    const first = searchPage(scope, input, rows, keys);
    const last = searchPage(
      scope,
      { ...input, after: first.pageInfo.endEncodedSearchCursor },
      rows,
      keys
    );
    const ids = [...first.rows, ...last.rows].map(row => row.id);
    expect(ids).toEqual(
      sortOrder === "ASC" ? ["a", "b", "d", "c"] : ["c", "d", "b", "a"]
    );
    expect(first.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(first.pageInfo.endEncodedSearchCursor).toBe(
      first.cursors.get(first.rows[1].id)
    );
    expect(last.pageInfo).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  test("continues when the anchor was deleted or is absent from the local cache", () => {
    const input = { query: "", sortBy: "NAME", sortOrder: "ASC", first: 1 };
    const first = searchPage(scope, input, rows, keys);
    const next = searchPage(
      scope,
      { ...input, after: first.pageInfo.endEncodedSearchCursor },
      rows.filter(row => row.id !== "a"),
      keys
    );
    expect(next.rows[0].id).toBe("b");
  });

  test("validates cursor context while allowing a different page size", () => {
    const input = {
      query: "同名🌱",
      stationIds: ["b", "a"],
      tagIds: [],
      isDeletedAt: false,
      sortBy: "NAME",
      sortOrder: "ASC",
      first: 2,
    };
    const first = searchPage(scope, input, rows, keys);
    const after = first.pageInfo.endEncodedSearchCursor;
    expect(() =>
      searchPage(
        scope,
        { ...input, stationIds: ["a", "b"], first: 1, after },
        rows,
        keys
      )
    ).not.toThrow();
    for (const change of [
      { query: "other" },
      { sortBy: "COUNT" },
      { sortOrder: "DESC" },
      { stationIds: ["c"] },
      { isDeletedAt: true },
    ]) {
      expect(() =>
        searchPage(scope, { ...input, ...change, after }, rows, keys)
      ).toThrow("Invalid search cursor");
    }
    expect(() => searchPage("other", { ...input, after }, rows, keys)).toThrow(
      "Invalid search cursor"
    );
    expect(() =>
      searchPage(scope, { ...input, after: btoa('{"id":"old"}') }, rows, keys)
    ).toThrow("Invalid search cursor");
  });
});

test("defaults, limits, empty pages, and second-resolution timestamps match the server", () => {
  expect(
    searchPage("stations", { query: "" }, rows, keys).rows.map(row => row.id)
  ).toEqual(["c", "d", "b", "a"]);
  const large = Array.from({ length: 101 }, (_, index) => ({
    ...rows[0],
    id: String(index).padStart(3, "0"),
  }));
  expect(
    searchPage("stations", { query: "", first: 999 }, large, keys).rows
  ).toHaveLength(100);
  expect(
    searchPage("stations", { query: "", first: 0 }, large, keys).rows
  ).toHaveLength(10);
  const first = searchPage(
    "stations",
    { query: "", first: 4, sortBy: "CREATED_AT", sortOrder: "ASC" },
    rows,
    keys
  );
  expect(first.rows.map(row => row.id)).toEqual(["a", "b", "c", "d"]);
  const empty = searchPage(
    "stations",
    {
      query: "",
      sortBy: "CREATED_AT",
      sortOrder: "ASC",
      after: first.pageInfo.endEncodedSearchCursor,
    },
    rows,
    keys
  );
  expect(empty.pageInfo).toEqual({
    __typename: "SearchPageInfo",
    hasNextPage: false,
    hasPreviousPage: true,
    startEncodedSearchCursor: null,
    endEncodedSearchCursor: null,
  });
});

test.each([
  "ASC",
  "DESC",
])("nulls remain last in %s and continue within null ties", sortOrder => {
  const nullable = rows.map((row, index) => ({
    ...row,
    value: index < 2 ? null : row.name,
  }));
  const selectors = { VALUE: (row: (typeof nullable)[number]) => row.value };
  const input = { query: "", first: 3, sortBy: "VALUE", sortOrder };
  const first = searchPage("routines", input, nullable, selectors);
  const last = searchPage(
    "routines",
    { ...input, after: first.pageInfo.endEncodedSearchCursor },
    nullable,
    selectors
  );
  expect(first.rows.slice(0, 2).every(row => row.value !== null)).toBe(true);
  expect(last.rows).toHaveLength(1);
  expect(last.rows[0].value).toBeNull();
  expect(new Set([...first.rows, ...last.rows].map(row => row.id)).size).toBe(
    4
  );
});

test("Unicode uses scalar ordering and round-trips a UTF-8 cursor", () => {
  const unicode = [
    { id: "1", name: "🌱" },
    { id: "2", name: "\uE000" },
    { id: "3", name: "中文" },
  ];
  const page = searchPage(
    "routineTags",
    { query: "", sortBy: "NAME", sortOrder: "ASC", first: 3 },
    unicode,
    { NAME: row => row.name }
  );
  expect(page.rows.map(row => row.id)).toEqual(["3", "2", "1"]);
  const position = JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(atob(page.pageInfo.endEncodedSearchCursor!), character =>
        character.charCodeAt(0)
      )
    )
  );
  expect(position.values).toEqual(["🌱", "1"]);
});

test.each([
  ["中文標題", "中文", true],
  ["Example", "EX_m%", true],
  ["a%b", "a\\%b", true],
  ["a_b", "a\\_b", true],
  ["aXb", "a\\_b", false],
  [" a ", " a ", true],
  ["a", " a ", false],
  ["anything", "   ", true],
  ["a\nb", "a_b", true],
])("matches ILIKE contains pattern: %s / %s", (value, query, expected) => {
  expect(matchesSearch(value, query)).toBe(expected);
});
