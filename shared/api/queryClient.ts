import { ExceptionReasonDictionary } from "@shared/api/exceptions";
import { isAuthenticationFailure } from "@shared/api/exceptions/auth.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined;

export const makeQueryClient = (): QueryClient => {
  const retryPolicy = (failureCount: number, error: unknown): boolean => {
    if (isAuthenticationFailure(error)) {
      return false;
    }

    if (error instanceof NotegicFetchError) {
      const reason = error.unWrap.reason;
      if (
        reason === ExceptionReasonDictionary.client.fetch.missingNetwork ||
        reason === ExceptionReasonDictionary.client.fetch.networkRequired
      ) {
        return false;
      }
    }

    return failureCount < 1;
  };

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 6 * 60 * 60 * 1000, // 6 hours
        networkMode: "always",
        retry: retryPolicy,
        refetchOnWindowFocus: false,
      },
      mutations: {
        networkMode: "always",
        retry: retryPolicy,
      },
    },
  });
};

export const getQueryClient = (): QueryClient => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};
