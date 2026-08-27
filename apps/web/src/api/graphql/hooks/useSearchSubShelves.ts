import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchSubShelvesDocument,
  type SearchSubShelvesQuery,
  type SearchSubShelvesQueryVariables,
} from "@shared/api/graphql/generated/graphql";

export const useSearchSubShelvesLazyQuery = (
  options?: useLazyQuery.Options<
    SearchSubShelvesQuery,
    SearchSubShelvesQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchSubShelvesQuery,
  SearchSubShelvesQueryVariables
> =>
  useLazyQuery<SearchSubShelvesQuery, SearchSubShelvesQueryVariables>(
    SearchSubShelvesDocument,
    {
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );

export const useSearchSubShelvesQuery = (
  variables: SearchSubShelvesQueryVariables,
  options?: useQuery.Options<
    SearchSubShelvesQuery,
    SearchSubShelvesQueryVariables
  >
) =>
  useQuery<SearchSubShelvesQuery, SearchSubShelvesQueryVariables>(
    SearchSubShelvesDocument,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      ...options,
    }
  );
