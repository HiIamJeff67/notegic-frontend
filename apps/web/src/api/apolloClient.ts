import { ApolloLink, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-tanstack-start";
import { CurrentAPIBaseURL } from "@shared/api/url";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { tap } from "rxjs";
import { getClientCSRFToken } from "@/api/clientHeaders";
import { searchPaginationPolicy } from "./policies/searchPagination.policy";

export const createApolloClient = () => {
  const apiDomainURL = import.meta.env.VITE_API_DOMAIN_URL || "";

  const httpLink = new HttpLink({
    uri: `${apiDomainURL}/${CurrentAPIBaseURL}/graphql/`,
    credentials: "include", // for including the cookies
  });

  const csrfLink = new SetContextLink(previousContext => {
    const csrfToken = getClientCSRFToken();

    return {
      headers: {
        ...previousContext.headers,
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
    };
  });

  const refreshLink = new ApolloLink((operation, forward) =>
    forward(operation).pipe(
      tap(result => {
        const csrfToken = (
          result as { refreshableTokens?: { newCSRFToken?: unknown } }
        ).refreshableTokens?.newCSRFToken;

        if (
          typeof window !== "undefined" &&
          operation.getContext().response?.ok &&
          typeof csrfToken === "string" &&
          csrfToken.trim() !== ""
        ) {
          SessionStorageManipulator.ensureItem(
            SessionStorageKey.csrfToken,
            csrfToken
          );
        }
      })
    )
  );

  const errorLink = new ErrorLink(({ error, forward, operation }) => {
    if (error.name === "AbortError") {
      return undefined;
    }

    if (error) {
      console.error("[GraphQL error] GraphQL Errors:", error);
    }

    return undefined;
  });

  const cache = new InMemoryCache({
    typePolicies: {
      PrivateItem: { keyFields: ["id", "type"] },
      Query: {
        fields: {
          searchRootShelves: searchPaginationPolicy,
          searchSubShelves: searchPaginationPolicy,
          searchItems: searchPaginationPolicy,
          searchBlockPacks: searchPaginationPolicy,
          searchBlocks: searchPaginationPolicy,
          searchMaterials: searchPaginationPolicy,
          searchStations: searchPaginationPolicy,
          searchRoutines: searchPaginationPolicy,
          searchRoutineTasks: searchPaginationPolicy,
          searchRoutineTags: searchPaginationPolicy,
          searchRoutineRecords: searchPaginationPolicy,
          searchRoutineTaskRecords: searchPaginationPolicy,
          searchUsers: searchPaginationPolicy,
          searchThemes: searchPaginationPolicy,
          user: {
            keyArgs: ["id"],
          },
          shelf: {
            keyArgs: ["id"],
          },
        },
      },
      User: {
        fields: {
          shelves: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Shelf: {
        fields: {
          materials: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
    possibleTypes: {
      // Union or Interface can be defined here
    },
  });

  return new ApolloClient({
    link: csrfLink.concat(errorLink).concat(refreshLink).concat(httpLink),
    cache: cache,
  });
};
