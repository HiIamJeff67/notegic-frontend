import type {
  GetMyRoutineTaskRecordsByRoutineTaskIdRequest,
  GetMyRoutineTaskRecordsByRoutineTaskIdResponse,
  VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
  VisualizeMyRoutineTaskRecordPurposeCountRequest,
  VisualizeMyRoutineTaskRecordPurposeCountResponse,
  VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  VisualizeMyRoutineTaskRecordScheduledAtCountResponse,
  VisualizeMyRoutineTaskRecordStatusCountRequest,
  VisualizeMyRoutineTaskRecordStatusCountResponse,
} from "@shared/api/interfaces/routineTaskRecord.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

export const VisualizeMyRoutineTaskRecordStatusCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordStatusCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordStatusCountResponse> => {
      const path =
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordStatusCount;
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
      )) as VisualizeMyRoutineTaskRecordStatusCountResponse;
    }
  );

export const VisualizeMyRoutineTaskRecordPurposeCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordPurposeCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse> => {
      const path =
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordPurposeCount;
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
      )) as VisualizeMyRoutineTaskRecordPurposeCountResponse;
    }
  );

export const VisualizeMyRoutineTaskRecordScheduledAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordScheduledAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse> => {
      const path =
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordScheduledAtCount;
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
      )) as VisualizeMyRoutineTaskRecordScheduledAtCountResponse;
    }
  );

export const VisualizeMyRoutineTaskRecordActualStartedAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse> => {
      const path =
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordActualStartedAtCount;
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
      )) as VisualizeMyRoutineTaskRecordActualStartedAtCountResponse;
    }
  );

export const VisualizeMyRoutineTaskRecordActualEndedAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse> => {
      const path =
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordActualEndedAtCount;
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
      )) as VisualizeMyRoutineTaskRecordActualEndedAtCountResponse;
    }
  );

export const GetMyRoutineTaskRecordsByRoutineTaskId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyRoutineTaskRecordsByRoutineTaskIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyRoutineTaskRecordsByRoutineTaskIdResponse> => {
      const params = new URLSearchParams();
      if (request.param.limit !== undefined) {
        params.set("limit", String(request.param.limit));
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskRecord.getMyRoutineTaskRecordsByRoutineTaskId(
          request.param.routineTaskId
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
      )) as GetMyRoutineTaskRecordsByRoutineTaskIdResponse;

      return formattedResponse;
    }
  );
