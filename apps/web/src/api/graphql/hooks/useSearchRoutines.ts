import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutinesDocument,
  type SearchRoutinesQuery,
  type SearchRoutinesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutinesLocalAdapter } from "@/api/searchLocalAdapters";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/searchLocalBridge";

export const useSearchRoutinesLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutinesQuery,
    SearchRoutinesQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutinesQuery,
  SearchRoutinesQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchRoutinesDocument,
    options,
    searchRoutinesLocalAdapter
  );

export const useSearchRoutinesQuery = (
  variables: SearchRoutinesQueryVariables,
  options?: useQuery.Options<SearchRoutinesQuery, SearchRoutinesQueryVariables>
) =>
  useLocalSearchQuery(
    SearchRoutinesDocument,
    variables,
    options,
    searchRoutinesLocalAdapter
  );
