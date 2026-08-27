import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchItemsDocument,
  type SearchItemsQuery,
  type SearchItemsQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchItemsLazyQuery = (
  options?: useLazyQuery.Options<SearchItemsQuery, SearchItemsQueryVariables>
): useLazyQuery.ResultTuple<SearchItemsQuery, SearchItemsQueryVariables> =>
  useLazyQuery<SearchItemsQuery, SearchItemsQueryVariables>(
    SearchItemsDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchItemsQuery = (
  variables: SearchItemsQueryVariables,
  options?: useQuery.Options<SearchItemsQuery, SearchItemsQueryVariables>
) =>
  useQuery<SearchItemsQuery, SearchItemsQueryVariables>(SearchItemsDocument, {
    variables,
    notifyOnNetworkStatusChange: true,
    ...options,
  });
