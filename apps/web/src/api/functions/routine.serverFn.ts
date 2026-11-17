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
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdResponse,
  GetMyRoutinesByStationIdRequest,
  GetMyRoutinesByStationIdResponse,
  GetMyRoutinesByTimeRangeRequest,
  GetMyRoutinesByTimeRangeResponse,
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
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { withoutPathParams } from "@/api/functions/helpers/body";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const VisualizeMyRoutineStatusCountRpc = createServerFn({ method: "GET" })
  .inputValidator((data: VisualizeMyRoutineStatusCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineStatusCountResponse> => {
      const path = APIURLPathDictionary.routine.visualizeMyRoutineStatusCount;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(request.param) as [
        string,
        unknown,
      ][]) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const entry of value) {
            params.append(
              key,
              entry instanceof Date ? entry.toISOString() : String(entry)
            );
          }
          continue;
        }
        params.set(
          key,
          value instanceof Date ? value.toISOString() : String(value)
        );
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        path +
        "?" +
        params.toString();
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
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
      });
      forwardUpstreamSetCookies(response);
      return (await format(response)) as VisualizeMyRoutineStatusCountResponse;
    }
  );

export const VisualizeMyRoutineStatusCount = (
  request: VisualizeMyRoutineStatusCountRequest
) => VisualizeMyRoutineStatusCountRpc({ data: request });

const VisualizeMyRoutinePeriodCountRpc = createServerFn({ method: "GET" })
  .inputValidator((data: VisualizeMyRoutinePeriodCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutinePeriodCountResponse> => {
      const path = APIURLPathDictionary.routine.visualizeMyRoutinePeriodCount;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(request.param) as [
        string,
        unknown,
      ][]) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const entry of value) {
            params.append(
              key,
              entry instanceof Date ? entry.toISOString() : String(entry)
            );
          }
          continue;
        }
        params.set(
          key,
          value instanceof Date ? value.toISOString() : String(value)
        );
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        path +
        "?" +
        params.toString();
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
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
      });
      forwardUpstreamSetCookies(response);
      return (await format(response)) as VisualizeMyRoutinePeriodCountResponse;
    }
  );

export const VisualizeMyRoutinePeriodCount = (
  request: VisualizeMyRoutinePeriodCountRequest
) => VisualizeMyRoutinePeriodCountRpc({ data: request });

const VisualizeMyRoutineScheduledStartAtCountRpc = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineScheduledStartAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineScheduledStartAtCountResponse> => {
      const path =
        APIURLPathDictionary.routine.visualizeMyRoutineScheduledStartAtCount;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(request.param) as [
        string,
        unknown,
      ][]) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const entry of value) {
            params.append(
              key,
              entry instanceof Date ? entry.toISOString() : String(entry)
            );
          }
          continue;
        }
        params.set(
          key,
          value instanceof Date ? value.toISOString() : String(value)
        );
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        path +
        "?" +
        params.toString();
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
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
      });
      forwardUpstreamSetCookies(response);
      return (await format(
        response
      )) as VisualizeMyRoutineScheduledStartAtCountResponse;
    }
  );

export const VisualizeMyRoutineScheduledStartAtCount = (
  request: VisualizeMyRoutineScheduledStartAtCountRequest
) => VisualizeMyRoutineScheduledStartAtCountRpc({ data: request });

const VisualizeMyRoutineScheduledEndAtCountRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: VisualizeMyRoutineScheduledEndAtCountRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineScheduledEndAtCountResponse> => {
      const path =
        APIURLPathDictionary.routine.visualizeMyRoutineScheduledEndAtCount;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(request.param) as [
        string,
        unknown,
      ][]) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const entry of value) {
            params.append(
              key,
              entry instanceof Date ? entry.toISOString() : String(entry)
            );
          }
          continue;
        }
        params.set(
          key,
          value instanceof Date ? value.toISOString() : String(value)
        );
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        path +
        "?" +
        params.toString();
      const inboundCookie = getRequestHeader("cookie");
      const response = await fetch(url, {
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
      });
      forwardUpstreamSetCookies(response);
      return (await format(
        response
      )) as VisualizeMyRoutineScheduledEndAtCountResponse;
    }
  );

export const VisualizeMyRoutineScheduledEndAtCount = (
  request: VisualizeMyRoutineScheduledEndAtCountRequest
) => VisualizeMyRoutineScheduledEndAtCountRpc({ data: request });

const GetMyRoutineByIdRpc = createServerFn({ method: "GET" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as GetMyRoutineByIdResponse;

    return formattedResponse;
  });

export const GetMyRoutineById = (request: GetMyRoutineByIdRequest) =>
  GetMyRoutineByIdRpc({ data: request });

const GetMyRoutinesByStationIdRpc = createServerFn({ method: "GET" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as GetMyRoutinesByStationIdResponse;

      return formattedResponse;
    }
  );

export const GetMyRoutinesByStationId = (
  request: GetMyRoutinesByStationIdRequest
) => GetMyRoutinesByStationIdRpc({ data: request });

const GetMyRoutinesByTimeRangeRpc = createServerFn({ method: "GET" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as GetMyRoutinesByTimeRangeResponse;

      return formattedResponse;
    }
  );

export const GetMyRoutinesByTimeRange = (
  request: GetMyRoutinesByTimeRangeRequest
) => GetMyRoutinesByTimeRangeRpc({ data: request });

const CreateRoutineByStationIdRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "stationId")),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as CreateRoutineByStationIdResponse;

      return formattedResponse;
    }
  );

export const CreateRoutineByStationId = (
  request: CreateRoutineByStationIdRequest
) => CreateRoutineByStationIdRpc({ data: request });

const CreateRoutinesByStationIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as CreateRoutinesByStationIdsResponse;

      return formattedResponse;
    }
  );

export const CreateRoutinesByStationIds = (
  request: CreateRoutinesByStationIdsRequest
) => CreateRoutinesByStationIdsRpc({ data: request });

const UpdateMyRoutineByIdRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(withoutPathParams(request.body, "routineId")),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as UpdateMyRoutineByIdResponse;

    return formattedResponse;
  });

export const UpdateMyRoutineById = (request: UpdateMyRoutineByIdRequest) =>
  UpdateMyRoutineByIdRpc({ data: request });

const UpdateMyRoutinesByIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as UpdateMyRoutinesByIdsResponse;

      return formattedResponse;
    }
  );

export const UpdateMyRoutinesByIds = (request: UpdateMyRoutinesByIdsRequest) =>
  UpdateMyRoutinesByIdsRpc({ data: request });

const LinkRoutineTagByIdRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(
        withoutPathParams(request.body, "routineId", "routineTagId")
      ),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as LinkRoutineTagByIdResponse;

    return formattedResponse;
  });

export const LinkRoutineTagById = (request: LinkRoutineTagByIdRequest) =>
  LinkRoutineTagByIdRpc({ data: request });

const LinkRoutineTagsByIdsRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as LinkRoutineTagsByIdsResponse;

    return formattedResponse;
  });

export const LinkRoutineTagsByIds = (request: LinkRoutineTagsByIdsRequest) =>
  LinkRoutineTagsByIdsRpc({ data: request });

const LinkRoutineTaskByIdRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(
        withoutPathParams(request.body, "routineId", "routineTaskId")
      ),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as LinkRoutineTaskByIdResponse;

    return formattedResponse;
  });

export const LinkRoutineTaskById = (request: LinkRoutineTaskByIdRequest) =>
  LinkRoutineTaskByIdRpc({ data: request });

const LinkRoutineTasksByIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as LinkRoutineTasksByIdsResponse;

      return formattedResponse;
    }
  );

export const LinkRoutineTasksByIds = (request: LinkRoutineTasksByIdsRequest) =>
  LinkRoutineTasksByIdsRpc({ data: request });

const LinkRoutineItemByIdRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(
        withoutPathParams(request.body, "routineId", "itemId")
      ),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as LinkRoutineItemByIdResponse;

    return formattedResponse;
  });

export const LinkRoutineItemById = (request: LinkRoutineItemByIdRequest) =>
  LinkRoutineItemByIdRpc({ data: request });

const LinkRoutineItemsByIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as LinkRoutineItemsByIdsResponse;

      return formattedResponse;
    }
  );

export const LinkRoutineItemsByIds = (request: LinkRoutineItemsByIdsRequest) =>
  LinkRoutineItemsByIdsRpc({ data: request });

const RestoreMyRoutineByIdRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(withoutPathParams(request.body, "routineId")),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as RestoreMyRoutineByIdResponse;

    return formattedResponse;
  });

export const RestoreMyRoutineById = (request: RestoreMyRoutineByIdRequest) =>
  RestoreMyRoutineByIdRpc({ data: request });

const RestoreMyRoutinesByIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as RestoreMyRoutinesByIdsResponse;

      return formattedResponse;
    }
  );

export const RestoreMyRoutinesByIds = (
  request: RestoreMyRoutinesByIdsRequest
) => RestoreMyRoutinesByIdsRpc({ data: request });

const DeleteMyRoutineByIdRpc = createServerFn({ method: "POST" })
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
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      body: JSON.stringify(withoutPathParams(request.body, "routineId")),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as DeleteMyRoutineByIdResponse;

    return formattedResponse;
  });

export const DeleteMyRoutineById = (request: DeleteMyRoutineByIdRequest) =>
  DeleteMyRoutineByIdRpc({ data: request });

const DeleteMyRoutinesByIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as DeleteMyRoutinesByIdsResponse;

      return formattedResponse;
    }
  );

export const DeleteMyRoutinesByIds = (request: DeleteMyRoutinesByIdsRequest) =>
  DeleteMyRoutinesByIdsRpc({ data: request });

const HardDeleteMyRoutineByIdRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(withoutPathParams(request.body, "routineId")),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as HardDeleteMyRoutineByIdResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutineById = (
  request: HardDeleteMyRoutineByIdRequest
) => HardDeleteMyRoutineByIdRpc({ data: request });

const HardDeleteMyRoutinesByIdsRpc = createServerFn({ method: "POST" })
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
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as HardDeleteMyRoutinesByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyRoutinesByIds = (
  request: HardDeleteMyRoutinesByIdsRequest
) => HardDeleteMyRoutinesByIdsRpc({ data: request });
