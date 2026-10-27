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
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

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
      "X-CSRF-Token":
        getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
      ...(inboundCookie ? { Cookie: inboundCookie } : {}),
    },
    ...(method === "GET" ? {} : { body: JSON.stringify(request.body ?? {}) }),
    credentials: "include",
  });

  forwardUpstreamSetCookies(response);
  const formattedResponse = (await readAPIResponse(response)) as T & {
    exception?: unknown;
  };

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
