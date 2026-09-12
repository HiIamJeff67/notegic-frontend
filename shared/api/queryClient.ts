import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { isAuthenticationFailure } from "@shared/api/exceptions/auth.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined;

const MAX_QUERY_RETRY_COUNT = 1;
const QUERY_RETRY_BASE_DELAY_MS = 1_000;
const QUERY_RETRY_MAX_DELAY_MS = 10_000;

export const makeQueryClient = (): QueryClient => {
  const retryPolicy = (failureCount: number, error: unknown): boolean => {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    )
      return false;
    if (error instanceof NotegicAPIError) {
      const exception = error.unWrap;
      if (
        exception.retryable === false ||
        (exception.status >= 400 && exception.status < 500) ||
        exception.reason === "PermissionDeniedDueToTooManyRequests"
      )
        return false;
    }
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

    return failureCount < MAX_QUERY_RETRY_COUNT;
  };

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 6 * 60 * 60 * 1000, // 6 hours
        networkMode: "always",
        retry: retryPolicy,
        retryDelay: attemptIndex =>
          Math.min(
            QUERY_RETRY_BASE_DELAY_MS * 2 ** attemptIndex,
            QUERY_RETRY_MAX_DELAY_MS
          ),
        refetchOnWindowFocus: false,
      },
      mutations: {
        networkMode: "always",
        retry: retryPolicy,
        retryDelay: attemptIndex =>
          Math.min(
            QUERY_RETRY_BASE_DELAY_MS * 2 ** attemptIndex,
            QUERY_RETRY_MAX_DELAY_MS
          ),
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
