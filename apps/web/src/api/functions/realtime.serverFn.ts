import type { UUID } from "node:crypto";
import type {
  CreateMyBlockPackChannelTicketRequest,
  CreateMyBlockPackChannelTicketResponse,
  CreateMyRealtimeConnectionTicketRequest,
  CreateMyRealtimeConnectionTicketResponse,
  GetBlockPackParticipantsRequest,
  GetBlockPackParticipantsResponse,
} from "@shared/api/interfaces/realtime.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
  CurrentRealtimeBaseURL,
  getRealtimeHTTPURL,
} from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const CreateMyRealtimeConnectionTicket = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateMyRealtimeConnectionTicketRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateMyRealtimeConnectionTicketResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.realtime.createMyRealtimeConnectionTicket}`,
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
          body: JSON.stringify(request.body ?? {}),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as CreateMyRealtimeConnectionTicketResponse;

      return formattedResponse;
    }
  );

export const CreateMyBlockPackChannelTicket = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateMyBlockPackChannelTicketRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateMyBlockPackChannelTicketResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.realtime.createMyBlockPackChannelTicket}`,
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

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as CreateMyBlockPackChannelTicketResponse;

      return formattedResponse;
    }
  );

export const GetBlockPackParticipants = createServerFn({ method: "GET" })
  .inputValidator((data: GetBlockPackParticipantsRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetBlockPackParticipantsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${getRealtimeHTTPURL()}/${CurrentRealtimeBaseURL}/${APIURLPathDictionary.realtime.getBlockPackParticipants(request.param.blockPackId as UUID)}`,
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

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await readAPIResponse(
        response
      )) as GetBlockPackParticipantsResponse;

      return formattedResponse;
    }
  );
