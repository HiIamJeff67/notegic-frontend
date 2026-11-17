import { ServerError } from "@apollo/client/errors";
import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";

export class NetworkExceptions {
  static isMissingNetworkError = (error: unknown): boolean =>
    (error instanceof NotegicFetchError || error instanceof NotegicAPIError) &&
    (error.unWrap.reason ===
      ExceptionReasonDictionary.client.fetch.missingNetwork ||
      (error instanceof NotegicAPIError &&
        error.unWrap.reason === "InternalServerError" &&
        [502, 503, 504].includes(error.unWrap.status)));

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
    if (ServerError.is(error)) {
      return [502, 503, 504].includes(error.statusCode);
    }
    if (typeof error !== "object" || error === null) return false;

    const target = error as {
      networkError?: unknown;
      cause?: unknown;
      message?: unknown;
    };
    if (target.networkError !== undefined && target.networkError !== error) {
      return NetworkExceptions.isNetworkFallbackError(target.networkError);
    }
    if (target.cause instanceof TypeError) return true;
    if (typeof target.message !== "string") return false;
    const message = target.message.toLowerCase();
    return (
      message.includes("failed to fetch") || message.includes("fetch failed")
    );
  };
}
