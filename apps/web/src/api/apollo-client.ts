import { HttpLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-tanstack-start";
import { CurrentAPIBaseURL } from "@shared/api/url";

export const createApolloClient = () => {
  const apiDomainURL = import.meta.env.VITE_API_DOMAIN_URL || "";

  const httpLink = new HttpLink({
    uri: `${apiDomainURL}/${CurrentAPIBaseURL}/graphql/`,
    credentials: "include", // for including the cookies
  });

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
      Query: {
        fields: {
          searchRootShelves: {
            keyArgs: ["input", ["query", "sortBy", "sortOrder"]],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;

              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }

              return incoming;
            },
          },
          searchItems: {
            keyArgs: [
              "input",
              [
                "query",
                "sortBy",
                "sortOrder",
                "rootShelfId",
                "parentSubShelfId",
              ],
            ],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }
              return incoming;
            },
          },
          searchStations: {
            keyArgs: ["input", ["query", "sortBy", "sortOrder"]],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }
              return incoming;
            },
          },
          searchRoutines: {
            keyArgs: [
              "input",
              ["query", "sortBy", "sortOrder", "stationIds", "tagIds"],
            ],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }
              return incoming;
            },
          },
          searchRoutineTags: {
            keyArgs: ["input", ["query", "sortBy", "sortOrder"]],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }
              return incoming;
            },
          },
          searchRoutineTasks: {
            keyArgs: ["input", ["query", "sortBy", "sortOrder", "stationId"]],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }
              return incoming;
            },
          },
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
    link: errorLink.concat(httpLink),
    cache: cache,
  });
};
