import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRootShelvesDocument,
  type SearchRootShelvesQuery,
  type SearchRootShelvesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRootShelvesLocalAdapter } from "@/api/searchLocalAdapters";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/searchLocalBridge";

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
