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
} from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const CreateMyRealtimeConnectionTicketRpc = createServerFn({
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
            "X-CSRF-Token":
              getRequestHeader("X-CSRF-Token") ??
              request.header?.csrfToken ??
              "",
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body ?? {}),
          credentials: "include",
        }
      );

      forwardUpstreamSetCookies(response);
      const formattedResponse = (await format(
        response
      )) as CreateMyRealtimeConnectionTicketResponse;

      return formattedResponse;
    }
  );

export const CreateMyRealtimeConnectionTicket = (
  request: CreateMyRealtimeConnectionTicketRequest
) => CreateMyRealtimeConnectionTicketRpc({ data: request });

const CreateMyBlockPackChannelTicketRpc = createServerFn({
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
      )) as CreateMyBlockPackChannelTicketResponse;

      return formattedResponse;
    }
  );

export const CreateMyBlockPackChannelTicket = (
  request: CreateMyBlockPackChannelTicketRequest
) => CreateMyBlockPackChannelTicketRpc({ data: request });

const GetBlockPackParticipantsRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetBlockPackParticipantsRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetBlockPackParticipantsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const websocketURL = import.meta.env.VITE_REALTIME_WEBSOCKET_URL?.trim();
      const participantsPath = `${CurrentRealtimeBaseURL}/${APIURLPathDictionary.realtime.getBlockPackParticipants(request.param.blockPackId as UUID)}`;
      const participantsURL = websocketURL
        ? `${websocketURL
            .replace(/^wss:/, "https:")
            .replace(/^ws:/, "http:")
            .replace(/\/+$/, "")}/${participantsPath}`
        : APIURLPathDictionary.notFound();
      const response = await fetch(participantsURL, {
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
      )) as GetBlockPackParticipantsResponse;

      return formattedResponse;
    }
  );

export const GetBlockPackParticipants = (
  request: GetBlockPackParticipantsRequest
) => GetBlockPackParticipantsRpc({ data: request });
