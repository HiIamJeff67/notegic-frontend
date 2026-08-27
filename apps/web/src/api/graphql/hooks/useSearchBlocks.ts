import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchBlocksDocument,
  type SearchBlocksQuery,
  type SearchBlocksQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchBlocksLazyQuery = (
  options?: useLazyQuery.Options<SearchBlocksQuery, SearchBlocksQueryVariables>
): useLazyQuery.ResultTuple<SearchBlocksQuery, SearchBlocksQueryVariables> =>
  useLazyQuery<SearchBlocksQuery, SearchBlocksQueryVariables>(
    SearchBlocksDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchBlocksQuery = (
  variables: SearchBlocksQueryVariables,
  options?: useQuery.Options<SearchBlocksQuery, SearchBlocksQueryVariables>
) =>
  useQuery<SearchBlocksQuery, SearchBlocksQueryVariables>(
    SearchBlocksDocument,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );
