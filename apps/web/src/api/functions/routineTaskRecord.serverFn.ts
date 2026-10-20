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
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";
import { fetchVisualizeResponse } from "./visualize.serverFn";

export const VisualizeMyRoutineTaskRecordStatusCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordStatusCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordStatusCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordStatusCount
      )
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
    }): Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordPurposeCount
      )
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
    }): Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordScheduledAtCount
      )
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
    }): Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordActualStartedAtCount
      )
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
    }): Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordActualEndedAtCount
      )
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
      )) as GetMyRoutineTaskRecordsByRoutineTaskIdResponse;

      return formattedResponse;
    }
  );
