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
import { getAccessToken } from "../tokens/accessToken";

export const ListNotifications = async (
  request: ListNotificationsRequest
): Promise<ListNotificationsResponse> => {
  const params = new URLSearchParams();
  if (request.param?.first !== undefined)
    params.set("first", String(request.param.first));
  if (request.param?.after !== undefined)
    params.set("after", request.param.after);
  const query = params.toString();
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.list}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined"
            ? navigator.userAgent
            : "unknown") ??
          "unknown",
      },
      credentials: "omit",
    }
  );
  return (await response.json()) as ListNotificationsResponse;
};

export const GetUnreadNotificationCount = async (
  request: GetUnreadNotificationCountRequest
): Promise<GetUnreadNotificationCountResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.unreadCount}`,
    {
      method: "GET",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined"
            ? navigator.userAgent
            : "unknown") ??
          "unknown",
      },
      credentials: "omit",
    }
  );
  return (await response.json()) as GetUnreadNotificationCountResponse;
};

export const MarkNotificationsRead = async (
  request: MarkNotificationsReadRequest
): Promise<MarkNotificationsReadResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.read}`,
    {
      method: "PATCH",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined"
            ? navigator.userAgent
            : "unknown") ??
          "unknown",
      },
      body: JSON.stringify(request.body ?? {}),
      credentials: "omit",
    }
  );
  return (await response.json()) as MarkNotificationsReadResponse;
};

export const DeleteNotifications = async (
  request: DeleteNotificationsRequest
): Promise<DeleteNotificationsResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.notification.delete}`,
    {
      method: "DELETE",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined"
            ? navigator.userAgent
            : "unknown") ??
          "unknown",
      },
      body: JSON.stringify(request.body ?? {}),
      credentials: "omit",
    }
  );
  return (await response.json()) as DeleteNotificationsResponse;
};
