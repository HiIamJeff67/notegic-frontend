import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import type {
  DeleteNotificationsRequest,
  DeleteNotificationsResponse,
  GetUnreadNotificationCountRequest,
  GetUnreadNotificationCountResponse,
  ListNotificationsRequest,
  ListNotificationsResponse,
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
} from "@shared/api/interfaces/notification.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

const toNotificationException = (exception: unknown): NotegicException => {
  const value =
    typeof exception === "object" && exception !== null
      ? (exception as Record<string, unknown>)
      : {};
  const status =
    typeof value.status === "number" && value.status > 0 ? value.status : 500;
  const reason =
    typeof value.reason === "string"
      ? value.reason
      : "NotificationRequestFailed";
  const message =
    typeof value.message === "string"
      ? value.message
      : "Notification request failed.";

  return new NotegicException({
    code:
      typeof value.code === "number" && value.code > 0 ? value.code : status,
    prefix:
      typeof value.prefix === "string"
        ? value.prefix
        : typeof value.domain === "string"
          ? value.domain
          : "Gateway",
    reason,
    message,
    status,
    retryable: value.retryable === true,
    ...(value.details !== undefined ? { details: value.details } : {}),
    ...(typeof value.origin === "string" ? { origin: value.origin } : {}),
  });
};

const fetchNotificationResponse = async <T>(
  request: {
    header?: { userAgent?: string; csrfToken?: string };
    body?: unknown;
    param?: { first?: number; after?: string };
  },
  path: string,
  method: "GET" | "PATCH" | "DELETE"
): Promise<T> => {
  const params = new URLSearchParams();
  if (method === "GET") {
    if (request.param?.first !== undefined)
      params.set("first", String(request.param.first));
    if (request.param?.after !== undefined)
      params.set("after", request.param.after);
  }
  const query = params.toString();
  const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${path}${query ? `?${query}` : ""}`;
  const inboundCookie = getRequestHeader("cookie");
  const response = await fetch(url, {
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
    ...(method === "GET" ? {} : { body: JSON.stringify(request.body ?? {}) }),
    credentials: "include",
  });
  if (!isJsonResponse(response)) {
    throw new Error("error.encounterUnknownError");
  }
  forwardUpstreamSetCookies(response);
  const formattedResponse = (await response.json()) as T & {
    exception?: unknown;
  };
  if (formattedResponse.exception != null) {
    throw new NotegicAPIError(
      toNotificationException(formattedResponse.exception)
    );
  }
  return formattedResponse;
};

export const ListNotifications = createServerFn({ method: "GET" })
  .inputValidator((data: ListNotificationsRequest) => data)
  .handler(
    ({ data: request }): Promise<ListNotificationsResponse> =>
      fetchNotificationResponse(
        request,
        APIURLPathDictionary.notification.list,
        "GET"
      )
  );

export const GetUnreadNotificationCount = createServerFn({ method: "GET" })
  .inputValidator((data: GetUnreadNotificationCountRequest) => data)
  .handler(
    ({ data: request }): Promise<GetUnreadNotificationCountResponse> =>
      fetchNotificationResponse(
        request,
        APIURLPathDictionary.notification.unreadCount,
        "GET"
      )
  );

export const MarkNotificationsRead = createServerFn({ method: "POST" })
  .inputValidator((data: MarkNotificationsReadRequest) => data)
  .handler(
    ({ data: request }): Promise<MarkNotificationsReadResponse> =>
      fetchNotificationResponse(
        request,
        APIURLPathDictionary.notification.read,
        "PATCH"
      )
  );

export const DeleteNotifications = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteNotificationsRequest) => data)
  .handler(
    ({ data: request }): Promise<DeleteNotificationsResponse> =>
      fetchNotificationResponse(
        request,
        APIURLPathDictionary.notification.delete,
        "DELETE"
      )
  );
