import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { searchQueryFieldPolicies } from "@/api/hooks/graphql/policies/searchQueryFields.policy";
import { getAccessToken } from "./tokens/accessToken";

export const createApolloClient = () => {
  const apiDomainURL = APIURLPathDictionary.origin();
  const unavailable = APIURLPathDictionary.notFound();
  const httpLink = new HttpLink({
    uri:
      apiDomainURL === unavailable
        ? apiDomainURL
        : `${apiDomainURL}/${CurrentAPIBaseURL}/graphql/`,
    credentials: "omit",
  });
  const authorizationLink = new SetContextLink(previousContext => {
    const headers = new Headers(previousContext.headers);
    const accessToken = getAccessToken();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    else headers.delete("Authorization");
    headers.delete("X-CSRF-Token");
    return { headers: Object.fromEntries(headers) };
  });
  const cache = new InMemoryCache({
    typePolicies: {
      PrivateItem: { keyFields: ["id", "type"] },
      Query: {
        fields: {
          ...searchQueryFieldPolicies,
          user: { keyArgs: ["id"] },
          shelf: { keyArgs: ["id"] },
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
  });

  return new ApolloClient({
    link: authorizationLink.concat(httpLink),
    cache,
  });
};
