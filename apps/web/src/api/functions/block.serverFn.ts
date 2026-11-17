import {
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const GetMyBlockByIdRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyBlockByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyBlockByIdResponse> => {
    const { blockId } = request.param;
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlockById(blockId)}`;
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
    )) as GetMyBlockByIdResponse;

    return formattedResponse;
  });

export const GetMyBlockById = (request: GetMyBlockByIdRequest) =>
  GetMyBlockByIdRpc({ data: request });

const GetMyBlocksByIdsRpc = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyBlocksByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyBlocksByIdsResponse> => {
    const { blockIds } = request.param;
    const params = new URLSearchParams();
    blockIds.forEach(id => params.append("blockIds", id));
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByIds}?${params.toString()}`;
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
    )) as GetMyBlocksByIdsResponse;

    return formattedResponse;
  });

export const GetMyBlocksByIds = (request: GetMyBlocksByIdsRequest) =>
  GetMyBlocksByIdsRpc({ data: request });

const GetMyBlocksByBlockPackIdRpc = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlocksByBlockPackIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyBlocksByBlockPackIdResponse> => {
      const { blockPackId } = request.param;
      const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByBlockPackId(blockPackId)}`;
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
      )) as GetMyBlocksByBlockPackIdResponse;

      return formattedResponse;
    }
  );

export const GetMyBlocksByBlockPackId = (
  request: GetMyBlocksByBlockPackIdRequest
) => GetMyBlocksByBlockPackIdRpc({ data: request });
