import {
  NotegicAPIError,
  NotegicException,
  NotegicExceptionSchema,
} from "@shared/api/exceptions";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createIsomorphicFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getClientCSRFToken, setClientCSRFToken } from "@/api/clientHeaders";

const retainCSRFToken = createIsomorphicFn()
  .server((refresh: { token: string; previousToken?: string | null }) => {
    setResponseHeader("X-CSRF-Token", refresh.token);
    setResponseHeader("Cache-Control", "no-store");
  })
  .client((refresh: { token: string; previousToken?: string | null }) => {
    if (
      refresh.previousToken === undefined ||
      getClientCSRFToken() === refresh.previousToken
    )
      setClientCSRFToken(refresh.token);
  });

export async function readAPIResponse<T = unknown>(
  response: Response,
  previousToken?: string | null
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

  const refreshableTokens =
    typeof body === "object" && body !== null && "refreshableTokens" in body
      ? body.refreshableTokens
      : undefined;
  const csrfToken =
    response.headers.get("X-CSRF-Token") ??
    (typeof refreshableTokens === "object" &&
    refreshableTokens !== null &&
    "newCSRFToken" in refreshableTokens
      ? refreshableTokens.newCSRFToken
      : undefined);
  if (
    response.status >= 200 &&
    response.status < 500 &&
    response.status !== 401 &&
    response.status !== 403 &&
    typeof csrfToken === "string" &&
    csrfToken.trim() !== ""
  )
    retainCSRFToken({ token: csrfToken, previousToken });

  if (response.status === 204)
    return { success: true, data: null, exception: null } as T;

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
