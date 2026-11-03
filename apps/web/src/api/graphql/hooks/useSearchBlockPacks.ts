import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchBlockPacksDocument,
  type SearchBlockPacksQuery,
  type SearchBlockPacksQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchBlockPacksLocalAdapter } from "@/api/adapters/searchLocal.adapter";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/bridges/searchLocal.bridge";

export const useSearchBlockPacksLazyQuery = (
  options?: useLazyQuery.Options<
    SearchBlockPacksQuery,
    SearchBlockPacksQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchBlockPacksQuery,
  SearchBlockPacksQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchBlockPacksDocument,
    options,
    searchBlockPacksLocalAdapter
  );

export const useSearchBlockPacksQuery = (
  variables: SearchBlockPacksQueryVariables,
  options?: useQuery.Options<
    SearchBlockPacksQuery,
    SearchBlockPacksQueryVariables
  >
) =>
  useLocalSearchQuery(
    SearchBlockPacksDocument,
    variables,
    options,
    searchBlockPacksLocalAdapter
  );
