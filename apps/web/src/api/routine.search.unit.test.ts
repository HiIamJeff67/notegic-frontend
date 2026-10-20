import {
  SearchRoutineSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { routineSearchPage } from "./routine.search";

test.each([
  SearchRoutineSortBy.Title,
  SearchRoutineSortBy.Period,
  SearchRoutineSortBy.LastUpdate,
])("new Routine edges and offline search share %s cursors", sortBy => {
  const input = {
    query: "",
    stationIds: [],
    tagIds: [],
    sortBy,
    sortOrder: SearchSortOrder.Asc,
  };
  const routine = {
    id: "a",
    title: "同名🌱",
    period: "RoutinePeriod_Daily",
    scheduledStartAt: "2026-10-19T01:00:00.900Z",
    scheduledEndAt: "2026-10-19T02:00:00Z",
    updatedAt: "2026-10-19T01:00:00.900Z",
    createdAt: "2026-10-19T01:00:00Z",
  };
  const initial = routineSearchPage(input, [routine]);
  const cursor = initial.cursors.get(routine.id)!;
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
  const next = routineSearchPage({ ...input, after: cursor }, [
    routine,
    { ...routine, id: "b" },
  ]);
  expect(next.rows.map(row => row.id)).toEqual(["b"]);
});
