import {
  CreateRoutineTagRequest,
  CreateRoutineTagResponse,
  CreateRoutineTagsRequest,
  CreateRoutineTagsResponse,
  GetAllMyRoutineTagsRequest,
  GetAllMyRoutineTagsResponse,
  GetMyRoutineTagByIdRequest,
  GetMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagsByIdsRequest,
  HardDeleteMyRoutineTagsByIdsResponse,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagByIdResponse,
  UpdateMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagsByIdsResponse,
} from "@shared/api/interfaces/routineTag.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  withoutPathParams,
} from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const GetMyRoutineTagById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyRoutineTagByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyRoutineTagByIdResponse> => {
    const params = new URLSearchParams(
      Object.entries(request.param || {}).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (key !== "routineTagId" && value !== undefined && value !== null)
            acc[key] = String(value);
          return acc;
        },
        {}
      )
    );
    if (request.param?.isDeleted === undefined) {
      params.set("isDeleted", "false");
    }
    const query = params.toString();
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routineTag.getMyRoutineTagById(
        request.param.routineTagId
      ) +
      "?" +
      query;
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

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as GetMyRoutineTagByIdResponse;

    return formattedResponse;
  });

export const GetAllMyRoutineTags = createServerFn({ method: "GET" })
  .inputValidator((data: GetAllMyRoutineTagsRequest) => data)
  .handler(async ({ data: request }): Promise<GetAllMyRoutineTagsResponse> => {
    const params = new URLSearchParams({
      areDeleted: String(request.param?.areDeleted ?? false),
    });
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routineTag.getAllMyRoutineTags +
      "?" +
      params.toString();
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

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as GetAllMyRoutineTagsResponse;

    return formattedResponse;
  });

export const CreateRoutineTag = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRoutineTagRequest) => data)
  .handler(async ({ data: request }): Promise<CreateRoutineTagResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routineTag.createRoutineTag;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as CreateRoutineTagResponse;

    return formattedResponse;
  });

export const CreateRoutineTags = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRoutineTagsRequest) => data)
  .handler(async ({ data: request }): Promise<CreateRoutineTagsResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routineTag.createRoutineTags;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as CreateRoutineTagsResponse;

    return formattedResponse;
  });

export const UpdateMyRoutineTagById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyRoutineTagByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyRoutineTagByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTag.updateMyRoutineTagById(
          request.body.routineTagId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineTagId")),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as UpdateMyRoutineTagByIdResponse;

      return formattedResponse;
    }
  );

export const UpdateMyRoutineTagsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyRoutineTagsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyRoutineTagsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTag.updateMyRoutineTagsByIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
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
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as UpdateMyRoutineTagsByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutineTagById = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRoutineTagByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyRoutineTagByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTag.hardDeleteMyRoutineTagById(
          request.body.routineTagId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineTagId")),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as HardDeleteMyRoutineTagByIdResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutineTagsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRoutineTagsByIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<HardDeleteMyRoutineTagsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTag.hardDeleteMyRoutineTagsByIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
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
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as HardDeleteMyRoutineTagsByIdsResponse;

      return formattedResponse;
    }
  );
