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
import { getAccessToken } from "../tokens/accessToken";

export const CreateMyRealtimeConnectionTicket = async (
  request: CreateMyRealtimeConnectionTicketRequest
): Promise<CreateMyRealtimeConnectionTicketResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.realtime.createMyRealtimeConnectionTicket}`,
    {
      method: "POST",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(request.body ?? {}),
      credentials: "omit",
    }
  );

  return (await response.json()) as CreateMyRealtimeConnectionTicketResponse;
};

export const CreateMyBlockPackChannelTicket = async (
  request: CreateMyBlockPackChannelTicketRequest
): Promise<CreateMyBlockPackChannelTicketResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.realtime.createMyBlockPackChannelTicket}`,
    {
      method: "POST",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(request.body),
      credentials: "omit",
    }
  );

  return (await response.json()) as CreateMyBlockPackChannelTicketResponse;
};

export const GetBlockPackParticipants = async (
  request: GetBlockPackParticipantsRequest
): Promise<GetBlockPackParticipantsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
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
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    credentials: "omit",
  });

  return (await response.json()) as GetBlockPackParticipantsResponse;
};
