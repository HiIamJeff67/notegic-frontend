import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutineRecordsDocument,
  type SearchRoutineRecordsQuery,
  type SearchRoutineRecordsQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchRoutineRecordsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineRecordsQuery,
    SearchRoutineRecordsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineRecordsQuery,
  SearchRoutineRecordsQueryVariables
> =>
  useLazyQuery<SearchRoutineRecordsQuery, SearchRoutineRecordsQueryVariables>(
    SearchRoutineRecordsDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchRoutineRecordsQuery = (
  variables: SearchRoutineRecordsQueryVariables,
  options?: Omit<
    useQuery.Options<
      SearchRoutineRecordsQuery,
      SearchRoutineRecordsQueryVariables
    >,
    "variables"
  >
) =>
  useQuery<SearchRoutineRecordsQuery, SearchRoutineRecordsQueryVariables>(
    SearchRoutineRecordsDocument,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );
