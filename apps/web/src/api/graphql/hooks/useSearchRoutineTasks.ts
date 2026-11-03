import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutineTasksDocument,
  type SearchRoutineTasksQuery,
  type SearchRoutineTasksQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutineTasksLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

export const useSearchRoutineTasksLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineTasksQuery,
    SearchRoutineTasksQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineTasksQuery,
  SearchRoutineTasksQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchRoutineTasksDocument,
    options,
    searchRoutineTasksLocalAdapter
  );

export const useSearchRoutineTasksQuery = (
  variables: SearchRoutineTasksQueryVariables,
  options?: Omit<
    useQuery.Options<SearchRoutineTasksQuery, SearchRoutineTasksQueryVariables>,
    "variables"
  >
) =>
  useLocalSearchQuery(
    SearchRoutineTasksDocument,
    variables,
    options,
    searchRoutineTasksLocalAdapter
  );
