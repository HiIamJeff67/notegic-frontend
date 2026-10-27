import type { UUID } from "node:crypto";
import {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsResponse,
  DeleteRootShelfPermissionsRequest,
  DeleteRootShelfPermissionsResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  HardDeleteMyRootShelvesByIdsRequest,
  HardDeleteMyRootShelvesByIdsResponse,
  LeaveMyRootShelfRequest,
  LeaveMyRootShelfResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsResponse,
  TransferMyRootShelfOwnershipRequest,
  TransferMyRootShelfOwnershipResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsResponse,
  UpsertRootShelfPermissionRequest,
  UpsertRootShelfPermissionResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  withoutPathParams,
} from "@shared/api/url";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const GetMyRootShelfById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyRootShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyRootShelfByIdResponse> => {
    const { rootShelfId, isDeleted = false } = request.param;
    const params = new URLSearchParams({ isDeleted: String(isDeleted) });
    let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.getMyRootShelfById(rootShelfId)}?${params}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as GetMyRootShelfByIdResponse;

    return formattedResponse;
  });

export const CreateRootShelf = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRootShelfRequest) => data)
  .handler(async ({ data: request }): Promise<CreateRootShelfResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.createRootShelf}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as CreateRootShelfResponse;

    return formattedResponse;
  });

export const CreateRootShelves = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRootShelvesRequest) => data)
  .handler(async ({ data: request }): Promise<CreateRootShelvesResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.createRootShelves}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as CreateRootShelvesResponse;

    return formattedResponse;
  });

export const UpsertRootShelfPermission = createServerFn({ method: "POST" })
  .inputValidator((data: UpsertRootShelfPermissionRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpsertRootShelfPermissionResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.upsertRootShelfPermission(
          request.param.rootShelfId as UUID,
          request.param.userPublicId as UUID
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as UpsertRootShelfPermissionResponse;

      return formattedResponse;
    }
  );

export const DeleteRootShelfPermissions = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteRootShelfPermissionsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteRootShelfPermissionsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.deleteRootShelfPermissions(
          request.param.rootShelfId as UUID
        )}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);

      const formattedResponse = (await readAPIResponse(
        response
      )) as DeleteRootShelfPermissionsResponse;

      return formattedResponse;
    }
  );

const fetchRootShelfMembership = async <T>(
  request: {
    header?: { userAgent?: string; csrfToken?: string };
    body?: unknown;
  },
  path: string,
  method: "POST" | "DELETE"
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      ...(method === "POST" || request.body !== undefined
        ? { body: JSON.stringify(request.body ?? {}) }
        : {}),
      credentials: "include",
    }
  );
  forwardUpstreamSetCookies(response);

  const formattedResponse = (await readAPIResponse(response)) as T & {
    exception?: unknown;
    refreshableTokens?: { newCSRFToken?: string };
  };

  return formattedResponse;
};

export const TransferMyRootShelfOwnership = createServerFn({ method: "POST" })
  .inputValidator((data: TransferMyRootShelfOwnershipRequest) => data)
  .handler(
    ({ data: request }): Promise<TransferMyRootShelfOwnershipResponse> =>
      fetchRootShelfMembership(
        request,
        APIURLPathDictionary.rootShelf.transferOwnership(
          request.param.rootShelfId as UUID
        ),
        "POST"
      )
  );

export const LeaveMyRootShelf = createServerFn({ method: "POST" })
  .inputValidator((data: LeaveMyRootShelfRequest) => data)
  .handler(
    ({ data: request }): Promise<LeaveMyRootShelfResponse> =>
      fetchRootShelfMembership(
        request,
        APIURLPathDictionary.rootShelf.leave(request.param.rootShelfId as UUID),
        "DELETE"
      )
  );

export const UpdateMyRootShelfById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyRootShelfByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyRootShelfByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.updateMyRootShelfById(request.body.rootShelfId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as UpdateMyRootShelfByIdResponse;

      return formattedResponse;
    }
  );

export const UpdateMyRootShelvesByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdateMyRootShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyRootShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.updateMyRootShelvesByIds}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as UpdateMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const RestoreMyRootShelfById = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyRootShelfByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyRootShelfByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.restoreMyRootShelfById(request.body.rootShelfId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as RestoreMyRootShelfByIdResponse;

      return formattedResponse;
    }
  );

export const RestoreMyRootShelvesByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMyRootShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyRootShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.restoreMyRootShelvesByIds}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as RestoreMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const DeleteMyRootShelfById = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyRootShelfByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyRootShelfByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.deleteMyRootShelfById(request.body.rootShelfId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as DeleteMyRootShelfByIdResponse;

      return formattedResponse;
    }
  );

export const DeleteMyRootShelvesByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteMyRootShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyRootShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.deleteMyRootShelvesByIds}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as DeleteMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyRootShelvesByIds = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRootShelvesByIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<HardDeleteMyRootShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.hardDeleteMyRootShelvesByIds}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as HardDeleteMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );
