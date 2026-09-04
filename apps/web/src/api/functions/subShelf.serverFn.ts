import { forwardUpstreamSetCookies } from "@/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
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
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  withoutPathParams,
} from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const GetMySubShelfById = createServerFn({ method: "GET" })
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
      (await response.json()) as GetMySubShelfByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const GetMySubShelvesByPrevSubShelfId = createServerFn({
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
        (await response.json()) as GetMySubShelvesByPrevSubShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const GetMySubShelvesByRootShelfId = createServerFn({
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
        (await response.json()) as GetMySubShelvesByRootShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const GetMySubShelvesAndItemsByPrevSubShelfId = createServerFn({
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
        (await response.json()) as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const CreateSubShelfByRootShelfId = createServerFn({
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateSubShelfByRootShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const CreateSubShelvesByRootShelfIds = createServerFn({
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
        (await response.json()) as CreateSubShelvesByRootShelfIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const UpdateMySubShelfById = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as UpdateMySubShelfByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const UpdateMySubShelvesByIds = createServerFn({
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
        (await response.json()) as UpdateMySubShelvesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const MoveMySubShelf = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(
          withoutPathParams(request.body, "sourceSubShelfId")
        ),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as MoveMySubShelfResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const MoveMySubShelvesByRootShelfId = createServerFn({ method: "POST" })
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
        (await response.json()) as MoveMySubShelvesByRootShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const MoveMySubShelvesByRootShelfIds = createServerFn({ method: "POST" })
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
        (await response.json()) as MoveMySubShelvesByRootShelfIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const RestoreMySubShelfById = createServerFn({ method: "POST" })
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
            ...(request.header?.csrfToken
              ? { "X-CSRF-Token": request.header.csrfToken }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as RestoreMySubShelfByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const RestoreMySubShelvesByIds = createServerFn({
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
        (await response.json()) as RestoreMySubShelvesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const DeleteMySubShelfById = createServerFn({ method: "POST" })
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as DeleteMySubShelfByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const DeleteMySubShelvesByIds = createServerFn({
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
        (await response.json()) as DeleteMySubShelvesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );
