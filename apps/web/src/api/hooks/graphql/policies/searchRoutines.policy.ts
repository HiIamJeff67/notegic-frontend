import type { FieldPolicy } from "@apollo/client";
import type { SearchRoutineInput } from "@shared/api/graphql/generated/graphql";
import { matchesSearch, searchPage } from "@shared/lib/search/searchPage";
import {
  readSearchFieldInput,
  searchFieldKey,
  searchPaginationPolicy,
} from "./searchPagination.policy";

type SearchRoutineNode = {
  id: string;
  title: string;
  stationId: string;
  tagIds?: string[] | null;
  period?: string | null;
  scheduledStartAt?: Date | string | null;
  scheduledEndAt?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
};

const routineSearchKeys = {
  RELEVANCE: (row: SearchRoutineNode) => row.title,
  TITLE: (row: SearchRoutineNode) => row.title,
  LAST_UPDATE: (row: SearchRoutineNode) => new Date(row.updatedAt ?? 0),
  CREATED_AT: (row: SearchRoutineNode) => new Date(row.createdAt ?? 0),
  SCHEDULED_START_AT: (row: SearchRoutineNode) =>
    new Date(row.scheduledStartAt ?? 0),
  SCHEDULED_END_AT: (row: SearchRoutineNode) =>
    new Date(row.scheduledEndAt ?? 0),
  PERIOD: (row: SearchRoutineNode) =>
    row.period == null
      ? null
      : String(row.period).replace(/^RoutinePeriod_/, ""),
};

export const searchRoutinesPolicy: FieldPolicy = {
  keyArgs(args, { fieldName }) {
    const input = searchFieldKey(fieldName, args);
    input.stationIds ??= [];
    input.tagIds ??= [];
    return JSON.stringify({ input });
  },
  merge: searchPaginationPolicy.merge,
};

export const pageSearchRoutines = <T extends SearchRoutineNode>(
  input: SearchRoutineInput,
  rows: T[]
) => searchPage("routines", input, rows, routineSearchKeys);

export const routineSearchCursor = (
  input: SearchRoutineInput,
  routine: SearchRoutineNode
) => pageSearchRoutines(input, [routine]).cursors.get(routine.id)!;

const matchesRoutineSearch = (input: any, routine: SearchRoutineNode) => {
  const query = input.query;
  const tagIds = routine.tagIds ?? [];
  return !(
    (query && !matchesSearch(routine.title, query)) ||
    (input.stationIds?.length > 0 &&
      !input.stationIds.includes(routine.stationId)) ||
    (input.tagIds?.length > 0 &&
      !input.tagIds.some((tagId: string) => tagIds.includes(tagId)))
  );
};

export const placeSearchRoutine = (
  existing: any,
  details: {
    readField: (fieldName: string, from?: any) => unknown;
    storeFieldName: string;
    DELETE: any;
  },
  routine: SearchRoutineNode
) => {
  if (!existing?.searchEdges) return existing;
  const input = readSearchFieldInput(details.storeFieldName);
  if (input.isDeletedAt === true) return details.DELETE;
  if (input.after) return existing;
  if (!matchesRoutineSearch(input, routine)) return existing;

  const existed = existing.searchEdges.some(
    (edge: any) => details.readField("id", edge.node) === routine.id
  );
  const edges = existing.searchEdges.filter(
    (edge: any) => details.readField("id", edge.node) !== routine.id
  );
  const searchEdges = [
    {
      __typename: "SearchRoutineEdge",
      encodedSearchCursor: routineSearchCursor(input, routine),
      node: routine,
    },
    ...edges,
  ];
  return {
    ...existing,
    totalCount: existed
      ? (existing.totalCount ?? searchEdges.length)
      : Math.max(existing.totalCount ?? 0, edges.length) + 1,
    searchEdges,
  };
};

export const clearSearchRoutines = (cache: {
  evict: (options: { fieldName: string }) => void;
}) => {
  cache.evict({ fieldName: "searchRoutines" });
};

export const removeSearchRoutines = (
  existing: any,
  readField: (fieldName: string, from?: any) => unknown,
  routineIds: readonly string[]
) => {
  if (!existing?.searchEdges) return existing;
  const removed = new Set(routineIds);
  const searchEdges = existing.searchEdges.filter(
    (edge: any) => !removed.has(readField("id", edge.node) as string)
  );
  return {
    ...existing,
    totalCount: Math.max(
      0,
      (existing.totalCount ?? searchEdges.length) -
        (existing.searchEdges.length - searchEdges.length)
    ),
    searchEdges,
  };
};
