import type { UUID } from "node:crypto";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
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
} from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateMyRealtimeConnectionTicketResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }

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

      if (!isJsonResponse(response)) {
        throw new Error("error.encounterUnknownError");
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateMyBlockPackChannelTicketResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }

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
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentRealtimeBaseURL}/${APIURLPathDictionary.realtime.getBlockPackParticipants(request.param.blockPackId as UUID)}`,
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
        (await response.json()) as GetBlockPackParticipantsResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );
