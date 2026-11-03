import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { apiErrorSerialization } from "@/api/adapters/exceptionSerialization.adapter";
import { fetchServerFunction } from "@/api/bridges/session.bridge";

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

const sessionMiddleware = createMiddleware({ type: "function" }).client(
  ({ next }) => next({ fetch: fetchServerFunction })
);

const unreachableRemoteMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    if (error instanceof NotegicAPIError) {
      const status = error.unWrap.status;
      if (
        error.unWrap.reason === "InternalServerError" &&
        (status === 502 || status === 503 || status === 504)
      ) {
        throw new NotegicAPIError(FetchClientExceptions.MissingNetwork());
      }
      throw error;
    }

    const cause =
      error instanceof Error &&
      typeof error.cause === "object" &&
      error.cause !== null &&
      "code" in error.cause
        ? String(error.cause.code)
        : "";
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (
      cause === "ECONNREFUSED" ||
      cause === "ENOTFOUND" ||
      cause === "EAI_AGAIN" ||
      cause === "ETIMEDOUT" ||
      cause === "ECONNRESET" ||
      cause === "UND_ERR_CONNECT_TIMEOUT" ||
      cause === "UND_ERR_SOCKET" ||
      cause === "UND_ERR_HEADERS_TIMEOUT" ||
      cause === "UND_ERR_BODY_TIMEOUT" ||
      message.includes("fetch failed") ||
      message.includes("failed to fetch")
    ) {
      throw new NotegicAPIError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  functionMiddleware: [sessionMiddleware, unreachableRemoteMiddleware],
  serializationAdapters: [apiErrorSerialization],
}));
