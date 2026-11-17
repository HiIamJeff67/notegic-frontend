import type {
  VisualizeMyTotalCountRequest,
  VisualizeMyTotalCountResponse,
} from "@shared/api/interfaces/station.interface";
import {
  CreateStationRequest,
  CreateStationResponse,
  CreateStationsRequest,
  CreateStationsResponse,
  DeleteMyStationByIdRequest,
  DeleteMyStationByIdResponse,
  DeleteMyStationsByIdsRequest,
  DeleteMyStationsByIdsResponse,
  GetAllMyStationsRequest,
  GetAllMyStationsResponse,
  GetMyStationByIdRequest,
  GetMyStationByIdResponse,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationByIdResponse,
  HardDeleteMyStationsByIdsRequest,
  HardDeleteMyStationsByIdsResponse,
  LeaveMyStationRequest,
  LeaveMyStationResponse,
  RestoreMyStationByIdRequest,
  RestoreMyStationByIdResponse,
  RestoreMyStationsByIdsRequest,
  RestoreMyStationsByIdsResponse,
  TransferMyStationOwnershipRequest,
  TransferMyStationOwnershipResponse,
  UpdateMyStationByIdRequest,
  UpdateMyStationByIdResponse,
  UpdateMyStationsByIdsRequest,
  UpdateMyStationsByIdsResponse,
} from "@shared/api/interfaces/station.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { withoutPathParams } from "@/api/functions/helpers/body";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const VisualizeMyTotalCountRpc = createServerFn({ method: "GET" })
  .inputValidator((data: VisualizeMyTotalCountRequest) => data)
  .handler(
    async ({ data: request }): Promise<VisualizeMyTotalCountResponse> => {
      const path = APIURLPathDictionary.station.visualizeMyTotalCount;
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
      return (await format(response)) as VisualizeMyTotalCountResponse;
    }
  );

export const VisualizeMyTotalCount = (request: VisualizeMyTotalCountRequest) =>
  VisualizeMyTotalCountRpc({ data: request });

const TransferMyStationOwnershipRpc = createServerFn({ method: "POST" })
  .inputValidator((data: TransferMyStationOwnershipRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.station.transferOwnership(request.param.stationId as import("node:crypto").UUID)}`,
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
    return (await format(response)) as TransferMyStationOwnershipResponse;
  });

export const TransferMyStationOwnership = (
  request: TransferMyStationOwnershipRequest
) => TransferMyStationOwnershipRpc({ data: request });

const LeaveMyStationRpc = createServerFn({ method: "POST" })
  .inputValidator((data: LeaveMyStationRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.station.leave(request.param.stationId as import("node:crypto").UUID)}`,
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
        body: JSON.stringify(request.body ?? {}),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as LeaveMyStationResponse;
  });

export const LeaveMyStation = (request: LeaveMyStationRequest) =>
  LeaveMyStationRpc({ data: request });

const GetMyStationByIdRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyStationByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyStationByIdResponse> => {
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
    if (request.param?.isDeleted === undefined) {
      params.set("isDeleted", "false");
    }
    const query = params.toString();
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.getMyStationById(request.param.stationId) +
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
    )) as GetMyStationByIdResponse;

    return formattedResponse;
  });

export const GetMyStationById = (request: GetMyStationByIdRequest) =>
  GetMyStationByIdRpc({ data: request });

const GetAllMyStationsRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetAllMyStationsRequest) => data)
  .handler(async ({ data: request }): Promise<GetAllMyStationsResponse> => {
    const params = new URLSearchParams();
    params.set("areDeleted", String(request.param?.areDeleted ?? false));
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.getAllMyStations +
      (params.size > 0 ? "?" + params.toString() : "");
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
    )) as GetAllMyStationsResponse;

    return formattedResponse;
  });

export const GetAllMyStations = (request: GetAllMyStationsRequest) =>
  GetAllMyStationsRpc({ data: request });

const CreateStationRpc = createServerFn({ method: "POST" })
  .inputValidator((data: CreateStationRequest) => data)
  .handler(async ({ data: request }): Promise<CreateStationResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.createStation;
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
    const formattedResponse = (await format(response)) as CreateStationResponse;

    return formattedResponse;
  });

export const CreateStation = (request: CreateStationRequest) =>
  CreateStationRpc({ data: request });

const CreateStationsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: CreateStationsRequest) => data)
  .handler(async ({ data: request }): Promise<CreateStationsResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.createStations;
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
    )) as CreateStationsResponse;

    return formattedResponse;
  });

export const CreateStations = (request: CreateStationsRequest) =>
  CreateStationsRpc({ data: request });

const UpdateMyStationByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyStationByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyStationByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.updateMyStationById(request.body.stationId);
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
      body: JSON.stringify(withoutPathParams(request.body, "stationId")),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as UpdateMyStationByIdResponse;

    return formattedResponse;
  });

export const UpdateMyStationById = (request: UpdateMyStationByIdRequest) =>
  UpdateMyStationByIdRpc({ data: request });

const UpdateMyStationsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyStationsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMyStationsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.station.updateMyStationsByIds;
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
      )) as UpdateMyStationsByIdsResponse;

      return formattedResponse;
    }
  );

export const UpdateMyStationsByIds = (request: UpdateMyStationsByIdsRequest) =>
  UpdateMyStationsByIdsRpc({ data: request });

const RestoreMyStationByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyStationByIdRequest) => data)
  .handler(async ({ data: request }): Promise<RestoreMyStationByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.restoreMyStationById(request.body.stationId);
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
      body: JSON.stringify(withoutPathParams(request.body, "stationId")),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as RestoreMyStationByIdResponse;

    return formattedResponse;
  });

export const RestoreMyStationById = (request: RestoreMyStationByIdRequest) =>
  RestoreMyStationByIdRpc({ data: request });

const RestoreMyStationsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyStationsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyStationsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.station.restoreMyStationsByIds;
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
      )) as RestoreMyStationsByIdsResponse;

      return formattedResponse;
    }
  );

export const RestoreMyStationsByIds = (
  request: RestoreMyStationsByIdsRequest
) => RestoreMyStationsByIdsRpc({ data: request });

const DeleteMyStationByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyStationByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMyStationByIdResponse> => {
    const url =
      import.meta.env.VITE_API_DOMAIN_URL +
      "/" +
      CurrentAPIBaseURL +
      "/" +
      APIURLPathDictionary.station.deleteMyStationById(request.body.stationId);
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
      body: JSON.stringify(withoutPathParams(request.body, "stationId")),
      credentials: "include",
    });

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await format(
      response
    )) as DeleteMyStationByIdResponse;

    return formattedResponse;
  });

export const DeleteMyStationById = (request: DeleteMyStationByIdRequest) =>
  DeleteMyStationByIdRpc({ data: request });

const DeleteMyStationsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyStationsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyStationsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.station.deleteMyStationsByIds;
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
      )) as DeleteMyStationsByIdsResponse;

      return formattedResponse;
    }
  );

export const DeleteMyStationsByIds = (request: DeleteMyStationsByIdsRequest) =>
  DeleteMyStationsByIdsRpc({ data: request });

const HardDeleteMyStationByIdRpc = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyStationByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyStationByIdResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.station.hardDeleteMyStationById(
          request.body.stationId
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
        body: JSON.stringify(withoutPathParams(request.body, "stationId")),
        credentials: "include",
      });

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as HardDeleteMyStationByIdResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyStationById = (
  request: HardDeleteMyStationByIdRequest
) => HardDeleteMyStationByIdRpc({ data: request });

const HardDeleteMyStationsByIdsRpc = createServerFn({ method: "POST" })
  .inputValidator((data: HardDeleteMyStationsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<HardDeleteMyStationsByIdsResponse> => {
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.station.hardDeleteMyStationsByIds;
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
      )) as HardDeleteMyStationsByIdsResponse;

      return formattedResponse;
    }
  );

export const HardDeleteMyStationsByIds = (
  request: HardDeleteMyStationsByIdsRequest
) => HardDeleteMyStationsByIdsRpc({ data: request });
