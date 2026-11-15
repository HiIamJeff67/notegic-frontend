import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutineTagsDocument,
  type SearchRoutineTagsQuery,
  type SearchRoutineTagsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutineTagsLocalAdapter } from "@/api/hooks/graphql/adapters/routineTag.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/hooks/graphql/localSearch.hook";

export const useSearchRoutineTagsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineTagsQuery,
  SearchRoutineTagsQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchRoutineTagsDocument,
    options,
    searchRoutineTagsLocalAdapter
  );

export const useSearchRoutineTagsQuery = (
  variables: SearchRoutineTagsQueryVariables,
  options?: useQuery.Options<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >
) =>
  useLocalSearchQuery(
    SearchRoutineTagsDocument,
    variables,
    options,
    searchRoutineTagsLocalAdapter
  );
