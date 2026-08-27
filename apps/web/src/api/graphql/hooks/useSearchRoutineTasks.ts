import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutineTasksDocument,
  type SearchRoutineTasksQuery,
  type SearchRoutineTasksQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchRoutineTasksLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineTasksQuery,
    SearchRoutineTasksQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineTasksQuery,
  SearchRoutineTasksQueryVariables
> =>
  useLazyQuery<SearchRoutineTasksQuery, SearchRoutineTasksQueryVariables>(
    SearchRoutineTasksDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchRoutineTasksQuery = (
  variables: SearchRoutineTasksQueryVariables,
  options?: useQuery.Options<
    SearchRoutineTasksQuery,
    SearchRoutineTasksQueryVariables
  >
) =>
  useQuery<SearchRoutineTasksQuery, SearchRoutineTasksQueryVariables>(
    SearchRoutineTasksDocument,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );
