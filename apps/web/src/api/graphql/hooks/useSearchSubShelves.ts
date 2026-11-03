import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchSubShelvesDocument,
  type SearchSubShelvesQuery,
  type SearchSubShelvesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchSubShelvesLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

export const useSearchSubShelvesLazyQuery = (
  options?: useLazyQuery.Options<
    SearchSubShelvesQuery,
    SearchSubShelvesQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchSubShelvesQuery,
  SearchSubShelvesQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchSubShelvesDocument,
    options,
    searchSubShelvesLocalAdapter
  );

export const useSearchSubShelvesQuery = (
  variables: SearchSubShelvesQueryVariables,
  options?: useQuery.Options<
    SearchSubShelvesQuery,
    SearchSubShelvesQueryVariables
  >
) =>
  useLocalSearchQuery(
    SearchSubShelvesDocument,
    variables,
    options,
    searchSubShelvesLocalAdapter
  );
