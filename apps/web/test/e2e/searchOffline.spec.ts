import { expect, test } from "@playwright/test";
import type { SearchPageInfo } from "@shared/api/graphql/generated/graphql";

type SearchResult = {
  searchEdges: Array<{ node: { id: string }; encodedSearchCursor: string }>;
  searchPageInfo: SearchPageInfo;
};

test("offline search traverses real SQLite rows with compatible cursors", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Imports the development source fixture."
  );
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const results = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const schema = await load("/src/api/local/schemas/index.ts");
    const { eq } = await load("/test/e2e/localDatabaseTestSupport.ts");
    const { RootShelfLocalSimulator } = await load(
      "/src/api/local/simulators/rootShelf.simulator.ts"
    );
    const { StationLocalSimulator } = await load(
      "/src/api/local/simulators/station.simulator.ts"
    );
    const { RoutineLocalSimulator } = await load(
      "/src/api/local/simulators/routine.simulator.ts"
    );
    const { RoutineTagLocalSimulator } = await load(
      "/src/api/local/simulators/routineTag.simulator.ts"
    );
    await localDB.ensureReady();
    const owner = "00000000-0000-4000-8000-000000000001";
    await localDB.insert(schema.User).values({
      publicId: owner,
      name: "search-fixture",
      displayName: "Search",
      email: "search@example.invalid",
      isLoggedIn: true,
    });
    const ids = [1, 2, 3, 4, 5].map(
      id => `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`
    );
    const names = ["same", "same", "z", "a", "同名🌱"];
    const createdAt = new Date("2026-10-19T01:00:00Z");
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const updatedAt = new Date(createdAt.getTime() + (5 - index) * 1000);
      await localDB
        .insert(schema.RootShelf)
        .values({ id, name: names[index], createdAt, updatedAt });
      await localDB
        .insert(schema.UsersToShelves)
        .values({ userPublicId: owner, rootShelfId: id, permission: "Owner" });
      await localDB.insert(schema.Station).values({
        id,
        name: names[index],
        routineCount: 5 - index,
        createdAt,
        updatedAt,
      });
      await localDB
        .insert(schema.UsersToStations)
        .values({ userPublicId: owner, stationId: id, permission: "Owner" });
      await localDB.insert(schema.Routine).values({
        id,
        stationId: owner,
        title: names[index],
        scheduledStartAt: updatedAt,
        scheduledEndAt: updatedAt,
        period: index === 0 ? null : "Daily",
        createdAt,
        updatedAt,
      });
      await localDB.insert(schema.RoutineTag).values({
        id,
        ownerPublicId: owner,
        name: names[index],
        createdAt,
        updatedAt,
      });
    }
    const searches = [
      {
        scope: "rootShelves",
        run: RootShelfLocalSimulator.simulateSearchRootShelves,
        sorts: ["RELEVANCE", "NAME", "LAST_UPDATE", "CREATED_AT"],
      },
      {
        scope: "stations",
        run: StationLocalSimulator.simulateSearchStations,
        sorts: [
          "RELEVANCE",
          "NAME",
          "ROUTINE_COUNT",
          "LAST_UPDATE",
          "CREATED_AT",
        ],
      },
      {
        scope: "routines",
        run: RoutineLocalSimulator.simulateSearchRoutines,
        sorts: [
          "RELEVANCE",
          "TITLE",
          "SCHEDULED_START_AT",
          "SCHEDULED_END_AT",
          "PERIOD",
          "LAST_UPDATE",
          "CREATED_AT",
        ],
      },
      {
        scope: "routineTags",
        run: RoutineTagLocalSimulator.simulateSearchRoutineTags,
        sorts: ["RELEVANCE", "NAME", "LAST_UPDATE", "CREATED_AT"],
      },
    ];
    const results: Array<{
      scope: string;
      sortBy: string;
      sortOrder: string;
      ids: string[];
      validPageInfo: boolean;
    }> = [];
    for (const search of searches) {
      for (const sortBy of search.sorts) {
        for (const sortOrder of ["ASC", "DESC"]) {
          let after: string | null = null;
          const collected: string[] = [];
          let validPageInfo = true;
          for (let index = 0; index < 4; index++) {
            const page: SearchResult = await search.run({
              query: "",
              stationIds: [],
              tagIds: [],
              first: 2,
              sortBy,
              sortOrder,
              after,
            });
            const edges = page.searchEdges;
            const info = page.searchPageInfo;
            collected.push(...edges.map((edge: any) => edge.node.id));
            validPageInfo &&=
              info.startEncodedSearchCursor === edges[0]?.encodedSearchCursor &&
              info.endEncodedSearchCursor ===
                edges.at(-1)?.encodedSearchCursor &&
              info.hasPreviousPage === (after !== null) &&
              info.hasNextPage === collected.length < ids.length;
            if (!info.hasNextPage) break;
            after = info.endEncodedSearchCursor ?? null;
          }
          results.push({
            scope: search.scope,
            sortBy,
            sortOrder,
            ids: collected,
            validPageInfo,
          });
        }
      }
    }
    // The position remains usable after its anchor disappears from SQLite.
    const input = { query: "", sortBy: "NAME", sortOrder: "ASC", first: 1 };
    const first =
      await RoutineTagLocalSimulator.simulateSearchRoutineTags(input);
    await localDB
      .delete(schema.RoutineTag)
      .where(eq(schema.RoutineTag.id, first.searchEdges[0].node.id));
    const next = await RoutineTagLocalSimulator.simulateSearchRoutineTags({
      ...input,
      after: first.searchPageInfo.endEncodedSearchCursor,
    });
    return { results, nextId: next.searchEdges[0].node.id };
  });
  const ids = [1, 2, 3, 4, 5].map(
    id => `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`
  );
  expect(results.results).toHaveLength(40);
  for (const result of results.results) {
    expect(
      result.validPageInfo,
      `${result.scope}/${result.sortBy}/${result.sortOrder}`
    ).toBe(true);
    expect(new Set(result.ids).size).toBe(5);
    if (["NAME", "TITLE", "RELEVANCE"].includes(result.sortBy)) {
      const order = [ids[3], ids[0], ids[1], ids[2], ids[4]];
      expect(result.ids).toEqual(
        result.sortOrder === "ASC" ? order : order.reverse()
      );
    }
    if (result.sortBy === "CREATED_AT") {
      expect(result.ids).toEqual(
        result.sortOrder === "ASC" ? ids : [...ids].reverse()
      );
    }
  }
  expect(results.nextId).toBe(ids[0]);
});
