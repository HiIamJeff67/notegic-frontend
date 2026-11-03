import { useApolloClient } from "@apollo/client/react";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import {
  SearchBlockPackSortBy,
  SearchBlockPacksDocument,
  type SearchBlockPacksQuery,
  SearchMaterialSortBy,
  SearchMaterialsDocument,
  type SearchMaterialsQuery,
  SearchRootShelfSortBy,
  SearchRootShelvesDocument,
  type SearchRootShelvesQuery,
  SearchRoutineRecordsDocument,
  SearchRoutineSortBy,
  SearchRoutinesDocument,
  type SearchRoutinesQuery,
  SearchRoutineTagsDocument,
  SearchRoutineTaskRecordsDocument,
  SearchRoutineTasksDocument,
  SearchSortOrder,
  SearchStationSortBy,
  SearchStationsDocument,
  type SearchStationsQuery,
  SearchSubShelfSortBy,
  SearchSubShelvesDocument,
  type SearchSubShelvesQuery,
} from "@shared/api/graphql/generated/graphql";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { isRemoteUnavailable } from "@/api/availability";
import { RootShelfLocalSimulator } from "@/api/local/simulators/rootShelf.simulator";
import { RoutineLocalSimulator } from "@/api/local/simulators/routine.simulator";
import { StationLocalSimulator } from "@/api/local/simulators/station.simulator";
import i18n from "@/i18n";
import TrashPage from "@/pages/app/trash/TrashPage";

const emptySearchPageInfo = {
  __typename: "SearchPageInfo" as const,
  hasNextPage: false,
  hasPreviousPage: false,
  startEncodedSearchCursor: null,
  endEncodedSearchCursor: null,
};

const emptyRootShelfSearch = {
  searchRootShelves: {
    __typename: "SearchRootShelfConnection" as const,
    searchEdges: [],
    searchPageInfo: emptySearchPageInfo,
    totalCount: 0,
    searchTime: 0,
  },
} satisfies SearchRootShelvesQuery;

const emptyStationSearch = {
  searchStations: {
    __typename: "SearchStationConnection" as const,
    searchEdges: [],
    searchPageInfo: emptySearchPageInfo,
    totalCount: 0,
    searchTime: 0,
  },
} satisfies SearchStationsQuery;

const emptyRoutineSearch = {
  searchRoutines: {
    __typename: "SearchRoutineConnection" as const,
    searchEdges: [],
    searchPageInfo: emptySearchPageInfo,
    totalCount: 0,
    searchTime: 0,
  },
} satisfies SearchRoutinesQuery;

const emptySubShelfSearch = {
  searchSubShelves: {
    __typename: "SearchSubShelfConnection" as const,
    searchEdges: [],
    searchPageInfo: emptySearchPageInfo,
    totalCount: 0,
    searchTime: 0,
  },
} satisfies SearchSubShelvesQuery;

const emptyMaterialSearch = {
  searchMaterials: {
    __typename: "SearchMaterialConnection" as const,
    searchEdges: [],
    searchPageInfo: emptySearchPageInfo,
    totalCount: 0,
    searchTime: 0,
  },
} satisfies SearchMaterialsQuery;

const emptyBlockPackSearch = {
  searchBlockPacks: {
    __typename: "SearchBlockPackConnection" as const,
    searchEdges: [],
    searchPageInfo: emptySearchPageInfo,
    totalCount: 0,
    searchTime: 0,
  },
} satisfies SearchBlockPacksQuery;

let reportedTrashNetwork = false;

const reportTrashNetwork = () => {
  if (reportedTrashNetwork) return;
  reportedTrashNetwork = true;
  toast.error(
    tError(
      new NotegicFetchError(FetchClientExceptions.MissingNetwork()),
      i18n.t
    )
  );
};

export const Route = createFileRoute("/app/trash")({
  ssr: false,
  validateSearch: search => ({
    query: typeof search.query === "string" ? search.query : "",
  }),
  loaderDeps: ({ search }) => ({ query: search.query }),
  loader: async ({ context, deps }) => {
    const searchInput = {
      query: deps.query,
      isDeletedAt: true,
      first: 50,
    };
    const load = async <T,>(
      remote: () => Promise<{ data?: T | null }>,
      local: () => Promise<T>,
      empty: T
    ): Promise<T> => {
      if (!isRemoteUnavailable()) {
        try {
          const result = await remote();
          if (result.data) return result.data;
          toast.error(i18n.t("workspace.trash.loadFailed"));
        } catch (error) {
          if (NetworkExceptions.isNetworkFallbackError(error)) {
            reportTrashNetwork();
          } else {
            toast.error(tError(error, i18n.t));
          }
        }
      } else {
        reportTrashNetwork();
      }

      try {
        return await local();
      } catch (error) {
        toast.error(tError(error, i18n.t));
        return empty;
      }
    };

    const rootShelfInput = {
      ...searchInput,
      sortBy: SearchRootShelfSortBy.LastUpdate,
      sortOrder: SearchSortOrder.Desc,
    };
    const subShelfInput = {
      ...searchInput,
      sortBy: SearchSubShelfSortBy.LastUpdate,
      sortOrder: SearchSortOrder.Desc,
    };
    const materialInput = {
      ...searchInput,
      sortBy: SearchMaterialSortBy.LastUpdate,
      sortOrder: SearchSortOrder.Desc,
    };
    const blockPackInput = {
      ...searchInput,
      sortBy: SearchBlockPackSortBy.LastUpdate,
      sortOrder: SearchSortOrder.Desc,
    };
    const stationInput = {
      ...searchInput,
      sortBy: SearchStationSortBy.LastUpdate,
      sortOrder: SearchSortOrder.Desc,
    };
    const routineInput = {
      ...searchInput,
      stationIds: [],
      tagIds: [],
      sortBy: SearchRoutineSortBy.LastUpdate,
      sortOrder: SearchSortOrder.Desc,
    };

    const [
      rootShelfSearch,
      subShelfSearch,
      materialSearch,
      blockPackSearch,
      stationSearch,
      routineSearch,
    ] = await Promise.all([
      load(
        () =>
          context.apolloClient.query({
            query: SearchRootShelvesDocument,
            variables: { input: rootShelfInput },
            fetchPolicy: "network-only",
          }),
        async () => ({
          searchRootShelves:
            await RootShelfLocalSimulator.simulateSearchRootShelves(
              rootShelfInput
            ),
        }),
        emptyRootShelfSearch
      ),
      load(
        () =>
          context.apolloClient.query({
            query: SearchSubShelvesDocument,
            variables: { input: subShelfInput },
            fetchPolicy: "network-only",
          }),
        async () => emptySubShelfSearch,
        emptySubShelfSearch
      ),
      load(
        () =>
          context.apolloClient.query({
            query: SearchMaterialsDocument,
            variables: { input: materialInput },
            fetchPolicy: "network-only",
          }),
        async () => emptyMaterialSearch,
        emptyMaterialSearch
      ),
      load(
        () =>
          context.apolloClient.query({
            query: SearchBlockPacksDocument,
            variables: { input: blockPackInput },
            fetchPolicy: "network-only",
          }),
        async () => emptyBlockPackSearch,
        emptyBlockPackSearch
      ),
      load(
        () =>
          context.apolloClient.query({
            query: SearchStationsDocument,
            variables: { input: stationInput },
            fetchPolicy: "network-only",
          }),
        async () => ({
          searchStations:
            await StationLocalSimulator.simulateSearchStations(stationInput),
        }),
        emptyStationSearch
      ),
      load(
        () =>
          context.apolloClient.query({
            query: SearchRoutinesDocument,
            variables: { input: routineInput },
            fetchPolicy: "network-only",
          }),
        async () => ({
          searchRoutines:
            await RoutineLocalSimulator.simulateSearchRoutines(routineInput),
        }),
        emptyRoutineSearch
      ),
    ]);

    return {
      rootShelfSearch,
      subShelfSearch,
      materialSearch,
      blockPackSearch,
      stationSearch,
      routineSearch,
    };
  },
  component: TrashRoute,
});

function TrashRoute() {
  const { query } = Route.useSearch();
  const searchData = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const apolloClient = useApolloClient();
  const handleChanged = useCallback(async () => {
    await Promise.all([
      apolloClient.refetchQueries({
        include: [
          SearchRootShelvesDocument,
          SearchSubShelvesDocument,
          SearchMaterialsDocument,
          SearchBlockPacksDocument,
          SearchStationsDocument,
          SearchRoutinesDocument,
          SearchRoutineTagsDocument,
          SearchRoutineTasksDocument,
          SearchRoutineRecordsDocument,
          SearchRoutineTaskRecordsDocument,
        ],
        updateCache(cache) {
          for (const fieldName of [
            "searchRootShelves",
            "searchSubShelves",
            "searchMaterials",
            "searchBlockPacks",
            "searchStations",
            "searchRoutines",
            "searchRoutineTasks",
            "searchRoutineTags",
            "searchRoutineRecords",
            "searchRoutineTaskRecords",
          ]) {
            cache.evict({ fieldName });
          }
        },
      }),
      router.invalidate({
        filter: match => match.routeId === Route.id,
        sync: true,
      }),
    ]);
  }, [apolloClient, router]);
  const handleQueryChange = useCallback(
    (nextQuery: string) => {
      void navigate({
        search: previous => ({ ...previous, query: nextQuery }),
        replace: true,
      });
    },
    [navigate]
  );

  return (
    <TrashPage
      query={query}
      searchData={searchData}
      onQueryChange={handleQueryChange}
      onChanged={handleChanged}
    />
  );
}
