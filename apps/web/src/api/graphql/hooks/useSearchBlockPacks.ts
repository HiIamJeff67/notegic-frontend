import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchBlockPacksDocument,
  type SearchBlockPacksQuery,
  type SearchBlockPacksQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchBlockPacksLazyQuery = (
  options?: useLazyQuery.Options<
    SearchBlockPacksQuery,
    SearchBlockPacksQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchBlockPacksQuery,
  SearchBlockPacksQueryVariables
> =>
  useLazyQuery<SearchBlockPacksQuery, SearchBlockPacksQueryVariables>(
    SearchBlockPacksDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchBlockPacksQuery = (
  variables: SearchBlockPacksQueryVariables,
  options?: useQuery.Options<
    SearchBlockPacksQuery,
    SearchBlockPacksQueryVariables
  >
) =>
  useQuery<SearchBlockPacksQuery, SearchBlockPacksQueryVariables>(
    SearchBlockPacksDocument,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );
