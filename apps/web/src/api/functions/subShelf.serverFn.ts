import {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
  GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelvesByRootShelfIdResponse,
  HardDeleteMySubShelvesByIdsRequest,
  HardDeleteMySubShelvesByIdsResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfResponse,
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdResponse,
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
  UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsResponse,
} from "@shared/api/interfaces/subShelf.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { withoutPathParams } from "@/api/functions/helpers/body";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const GetMySubShelfByIdRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetMySubShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMySubShelfByIdResponse> => {
    const { subShelfId, isDeleted = false } = request.param;
    const params = new URLSearchParams({ isDeleted: String(isDeleted) });
    let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelfById(subShelfId)}?${params}`;
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
    )) as GetMySubShelfByIdResponse;

    return formattedResponse;
  });

export const GetMySubShelfById = (request: GetMySubShelfByIdRequest) =>
  GetMySubShelfByIdRpc({ data: request });

const GetMySubShelvesByPrevSubShelfIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMySubShelvesByPrevSubShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
      const { prevSubShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({ areDeleted: String(areDeleted) });
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesByPrevSubShelfId(prevSubShelfId)}?${params}`;
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
      )) as GetMySubShelvesByPrevSubShelfIdResponse;

      return formattedResponse;
    }
  );

export const GetMySubShelvesByPrevSubShelfId = (
  request: GetMySubShelvesByPrevSubShelfIdRequest
) => GetMySubShelvesByPrevSubShelfIdRpc({ data: request });

const GetMySubShelvesByRootShelfIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMySubShelvesByRootShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMySubShelvesByRootShelfIdResponse> => {
      const { rootShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({ areDeleted: String(areDeleted) });
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesByRootShelfId(rootShelfId)}?${params}`;
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
      )) as GetMySubShelvesByRootShelfIdResponse;

      return formattedResponse;
    }
  );

export const GetMySubShelvesByRootShelfId = (
  request: GetMySubShelvesByRootShelfIdRequest
) => GetMySubShelvesByRootShelfIdRpc({ data: request });

const GetMySubShelvesAndItemsByPrevSubShelfIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: GetMySubShelvesAndItemsByPrevSubShelfIdRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
      const { prevSubShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({ areDeleted: String(areDeleted) });
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesAndItemsByPrevSubShelfId(prevSubShelfId)}?${params}`;
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
      )) as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;

      return formattedResponse;
    }
  );

export const GetMySubShelvesAndItemsByPrevSubShelfId = (
  request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
) => GetMySubShelvesAndItemsByPrevSubShelfIdRpc({ data: request });

const CreateSubShelfByRootShelfIdRpc = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateSubShelfByRootShelfIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<CreateSubShelfByRootShelfIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelfByRootShelfId(request.body.rootShelfId)}`,
        {
          method: "POST",
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
      )) as CreateSubShelfByRootShelfIdResponse;

      return formattedResponse;
    }
  );

export const CreateSubShelfByRootShelfId = (
  request: CreateSubShelfByRootShelfIdRequest
) => CreateSubShelfByRootShelfIdRpc({ data: request });

const CreateSubShelvesByRootShelfIdsRpc = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateSubShelvesByRootShelfIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelvesByRootShelfIds}`,
        {
          method: "POST",
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
      )) as CreateSubShelvesByRootShelfIdsResponse;

      return formattedResponse;
    }
  );

export const CreateSubShelvesByRootShelfIds = (
  request: CreateSubShelvesByRootShelfIdsRequest
) => CreateSubShelvesByRootShelfIdsRpc({ data: request });

const UpdateMySubShelfByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMySubShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMySubShelfByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelfById(request.body.subShelfId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as UpdateMySubShelfByIdResponse;

    return formattedResponse;
  });

export const UpdateMySubShelfById = (request: UpdateMySubShelfByIdRequest) =>
  UpdateMySubShelfByIdRpc({ data: request });

const UpdateMySubShelvesByIdsRpc = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdateMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelvesByIds}`,
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
      )) as UpdateMySubShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const UpdateMySubShelvesByIds = (
  request: UpdateMySubShelvesByIdsRequest
) => UpdateMySubShelvesByIdsRpc({ data: request });

const MoveMySubShelfRpc = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMySubShelfRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMySubShelfResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelf(request.body.sourceSubShelfId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(
          withoutPathParams(request.body, "sourceSubShelfId")
        ),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as MoveMySubShelfResponse;

    return formattedResponse;
  });

export const MoveMySubShelf = (request: MoveMySubShelfRequest) =>
  MoveMySubShelfRpc({ data: request });

const MoveMySubShelvesByRootShelfIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMySubShelvesByRootShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelvesByRootShelfId}`,
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
      )) as MoveMySubShelvesByRootShelfIdResponse;

      return formattedResponse;
    }
  );

export const MoveMySubShelvesByRootShelfId = (
  request: MoveMySubShelvesByRootShelfIdRequest
) => MoveMySubShelvesByRootShelfIdRpc({ data: request });

const MoveMySubShelvesByRootShelfIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMySubShelvesByRootShelfIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelvesByRootShelfIds}`,
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
      )) as MoveMySubShelvesByRootShelfIdsResponse;

      return formattedResponse;
    }
  );

export const MoveMySubShelvesByRootShelfIds = (
  request: MoveMySubShelvesByRootShelfIdsRequest
) => MoveMySubShelvesByRootShelfIdsRpc({ data: request });

const RestoreMySubShelfByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMySubShelfByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMySubShelfByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelfById(request.body.subShelfId)}`,
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
          body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as RestoreMySubShelfByIdResponse;

      return formattedResponse;
    }
  );

export const RestoreMySubShelfById = (request: RestoreMySubShelfByIdRequest) =>
  RestoreMySubShelfByIdRpc({ data: request });

const RestoreMySubShelvesByIdsRpc = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelvesByIds}`,
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
      )) as RestoreMySubShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const RestoreMySubShelvesByIds = (
  request: RestoreMySubShelvesByIdsRequest
) => RestoreMySubShelvesByIdsRpc({ data: request });

const DeleteMySubShelfByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMySubShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMySubShelfByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelfById(request.body.subShelfId)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as DeleteMySubShelfByIdResponse;

    return formattedResponse;
  });

export const DeleteMySubShelfById = (request: DeleteMySubShelfByIdRequest) =>
  DeleteMySubShelfByIdRpc({ data: request });

const DeleteMySubShelvesByIdsRpc = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelvesByIds}`,
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
      )) as DeleteMySubShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const DeleteMySubShelvesByIds = (
  request: DeleteMySubShelvesByIdsRequest
) => DeleteMySubShelvesByIdsRpc({ data: request });

const HardDeleteMySubShelvesByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.hardDeleteMySubShelvesByIds}`,
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
      )) as HardDeleteMySubShelvesByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMySubShelvesByIds = (
  request: HardDeleteMySubShelvesByIdsRequest
) => HardDeleteMySubShelvesByIdsRpc({ data: request });
