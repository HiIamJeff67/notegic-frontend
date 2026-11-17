import {
  CreateMaterialObjectTicketRequest,
  CreateMaterialObjectTicketResponse,
  CreateMyMaterialRequest,
  CreateMyMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsResponse,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
  GetMyMaterialsByRootShelfIdRequest,
  GetMyMaterialsByRootShelfIdResponse,
  HardDeleteMyMaterialsByIdsRequest,
  HardDeleteMyMaterialsByIdsResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdResponse,
  MoveMyMaterialsByIdsRequest,
  MoveMyMaterialsByIdsResponse,
  ResolveMaterialObjectTicketRequest,
  ResolveMaterialObjectTicketResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { withoutPathParams } from "@/api/functions/helpers/body";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const GetMyMaterialByIdRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyMaterialByIdResponse> => {
    const { materialId, isDeleted = false } = request.param;
    const params = new URLSearchParams({ isDeleted: String(isDeleted) });
    let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialById(materialId)}?${params}`;
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
    )) as GetMyMaterialByIdResponse;

    return formattedResponse;
  });

export const GetMyMaterialById = (request: GetMyMaterialByIdRequest) =>
  GetMyMaterialByIdRpc({ data: request });

const GetMyMaterialAndItsParentByIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyMaterialAndItsParentByIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyMaterialAndItsParentByIdResponse> => {
      const { materialId, isDeleted = false } = request.param;
      const params = new URLSearchParams({ isDeleted: String(isDeleted) });
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialAndItsParentById(materialId)}?${params}`;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
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
      )) as GetMyMaterialAndItsParentByIdResponse;

      return formattedResponse;
    }
  );

export const GetMyMaterialAndItsParentById = (
  request: GetMyMaterialAndItsParentByIdRequest
) => GetMyMaterialAndItsParentByIdRpc({ data: request });

const GetMyMaterialsByParentSubShelfIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyMaterialsByParentSubShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
      const { parentSubShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({
        areDeleted: String(areDeleted),
      }).toString();
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialsByParentSubShelfId(parentSubShelfId)}?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as GetMyMaterialsByParentSubShelfIdResponse;

      return formattedResponse;
    }
  );

export const GetMyMaterialsByParentSubShelfId = (
  request: GetMyMaterialsByParentSubShelfIdRequest
) => GetMyMaterialsByParentSubShelfIdRpc({ data: request });

const GetMyMaterialsByRootShelfIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyMaterialsByRootShelfIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyMaterialsByRootShelfIdResponse> => {
      const { rootShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({
        areDeleted: String(areDeleted),
      }).toString();
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialsByRootShelfId(rootShelfId)}?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as GetMyMaterialsByRootShelfIdResponse;

      return formattedResponse;
    }
  );

export const GetMyMaterialsByRootShelfId = (
  request: GetMyMaterialsByRootShelfIdRequest
) => GetMyMaterialsByRootShelfIdRpc({ data: request });

const CreateMyMaterialRpc = createServerFn({ method: "POST" })
  .inputValidator((data: CreateMyMaterialRequest) => data)
  .handler(async ({ data: request }): Promise<CreateMyMaterialResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createMyMaterial(request.body.parentSubShelfId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(
          withoutPathParams(request.body, "parentSubShelfId")
        ),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as CreateMyMaterialResponse;

    return formattedResponse;
  });

export const CreateMyMaterial = (request: CreateMyMaterialRequest) =>
  CreateMyMaterialRpc({ data: request });

const UpdateMyMaterialByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyMaterialByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.updateMyMaterialById(request.body.materialId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "materialId")),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as UpdateMyMaterialByIdResponse;

    return formattedResponse;
  });

export const UpdateMyMaterialById = (request: UpdateMyMaterialByIdRequest) =>
  UpdateMyMaterialByIdRpc({ data: request });

const MoveMyMaterialByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMyMaterialByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialById(request.body.materialId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "materialId")),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as MoveMyMaterialByIdResponse;

    return formattedResponse;
  });

export const MoveMyMaterialById = (request: MoveMyMaterialByIdRequest) =>
  MoveMyMaterialByIdRpc({ data: request });

const MoveMyMaterialsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMyMaterialsByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMyMaterialsByIdsResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialsByIds}`,
      {
        method: "PUT",
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
    )) as MoveMyMaterialsByIdsResponse;

    return formattedResponse;
  });

export const MoveMyMaterialsByIds = (request: MoveMyMaterialsByIdsRequest) =>
  MoveMyMaterialsByIdsRpc({ data: request });

const RestoreMyMaterialByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyMaterialByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyMaterialByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialById(request.body.materialId)}`,
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
          body: JSON.stringify(withoutPathParams(request.body, "materialId")),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as RestoreMyMaterialByIdResponse;

      return formattedResponse;
    }
  );

export const RestoreMyMaterialById = (request: RestoreMyMaterialByIdRequest) =>
  RestoreMyMaterialByIdRpc({ data: request });

const RestoreMyMaterialsByIdsRpc = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMyMaterialsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyMaterialsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialsByIds}`,
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
      )) as RestoreMyMaterialsByIdsResponse;

      return formattedResponse;
    }
  );

export const RestoreMyMaterialsByIds = (
  request: RestoreMyMaterialsByIdsRequest
) => RestoreMyMaterialsByIdsRpc({ data: request });

const DeleteMyMaterialByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMyMaterialByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialById(request.body.materialId)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "materialId")),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as DeleteMyMaterialByIdResponse;

    return formattedResponse;
  });

export const DeleteMyMaterialById = (request: DeleteMyMaterialByIdRequest) =>
  DeleteMyMaterialByIdRpc({ data: request });

const DeleteMyMaterialsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyMaterialsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyMaterialsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialsByIds}`,
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
      )) as DeleteMyMaterialsByIdsResponse;

      return formattedResponse;
    }
  );

export const DeleteMyMaterialsByIds = (
  request: DeleteMyMaterialsByIdsRequest
) => DeleteMyMaterialsByIdsRpc({ data: request });

const CreateMaterialObjectTicketRpc = createServerFn({ method: "POST" })
  .inputValidator((data: CreateMaterialObjectTicketRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createObjectTicket}`,
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
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as CreateMaterialObjectTicketResponse;
  });

export const CreateMaterialObjectTicket = (
  request: CreateMaterialObjectTicketRequest
) => CreateMaterialObjectTicketRpc({ data: request });

const ResolveMaterialObjectTicketRpc = createServerFn({ method: "POST" })
  .inputValidator((data: ResolveMaterialObjectTicketRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.resolveObjectTicket}`,
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
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as ResolveMaterialObjectTicketResponse;
  });

export const ResolveMaterialObjectTicket = (
  request: ResolveMaterialObjectTicketRequest
) => ResolveMaterialObjectTicketRpc({ data: request });

const HardDeleteMyMaterialsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyMaterialsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyMaterialsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.hardDeleteMyMaterialsByIds}`,
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
      )) as HardDeleteMyMaterialsByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyMaterialsByIds = (
  request: HardDeleteMyMaterialsByIdsRequest
) => HardDeleteMyMaterialsByIdsRpc({ data: request });
