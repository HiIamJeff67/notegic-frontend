import { compare } from "../string/compare";

type Key = string | number | null;

type SearchInput = {
  query: string;
  first?: number | null;
  after?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
};

type Position = {
  version: number;
  scope: string;
  sortBy: string;
  sortOrder: string;
  filters: Record<string, unknown>;
  values: Key[];
};

const createCursorFilters = (input: Record<string, unknown>) => {
  const filters: Record<string, unknown> = {};
  for (const key of Object.keys(input).sort()) {
    const value = input[key];
    if (value == null) continue;
    if (value instanceof Date) {
      filters[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      if (value.length > 0) filters[key] = [...value].sort();
    } else if (typeof value === "object") {
      const nested = createCursorFilters(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) filters[key] = nested;
    } else {
      filters[key] = value;
    }
  }
  return filters;
};

const compareKeys = (left: Key, right: Key): number => {
  if (left === right) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  if (typeof left === "number" && typeof right === "number") {
    return left < right ? -1 : 1;
  }
  if (typeof left !== "string" || typeof right !== "string") {
    throw new Error("Invalid search cursor key type.");
  }
  return compare(left, right);
};

export const searchPage = <T extends { id: string }, Input extends SearchInput>(
  scope: string,
  input: Input,
  rows: T[],
  keys: Record<string, (row: T) => Key | Date>
) => {
  const sortBy = input.sortBy ?? "RELEVANCE";
  const sortOrder = input.sortOrder ?? "DESC";
  const key = keys[sortBy];
  if (!key || (sortOrder !== "ASC" && sortOrder !== "DESC")) {
    throw new Error("Unsupported search ordering.");
  }
  const { after, first } = input;
  const position: Position = {
    ...searchContext(scope, input),
    values: [],
  };
  let previous: Position | null = null;
  if (after?.trim()) {
    try {
      const bytes = Uint8Array.from(atob(after), character =>
        character.charCodeAt(0)
      );
      previous = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes)
      );
      if (
        !previous ||
        previous.version !== 1 ||
        previous.scope !== scope ||
        previous.sortBy !== sortBy ||
        previous.sortOrder !== sortOrder ||
        JSON.stringify(createCursorFilters(previous.filters)) !==
          JSON.stringify(position.filters) ||
        !Array.isArray(previous.values) ||
        previous.values.length !== 2 ||
        typeof previous.values[1] !== "string" ||
        (!["string", "number"].includes(typeof previous.values[0]) &&
          previous.values[0] !== null)
      ) {
        throw new Error("Mismatched cursor.");
      }
    } catch {
      throw new Error("Invalid search cursor; restart from the first page.");
    }
  }
  const compare = (left: Key[], right: Key[]) => {
    for (let index = 0; index < left.length; index++) {
      const result = compareKeys(left[index], right[index]);
      if (result !== 0) {
        if (left[index] === null || right[index] === null) return result;
        return sortOrder === "DESC" ? -result : result;
      }
    }
    return 0;
  };
  const ordered = rows
    .map(node => {
      const value = key(node);
      return {
        node,
        values: [
          value instanceof Date
            ? Math.floor(value.getTime() / 1000) * 1000
            : value,
          node.id,
        ],
      };
    })
    .sort((left, right) => compare(left.values, right.values));
  const remaining = previous
    ? ordered.filter(row => compare(row.values, previous.values) > 0)
    : ordered;
  const limit = first != null && first > 0 ? Math.min(first, 100) : 10;
  const selected = remaining.slice(0, limit);
  const cursors = new Map<string, string>();
  for (const row of selected) {
    const bytes = new TextEncoder().encode(
      JSON.stringify({ ...position, values: row.values })
    );
    cursors.set(
      row.node.id,
      btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""))
    );
  }
  return {
    rows: selected.map(row => row.node),
    cursors,
    pageInfo: {
      __typename: "SearchPageInfo" as const,
      hasNextPage: remaining.length > limit,
      hasPreviousPage: previous !== null,
      startEncodedSearchCursor: selected.length
        ? cursors.get(selected[0].node.id)!
        : null,
      endEncodedSearchCursor: selected.length
        ? cursors.get(selected[selected.length - 1].node.id)!
        : null,
    },
  };
};

export const searchContext = (scope: string, input: SearchInput) => {
  const { after: _, first: __, sortBy, sortOrder, ...filters } = input;
  if ("isDeletedAt" in filters && filters.isDeletedAt === false) {
    delete filters.isDeletedAt;
  }
  return {
    version: 1,
    scope,
    sortBy: sortBy ?? "RELEVANCE",
    sortOrder: sortOrder ?? "DESC",
    filters: createCursorFilters(filters),
  };
};

export const matchesSearch = (value: string, query: string): boolean => {
  if (query.replaceAll(" ", "").length === 0) return true;
  let pattern = "";
  let escaped = false;
  for (const character of `%${query}%`) {
    if (!escaped && character === "\\") {
      escaped = true;
      continue;
    }
    if (!escaped && character === "%") pattern += ".*";
    else if (!escaped && character === "_") pattern += ".";
    else
      pattern += "\\^$.*+?()[]{}|".includes(character)
        ? `\\${character}`
        : character;
    escaped = false;
  }
  return new RegExp(`^${pattern}$`, "isu").test(value);
};
