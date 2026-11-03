import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";

export class NetworkExceptions {
  static isMissingNetworkError = (error: unknown): boolean =>
    (error instanceof NotegicFetchError || error instanceof NotegicAPIError) &&
    error.unWrap.reason ===
      ExceptionReasonDictionary.client.fetch.missingNetwork;

  static isNetworkRequiredError = (error: unknown): boolean =>
    (error instanceof NotegicFetchError || error instanceof NotegicAPIError) &&
    error.unWrap.reason ===
      ExceptionReasonDictionary.client.fetch.networkRequired;

  static isNetworkFallbackError = (error: unknown): boolean => {
    if (
      NetworkExceptions.isMissingNetworkError(error) ||
      error instanceof TypeError
    )
      return true;
    if (typeof error !== "object" || error === null) return false;

    const target = error as {
      networkError?: unknown;
      cause?: unknown;
      message?: unknown;
    };
    if (target.networkError !== undefined) return true;
    if (target.cause instanceof TypeError) return true;
    if (typeof target.message !== "string") return false;
    const message = target.message.toLowerCase();
    return (
      message.includes("failed to fetch") || message.includes("fetch failed")
    );
  };
}
