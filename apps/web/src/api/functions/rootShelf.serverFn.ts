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
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { withoutPathParams } from "@/api/functions/helpers/body";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const GetMyRootShelfByIdRpc = createServerFn({ method: "GET" })
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
    const formattedResponse = (await format(
      response
    )) as GetMyRootShelfByIdResponse;

    return formattedResponse;
  });

export const GetMyRootShelfById = (request: GetMyRootShelfByIdRequest) =>
  GetMyRootShelfByIdRpc({ data: request });

const CreateRootShelfRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(
      response
    )) as CreateRootShelfResponse;

    return formattedResponse;
  });

export const CreateRootShelf = (request: CreateRootShelfRequest) =>
  CreateRootShelfRpc({ data: request });

const CreateRootShelvesRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(
      response
    )) as CreateRootShelvesResponse;

    return formattedResponse;
  });

export const CreateRootShelves = (request: CreateRootShelvesRequest) =>
  CreateRootShelvesRpc({ data: request });

const UpsertRootShelfPermissionRpc = createServerFn({ method: "POST" })
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
      const formattedResponse = (await format(
        response
      )) as UpsertRootShelfPermissionResponse;

      return formattedResponse;
    }
  );

export const UpsertRootShelfPermission = (
  request: UpsertRootShelfPermissionRequest
) => UpsertRootShelfPermissionRpc({ data: request });

const DeleteRootShelfPermissionsRpc = createServerFn({ method: "POST" })
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

      const formattedResponse = (await format(
        response
      )) as DeleteRootShelfPermissionsResponse;

      return formattedResponse;
    }
  );

export const DeleteRootShelfPermissions = (
  request: DeleteRootShelfPermissionsRequest
) => DeleteRootShelfPermissionsRpc({ data: request });

const TransferMyRootShelfOwnershipRpc = createServerFn({ method: "POST" })
  .inputValidator((data: TransferMyRootShelfOwnershipRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.transferOwnership(request.param.rootShelfId as UUID)}`,
      {
        method: "POST",
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
    return (await format(response)) as TransferMyRootShelfOwnershipResponse;
  });

export const TransferMyRootShelfOwnership = (
  request: TransferMyRootShelfOwnershipRequest
) => TransferMyRootShelfOwnershipRpc({ data: request });

const LeaveMyRootShelfRpc = createServerFn({ method: "POST" })
  .inputValidator((data: LeaveMyRootShelfRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.leave(request.param.rootShelfId as UUID)}`,
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
        ...(request.body !== undefined
          ? { body: JSON.stringify(request.body) }
          : {}),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as LeaveMyRootShelfResponse;
  });

export const LeaveMyRootShelf = (request: LeaveMyRootShelfRequest) =>
  LeaveMyRootShelfRpc({ data: request });

const UpdateMyRootShelfByIdRpc = createServerFn({ method: "POST" })
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
      const formattedResponse = (await format(
        response
      )) as UpdateMyRootShelfByIdResponse;

      return formattedResponse;
    }
  );

export const UpdateMyRootShelfById = (request: UpdateMyRootShelfByIdRequest) =>
  UpdateMyRootShelfByIdRpc({ data: request });

const UpdateMyRootShelvesByIdsRpc = createServerFn({
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
      const formattedResponse = (await format(
        response
      )) as UpdateMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const UpdateMyRootShelvesByIds = (
  request: UpdateMyRootShelvesByIdsRequest
) => UpdateMyRootShelvesByIdsRpc({ data: request });

const RestoreMyRootShelfByIdRpc = createServerFn({ method: "POST" })
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
      const formattedResponse = (await format(
        response
      )) as RestoreMyRootShelfByIdResponse;

      return formattedResponse;
    }
  );

export const RestoreMyRootShelfById = (
  request: RestoreMyRootShelfByIdRequest
) => RestoreMyRootShelfByIdRpc({ data: request });

const RestoreMyRootShelvesByIdsRpc = createServerFn({
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
      const formattedResponse = (await format(
        response
      )) as RestoreMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const RestoreMyRootShelvesByIds = (
  request: RestoreMyRootShelvesByIdsRequest
) => RestoreMyRootShelvesByIdsRpc({ data: request });

const DeleteMyRootShelfByIdRpc = createServerFn({ method: "POST" })
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
      const formattedResponse = (await format(
        response
      )) as DeleteMyRootShelfByIdResponse;

      return formattedResponse;
    }
  );

export const DeleteMyRootShelfById = (request: DeleteMyRootShelfByIdRequest) =>
  DeleteMyRootShelfByIdRpc({ data: request });

const DeleteMyRootShelvesByIdsRpc = createServerFn({
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
      const formattedResponse = (await format(
        response
      )) as DeleteMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const DeleteMyRootShelvesByIds = (
  request: DeleteMyRootShelvesByIdsRequest
) => DeleteMyRootShelvesByIdsRpc({ data: request });

const HardDeleteMyRootShelvesByIdsRpc = createServerFn({ method: "POST" })
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
      const formattedResponse = (await format(
        response
      )) as HardDeleteMyRootShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyRootShelvesByIds = (
  request: HardDeleteMyRootShelvesByIdsRequest
) => HardDeleteMyRootShelvesByIdsRpc({ data: request });
