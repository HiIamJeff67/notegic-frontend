import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import type {
  CreateMyAPIKeyRequest,
  CreateMyAPIKeyResponse,
  ListMyAPIKeysRequest,
  ListMyAPIKeysResponse,
  RevokeMyAPIKeyRequest,
  RevokeMyAPIKeyResponse,
} from "@shared/api/interfaces/apiKey.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

const toAPIKeyException = (exception: unknown): NotegicException => {
  const value =
    typeof exception === "object" && exception !== null
      ? (exception as Record<string, unknown>)
      : {};
  const status =
    typeof value.status === "number" && value.status > 0 ? value.status : 500;

  return new NotegicException({
    code:
      typeof value.code === "number" && value.code > 0 ? value.code : status,
    prefix:
      typeof value.prefix === "string"
        ? value.prefix
        : typeof value.domain === "string"
          ? value.domain
          : "Gateway",
    reason:
      typeof value.reason === "string" ? value.reason : "APIKeyRequestFailed",
    message:
      typeof value.message === "string"
        ? value.message
        : "API key request failed.",
    status,
    retryable: value.retryable === true,
    ...(value.details !== undefined ? { details: value.details } : {}),
    ...(typeof value.origin === "string" ? { origin: value.origin } : {}),
  });
};

type APIKeyRequest = {
  header?: { userAgent?: string; csrfToken?: string };
  body?: unknown;
  param?: { publicId?: string };
};

const fetchAPIKeyResponse = async <T>(
  request: APIKeyRequest,
  path: string,
  method: "GET" | "POST" | "DELETE"
): Promise<T> => {
  const inboundCookie = getRequestHeader("cookie");
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${path}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          getRequestHeader("User-Agent") ??
          "unknown",
        ...(request.header?.csrfToken
          ? { "X-CSRF-Token": request.header.csrfToken }
          : {}),
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      ...(method === "GET"
        ? {}
        : { body: JSON.stringify(request.body ?? {}) }),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error("error.encounterUnknownError");
  }
  forwardUpstreamSetCookies(response);
  const formattedResponse = (await response.json()) as T & {
    exception?: unknown;
  };
  if (formattedResponse.exception != null) {
    throw new NotegicAPIError(
      toAPIKeyException(formattedResponse.exception)
    );
  }
  return formattedResponse;
};

export const CreateMyAPIKey = createServerFn({ method: "POST" })
  .inputValidator((data: CreateMyAPIKeyRequest) => data)
  .handler(
    ({ data: request }): Promise<CreateMyAPIKeyResponse> =>
      fetchAPIKeyResponse(
        request,
        APIURLPathDictionary.apiKey.create,
        "POST"
      )
  );

export const ListMyAPIKeys = createServerFn({ method: "GET" })
  .inputValidator((data: ListMyAPIKeysRequest) => data)
  .handler(
    ({ data: request }): Promise<ListMyAPIKeysResponse> =>
      fetchAPIKeyResponse(request, APIURLPathDictionary.apiKey.list, "GET")
  );

export const RevokeMyAPIKey = createServerFn({ method: "POST" })
  .inputValidator((data: RevokeMyAPIKeyRequest) => data)
  .handler(({ data: request }): Promise<RevokeMyAPIKeyResponse> =>
    fetchAPIKeyResponse(
      request,
      APIURLPathDictionary.apiKey.revoke(request.param.publicId),
      "DELETE"
    )
  );
