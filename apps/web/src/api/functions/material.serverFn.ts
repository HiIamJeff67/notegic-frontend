import { forwardUpstreamSetCookies } from "@/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  CreateMyMaterialRequest,
  CreateMyMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsResponse,
  GetMyMaterialsByRootShelfIdRequest,
  GetMyMaterialsByRootShelfIdResponse,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdResponse,
  MoveMyMaterialsByIdsRequest,
  MoveMyMaterialsByIdsResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  withoutPathParams,
} from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const GetMyMaterialById = createServerFn({ method: "GET" })
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
    const formattedResponse =
      (await response.json()) as GetMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const GetMyMaterialAndItsParentById = createServerFn({
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
      const formattedResponse =
        (await response.json()) as GetMyMaterialAndItsParentByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const GetMyMaterialsByParentSubShelfId = createServerFn({
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as GetMyMaterialsByParentSubShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const GetMyMaterialsByRootShelfId = createServerFn({
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as GetMyMaterialsByRootShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const CreateMyMaterial = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(
          withoutPathParams(request.body, "parentSubShelfId")
        ),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as CreateMyMaterialResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const UpdateMyMaterialById = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "materialId")),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as UpdateMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const MoveMyMaterialById = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "materialId")),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as MoveMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const MoveMyMaterialsByIds = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as MoveMyMaterialsByIdsResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const RestoreMyMaterialById = createServerFn({ method: "POST" })
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(withoutPathParams(request.body, "materialId")),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as RestoreMyMaterialByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const RestoreMyMaterialsByIds = createServerFn({
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as RestoreMyMaterialsByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const DeleteMyMaterialById = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "materialId")),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as DeleteMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const DeleteMyMaterialsByIds = createServerFn({ method: "POST" })
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as DeleteMyMaterialsByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );
