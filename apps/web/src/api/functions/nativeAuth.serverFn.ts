import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

export type AuthorizeNativeResponse = {
  success: true;
  data: {
    code: string;
    state: string;
    redirectUri: string;
    expiresIn: number;
  };
  exception: null;
};

const AuthorizeNativeRpc = createServerFn({ method: "POST" })
  .inputValidator((data: { requestId: string }) => data)
  .handler(async ({ data }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.nativeAuthorize}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": getRequestHeader("User-Agent") ?? "unknown",
          "X-CSRF-Token": getRequestHeader("X-CSRF-Token") ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify({ requestId: data.requestId }),
        credentials: "include",
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as AuthorizeNativeResponse;
  });

export const AuthorizeNative = (requestId: string) =>
  AuthorizeNativeRpc({ data: { requestId } });
