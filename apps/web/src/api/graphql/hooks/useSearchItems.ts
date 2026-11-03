import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchItemsDocument,
  type SearchItemsQuery,
  type SearchItemsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchItemsLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

export const useSearchItemsLazyQuery = (
  options?: useLazyQuery.Options<SearchItemsQuery, SearchItemsQueryVariables>
): useLazyQuery.ResultTuple<SearchItemsQuery, SearchItemsQueryVariables> =>
  useLocalSearchLazyQuery(
    SearchItemsDocument,
    options,
    searchItemsLocalAdapter
  );

export const useSearchItemsQuery = (
  variables: SearchItemsQueryVariables,
  options?: useQuery.Options<SearchItemsQuery, SearchItemsQueryVariables>
) =>
  useLocalSearchQuery(
    SearchItemsDocument,
    variables,
    options,
    searchItemsLocalAdapter
  );
