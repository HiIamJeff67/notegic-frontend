import {
  NotegicAPIError,
  NotegicException,
  NotegicExceptionSchema,
} from "@shared/api/exceptions";
import { isJsonResponse } from "@shared/util/isJsonContext";

export async function readAPIResponse<T = unknown>(
  response: Response
): Promise<T> {
  let body: unknown;
  if (isJsonResponse(response)) {
    try {
      body = await response.json();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        error.name === "AbortError"
      )
        throw error;
      // Malformed upstream bodies must not replace the HTTP error with a parser error.
    }
  }

  const exception =
    typeof body === "object" && body !== null && "exception" in body
      ? body.exception
      : undefined;
  if (exception != null) {
    const parsed = NotegicExceptionSchema.safeParse(exception);
    if (parsed.success) {
      throw new NotegicAPIError(
        new NotegicException(parsed.data, response.status)
      );
    }
  }

  if (!response.ok || body == null || exception != null) {
    throw new NotegicAPIError(
      new NotegicException(
        {
          reason: "InternalServerError",
          domain: "Gateway",
          operation: "ReadResponse",
          message: "Unable to read the API response.",
          retryable: false,
        },
        response.status
      )
    );
  }

  return body as T;
}
