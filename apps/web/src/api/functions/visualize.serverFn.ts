import { forwardUpstreamSetCookies } from "@/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { getRequestHeader } from "@tanstack/react-start/server";

interface VisualizeServerRequest {
  header?: {
    userAgent?: string;
    csrfToken?: string;
  };
  param: Record<string, unknown>;
}

export async function fetchVisualizeResponse<TResponse>(
  request: VisualizeServerRequest,
  path: string
): Promise<TResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }

  const url =
    import.meta.env.VITE_API_DOMAIN_URL +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
  const inboundCookie = getRequestHeader("cookie");
  const userAgent =
    request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
      ...(request.header?.csrfToken
        ? { "X-CSRF-Token": request.header.csrfToken }
        : {}),
      ...(inboundCookie ? { Cookie: inboundCookie } : {}),
    },
    credentials: "include",
  });

  if (!isJsonResponse(response)) {
    throw new Error("error.encounterUnknownError");
  }
  forwardUpstreamSetCookies(response);
  const formattedResponse = (await response.json()) as TResponse & {
    exception: ConstructorParameters<typeof NotegicException>[0] | null;
    refreshableTokens?: { newCSRFToken?: string };
  };
  if (formattedResponse.exception != null) {
    throw new NotegicAPIError(
      new NotegicException(formattedResponse.exception)
    );
  }

  return formattedResponse;
}
