import { useApolloClient } from "@apollo/client/react";
import {
  SearchBlockPackSortBy,
  SearchBlockPacksDocument,
  SearchMaterialSortBy,
  SearchMaterialsDocument,
  SearchRootShelfSortBy,
  SearchRootShelvesDocument,
  SearchRoutineRecordsDocument,
  SearchRoutineSortBy,
  SearchRoutinesDocument,
  SearchRoutineTagsDocument,
  SearchRoutineTaskRecordsDocument,
  SearchRoutineTasksDocument,
  SearchSortOrder,
  SearchStationSortBy,
  SearchStationsDocument,
  SearchSubShelfSortBy,
  SearchSubShelvesDocument,
} from "@shared/api/graphql/generated/graphql";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import i18n from "@/i18n";
import TrashPage from "@/pages/app/trash/TrashPage";

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

    const [
      rootShelfSearch,
      subShelfSearch,
      materialSearch,
      blockPackSearch,
      stationSearch,
      routineSearch,
    ] = await Promise.all([
      context.apolloClient.query({
        query: SearchRootShelvesDocument,
        variables: {
          input: {
            ...searchInput,
            sortBy: SearchRootShelfSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
        fetchPolicy: "network-only",
      }),
      context.apolloClient.query({
        query: SearchSubShelvesDocument,
        variables: {
          input: {
            ...searchInput,
            sortBy: SearchSubShelfSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
        fetchPolicy: "network-only",
      }),
      context.apolloClient.query({
        query: SearchMaterialsDocument,
        variables: {
          input: {
            ...searchInput,
            sortBy: SearchMaterialSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
        fetchPolicy: "network-only",
      }),
      context.apolloClient.query({
        query: SearchBlockPacksDocument,
        variables: {
          input: {
            ...searchInput,
            sortBy: SearchBlockPackSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
        fetchPolicy: "network-only",
      }),
      context.apolloClient.query({
        query: SearchStationsDocument,
        variables: {
          input: {
            ...searchInput,
            sortBy: SearchStationSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
        fetchPolicy: "network-only",
      }),
      context.apolloClient.query({
        query: SearchRoutinesDocument,
        variables: {
          input: {
            ...searchInput,
            stationIds: [],
            tagIds: [],
            sortBy: SearchRoutineSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
        fetchPolicy: "network-only",
      }),
    ]);

    if (
      !rootShelfSearch.data ||
      !subShelfSearch.data ||
      !materialSearch.data ||
      !blockPackSearch.data ||
      !stationSearch.data ||
      !routineSearch.data
    ) {
      throw new Error(i18n.t("workspace.trash.loadFailed"));
    }

    return {
      rootShelfSearch: rootShelfSearch.data,
      subShelfSearch: subShelfSearch.data,
      materialSearch: materialSearch.data,
      blockPackSearch: blockPackSearch.data,
      stationSearch: stationSearch.data,
      routineSearch: routineSearch.data,
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
