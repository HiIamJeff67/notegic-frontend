import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchMaterialsDocument,
  type SearchMaterialsQuery,
  type SearchMaterialsQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchMaterialsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchMaterialsQuery,
    SearchMaterialsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchMaterialsQuery,
  SearchMaterialsQueryVariables
> =>
  useLazyQuery<SearchMaterialsQuery, SearchMaterialsQueryVariables>(
    SearchMaterialsDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchMaterialsQuery = (
  variables: SearchMaterialsQueryVariables,
  options?: useQuery.Options<
    SearchMaterialsQuery,
    SearchMaterialsQueryVariables
  >
) =>
  useQuery<SearchMaterialsQuery, SearchMaterialsQueryVariables>(
    SearchMaterialsDocument,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );
