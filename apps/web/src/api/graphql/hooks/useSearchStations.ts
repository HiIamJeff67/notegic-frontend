import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchStationsDocument,
  type SearchStationsQuery,
  type SearchStationsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchStationsLocalAdapter } from "@/api/searchLocalAdapters";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@/api/searchLocalBridge";

export const useSearchStationsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchStationsQuery,
    SearchStationsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchStationsQuery,
  SearchStationsQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchStationsDocument,
    options,
    searchStationsLocalAdapter
  );

export const useSearchStationsQuery = (
  variables: SearchStationsQueryVariables,
  options?: useQuery.Options<SearchStationsQuery, SearchStationsQueryVariables>
) =>
  useLocalSearchQuery(
    SearchStationsDocument,
    variables,
    options,
    searchStationsLocalAdapter
  );
