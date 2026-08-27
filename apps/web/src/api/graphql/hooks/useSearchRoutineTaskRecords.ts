import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutineTaskRecordsDocument,
  type SearchRoutineTaskRecordsQuery,
  type SearchRoutineTaskRecordsQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchRoutineTaskRecordsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineTaskRecordsQuery,
    SearchRoutineTaskRecordsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineTaskRecordsQuery,
  SearchRoutineTaskRecordsQueryVariables
> =>
  useLazyQuery<
    SearchRoutineTaskRecordsQuery,
    SearchRoutineTaskRecordsQueryVariables
  >(SearchRoutineTaskRecordsDocument, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });

export const useSearchRoutineTaskRecordsQuery = (
  variables: SearchRoutineTaskRecordsQueryVariables,
  options?: useQuery.Options<
    SearchRoutineTaskRecordsQuery,
    SearchRoutineTaskRecordsQueryVariables
  >
) =>
  useQuery<
    SearchRoutineTaskRecordsQuery,
    SearchRoutineTaskRecordsQueryVariables
  >(SearchRoutineTaskRecordsDocument, {
    variables,
    notifyOnNetworkStatusChange: true,
    ...options,
  });
