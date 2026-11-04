import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchMaterialsDocument,
  type SearchMaterialsQuery,
  type SearchMaterialsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchMaterialsLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

export const useSearchMaterialsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchMaterialsQuery,
    SearchMaterialsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchMaterialsQuery,
  SearchMaterialsQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchMaterialsDocument,
    options,
    searchMaterialsLocalAdapter
  );

export const useSearchMaterialsQuery = (
  variables: SearchMaterialsQueryVariables,
  options?: useQuery.Options<
    SearchMaterialsQuery,
    SearchMaterialsQueryVariables
  >
) =>
  useLocalSearchQuery(
    SearchMaterialsDocument,
    variables,
    options,
    searchMaterialsLocalAdapter
  );
