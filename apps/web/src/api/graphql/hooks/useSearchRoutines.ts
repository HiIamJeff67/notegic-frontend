import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutinesDocument,
  type SearchRoutinesQuery,
  type SearchRoutinesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutinesLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

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
  options?: Omit<
    useQuery.Options<SearchRoutinesQuery, SearchRoutinesQueryVariables>,
    "variables"
  >
) =>
  useLocalSearchQuery(
    SearchRoutinesDocument,
    variables,
    options,
    searchRoutinesLocalAdapter
  );
