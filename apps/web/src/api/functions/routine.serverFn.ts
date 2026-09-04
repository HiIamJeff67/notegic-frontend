import { forwardUpstreamSetCookies } from "@/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import type {
  VisualizeMyRoutinePeriodCountRequest,
  VisualizeMyRoutinePeriodCountResponse,
  VisualizeMyRoutineScheduledEndAtCountRequest,
  VisualizeMyRoutineScheduledEndAtCountResponse,
  VisualizeMyRoutineScheduledStartAtCountRequest,
  VisualizeMyRoutineScheduledStartAtCountResponse,
  VisualizeMyRoutineStatusCountRequest,
  VisualizeMyRoutineStatusCountResponse,
} from "@shared/api/interfaces/routine.interface";
import {
  CreateRoutineByStationIdRequest,
  CreateRoutineByStationIdResponse,
  CreateRoutinesByStationIdsRequest,
  CreateRoutinesByStationIdsResponse,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutineByIdResponse,
  DeleteMyRoutinesByIdsRequest,
  DeleteMyRoutinesByIdsResponse,
  GetMyRoutinesByTimeRangeRequest,
  GetMyRoutinesByTimeRangeResponse,
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdResponse,
  GetMyRoutinesByStationIdRequest,
  GetMyRoutinesByStationIdResponse,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutineByIdResponse,
  HardDeleteMyRoutinesByIdsRequest,
  HardDeleteMyRoutinesByIdsResponse,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdResponse,
  LinkRoutineItemsByIdsRequest,
  LinkRoutineItemsByIdsResponse,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdResponse,
  LinkRoutineTagsByIdsRequest,
  LinkRoutineTagsByIdsResponse,
  LinkRoutineTaskByIdRequest,
  LinkRoutineTaskByIdResponse,
  LinkRoutineTasksByIdsRequest,
  LinkRoutineTasksByIdsResponse,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutineByIdResponse,
  RestoreMyRoutinesByIdsRequest,
  RestoreMyRoutinesByIdsResponse,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutineByIdResponse,
  UpdateMyRoutinesByIdsRequest,
  UpdateMyRoutinesByIdsResponse,
} from "@shared/api/interfaces/routine.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  withoutPathParams,
} from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { fetchVisualizeResponse } from "./visualize.serverFn";

export const VisualizeMyRoutineStatusCount = createServerFn({ method: "GET" })
  .inputValidator((data: VisualizeMyRoutineStatusCountRequest) => data)
  .handler(
    async ({ data: request }): Promise<VisualizeMyRoutineStatusCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routine.visualizeMyRoutineStatusCount
      )
  );

export const VisualizeMyRoutinePeriodCount = createServerFn({ method: "GET" })
  .inputValidator((data: VisualizeMyRoutinePeriodCountRequest) => data)
  .handler(
    async ({ data: request }): Promise<VisualizeMyRoutinePeriodCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routine.visualizeMyRoutinePeriodCount
      )
  );

export const VisualizeMyRoutineScheduledStartAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineScheduledStartAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineScheduledStartAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routine.visualizeMyRoutineScheduledStartAtCount
      )
  );

export const VisualizeMyRoutineScheduledEndAtCount = createServerFn({
  method: "GET",
})
  .inputValidator((data: VisualizeMyRoutineScheduledEndAtCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineScheduledEndAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routine.visualizeMyRoutineScheduledEndAtCount
      )
  );

export const GetMyRoutineById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyRoutineByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyRoutineByIdResponse> => {
    const params = new URLSearchParams(
      Object.entries(request.param || {}).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (key !== "routineId" && value !== undefined && value !== null)
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
      APIURLPathDictionary.routine.getMyRoutineById(request.param.routineId) +
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

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as GetMyRoutineByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const GetMyRoutinesByStationId = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyRoutinesByStationIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyRoutinesByStationIdResponse> => {
      const params = new URLSearchParams(
        Object.entries(request.param || {}).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (key !== "stationId" && value !== undefined && value !== null)
              acc[key] = String(value);
            return acc;
          },
          {}
        )
      );
      if (request.param?.areDeleted === undefined) {
        params.set("areDeleted", "false");
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.getMyRoutinesByStationId(
          request.param.stationId
        ) +
        "?" +
        params.toString();
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
        (await response.json()) as GetMyRoutinesByStationIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const GetMyRoutinesByTimeRange = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyRoutinesByTimeRangeRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyRoutinesByTimeRangeResponse> => {
      const params = new URLSearchParams();
      params.set(
        "from",
        new Date(request.param.from as string | number | Date).toISOString()
      );
      params.set(
        "to",
        new Date(request.param.to as string | number | Date).toISOString()
      );
      params.set("areDeleted", String(request.param.areDeleted ?? false));
      for (const stationId of request.param.stationIds) {
        params.append("stationIds", stationId);
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.getMyRoutinesByTimeRange +
        "?" +
        params.toString();
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
        (await response.json()) as GetMyRoutinesByTimeRangeResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const CreateRoutineByStationId = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRoutineByStationIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<CreateRoutineByStationIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.createRoutineByStationId(
          request.body.stationId
        );
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
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
        body: JSON.stringify(withoutPathParams(request.body, "stationId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateRoutineByStationIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const CreateRoutinesByStationIds = createServerFn({ method: "POST" })
  .inputValidator((data: CreateRoutinesByStationIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<CreateRoutinesByStationIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.createRoutinesByStationIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateRoutinesByStationIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const UpdateMyRoutineById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyRoutineByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyRoutineByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.updateMyRoutineById(request.body.routineId);
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
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
      body: JSON.stringify(withoutPathParams(request.body, "routineId")),
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as UpdateMyRoutineByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const UpdateMyRoutinesByIds = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyRoutinesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyRoutinesByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.updateMyRoutinesByIds;
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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as UpdateMyRoutinesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const LinkRoutineTagById = createServerFn({ method: "POST" })
  .inputValidator((data: LinkRoutineTagByIdRequest) => data)
  .handler(async ({ data: request }): Promise<LinkRoutineTagByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.linkRoutineTagById(
        request.body.routineId,
        request.body.routineTagId
      );
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
      body: JSON.stringify(
        withoutPathParams(request.body, "routineId", "routineTagId")
      ),
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as LinkRoutineTagByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const LinkRoutineTagsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: LinkRoutineTagsByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<LinkRoutineTagsByIdsResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.linkRoutineTagsByIds;
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

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as LinkRoutineTagsByIdsResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const LinkRoutineTaskById = createServerFn({ method: "POST" })
  .inputValidator((data: LinkRoutineTaskByIdRequest) => data)
  .handler(async ({ data: request }): Promise<LinkRoutineTaskByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.linkRoutineTaskById(
        request.body.routineId,
        request.body.routineTaskId
      );
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
      body: JSON.stringify(
        withoutPathParams(request.body, "routineId", "routineTaskId")
      ),
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as LinkRoutineTaskByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const LinkRoutineTasksByIds = createServerFn({ method: "POST" })
  .inputValidator((data: LinkRoutineTasksByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<LinkRoutineTasksByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.linkRoutineTasksByIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as LinkRoutineTasksByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const LinkRoutineItemById = createServerFn({ method: "POST" })
  .inputValidator((data: LinkRoutineItemByIdRequest) => data)
  .handler(async ({ data: request }): Promise<LinkRoutineItemByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.linkRoutineItemById(
        request.body.routineId,
        request.body.itemId
      );
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
      body: JSON.stringify(
        withoutPathParams(request.body, "routineId", "itemId")
      ),
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as LinkRoutineItemByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const LinkRoutineItemsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: LinkRoutineItemsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<LinkRoutineItemsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.linkRoutineItemsByIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as LinkRoutineItemsByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const RestoreMyRoutineById = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyRoutineByIdRequest) => data)
  .handler(async ({ data: request }): Promise<RestoreMyRoutineByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.restoreMyRoutineById(request.body.routineId);
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        ...(request.header?.csrfToken
          ? { "X-CSRF-Token": request.header.csrfToken }
          : {}),
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(withoutPathParams(request.body, "routineId")),
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as RestoreMyRoutineByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const RestoreMyRoutinesByIds = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyRoutinesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyRoutinesByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.restoreMyRoutinesByIds;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
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
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as RestoreMyRoutinesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const DeleteMyRoutineById = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyRoutineByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMyRoutineByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.routine.deleteMyRoutineById(request.body.routineId);
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
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
      body: JSON.stringify(withoutPathParams(request.body, "routineId")),
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as DeleteMyRoutineByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });

export const DeleteMyRoutinesByIds = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyRoutinesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyRoutinesByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.deleteMyRoutinesByIds;
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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as DeleteMyRoutinesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutineById = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRoutineByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyRoutineByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.hardDeleteMyRoutineById(
          request.body.routineId
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
        body: JSON.stringify(withoutPathParams(request.body, "routineId")),
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as HardDeleteMyRoutineByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutinesByIds = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyRoutinesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyRoutinesByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routine.hardDeleteMyRoutinesByIds;
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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as HardDeleteMyRoutinesByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotegicAPIError(
          new NotegicException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );
