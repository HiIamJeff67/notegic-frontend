import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRootShelvesDocument,
  type SearchRootShelvesQuery,
  type SearchRootShelvesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRootShelvesLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

export const useSearchRootShelvesLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRootShelvesQuery,
    SearchRootShelvesQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRootShelvesQuery,
  SearchRootShelvesQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchRootShelvesDocument,
    options,
    searchRootShelvesLocalAdapter
  );

export const useSearchShelvesQuery = (
  variables: SearchRootShelvesQueryVariables,
  options?: useQuery.Options<
    SearchRootShelvesQuery,
    SearchRootShelvesQueryVariables
  >
) =>
  useLocalSearchQuery(
    SearchRootShelvesDocument,
    variables,
    options,
    searchRootShelvesLocalAdapter
  );
