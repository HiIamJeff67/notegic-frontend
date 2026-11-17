import type {
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const GetMyBlockById = async (
  request: GetMyBlockByIdRequest
): Promise<GetMyBlockByIdResponse> => {
  const { blockId } = request.param;
  const url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlockById(blockId)}`;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(url, {
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

  return (await response.json()) as GetMyBlockByIdResponse;
};

export const GetMyBlocksByIds = async (
  request: GetMyBlocksByIdsRequest
): Promise<GetMyBlocksByIdsResponse> => {
  const { blockIds } = request.param;
  const params = new URLSearchParams();
  blockIds.forEach(id => params.append("blockIds", id));
  const url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByIds}?${params.toString()}`;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");

  const response = await fetch(url, {
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

  return (await response.json()) as GetMyBlocksByIdsResponse;
};

export const GetMyBlocksByBlockPackId = async (
  request: GetMyBlocksByBlockPackIdRequest
): Promise<GetMyBlocksByBlockPackIdResponse> => {
  const { blockPackId } = request.param;
  const url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByBlockPackId(blockPackId)}`;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
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

  return (await response.json()) as GetMyBlocksByBlockPackIdResponse;
};
