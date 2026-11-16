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
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

export const ListNotifications = createServerFn({ method: "GET" })
  .inputValidator((data: ListNotificationsRequest) => data)
  .handler(async ({ data: request }) => {
    const params = new URLSearchParams();
    if (request.param?.first !== undefined)
      params.set("first", String(request.param.first));
    if (request.param?.after !== undefined)
      params.set("after", request.param.after);
    const query = params.toString();
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.list}${query ? `?${query}` : ""}`,
      {
        method: "GET",
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
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as ListNotificationsResponse;
  });

export const GetUnreadNotificationCount = createServerFn({ method: "GET" })
  .inputValidator((data: GetUnreadNotificationCountRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.unreadCount}`,
      {
        method: "GET",
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
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as GetUnreadNotificationCountResponse;
  });

export const MarkNotificationsRead = createServerFn({ method: "POST" })
  .inputValidator((data: MarkNotificationsReadRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.read}`,
      {
        method: "PATCH",
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
        body: JSON.stringify(request.body ?? {}),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as MarkNotificationsReadResponse;
  });

export const DeleteNotifications = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteNotificationsRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.delete}`,
      {
        method: "DELETE",
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
        body: JSON.stringify(request.body ?? {}),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as DeleteNotificationsResponse;
  });
