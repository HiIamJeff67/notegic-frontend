import {
  SearchRoutineSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { routineSearchCursor } from "./searchRoutines.policy";

test.each([
  SearchRoutineSortBy.Title,
  SearchRoutineSortBy.Period,
  SearchRoutineSortBy.LastUpdate,
])("routine search cursors keep the %s ordering", sortBy => {
  const input = {
    query: "",
    stationIds: [],
    tagIds: [],
    sortBy,
    sortOrder: SearchSortOrder.Asc,
  };
  const routine = {
    id: "a",
    stationId: "station",
    title: "同名🌱",
    period: "RoutinePeriod_Daily",
    scheduledStartAt: "2026-10-19T01:00:00.900Z",
    scheduledEndAt: "2026-10-19T02:00:00Z",
    updatedAt: "2026-10-19T01:00:00.900Z",
    createdAt: "2026-10-19T01:00:00Z",
  };
  const cursor = routineSearchCursor(input, routine);
  const position = JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(atob(cursor), character => character.charCodeAt(0))
    )
  );
  expect(position).toMatchObject({
    version: 1,
    scope: "routines",
    sortBy,
    sortOrder: "ASC",
    filters: { query: "" },
  });
  expect(position.values).toEqual([
    sortBy === SearchRoutineSortBy.Title
      ? routine.title
      : sortBy === SearchRoutineSortBy.Period
        ? "Daily"
        : new Date("2026-10-19T01:00:00Z").getTime(),
    "a",
  ]);
});
