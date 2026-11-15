import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutinesDocument,
  type SearchRoutinesQuery,
  type SearchRoutinesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutinesLocalAdapter } from "@/api/hooks/graphql/adapters/routine.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/hooks/graphql/localSearch.hook";

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
