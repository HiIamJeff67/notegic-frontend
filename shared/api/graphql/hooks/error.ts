import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { ExceptionReasonDictionary } from "@shared/api/exceptions";

export const isNetworkFallbackError = (error: unknown): boolean => {
  if (error instanceof TypeError) return true;
  if (
    error instanceof NotegicFetchError &&
    error.unWrap.reason ===
      ExceptionReasonDictionary.client.fetch.missingNetwork
  ) {
    return true;
  }
  if (typeof error !== "object" || error === null) return false;

  const target = error as {
    networkError?: unknown;
    cause?: unknown;
    message?: unknown;
  };
  if (target.networkError !== undefined) return true;
  if (target.cause instanceof TypeError) return true;
  if (typeof target.message !== "string") return false;
  return target.message.toLowerCase().includes("failed to fetch");
};
