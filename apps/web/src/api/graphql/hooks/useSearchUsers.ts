import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchUsersDocument,
  type SearchUsersQuery,
  type SearchUsersQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchUsersLazyQuery = (
  options?: useLazyQuery.Options<SearchUsersQuery, SearchUsersQueryVariables>
): useLazyQuery.ResultTuple<SearchUsersQuery, SearchUsersQueryVariables> =>
  useLazyQuery<SearchUsersQuery, SearchUsersQueryVariables>(
    SearchUsersDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchUsersQuery = (
  variables: SearchUsersQueryVariables,
  options?: useQuery.Options<SearchUsersQuery, SearchUsersQueryVariables>
) =>
  useQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, {
    variables,
    notifyOnNetworkStatusChange: true,
    ...options,
  });
