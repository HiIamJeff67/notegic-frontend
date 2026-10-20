import { setResponseHeader } from "@tanstack/react-start/server";

export function getSetCookieValues(headers: Headers): string[] {
  const headersWithGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }

  const singleSetCookie = headers.get("set-cookie");
  return singleSetCookie ? [singleSetCookie] : [];
}

export function mergeCookieHeader(
  inboundCookie: string | undefined,
  setCookies: string[]
): string | undefined {
  const cookieMap = new Map<string, string>();

  if (inboundCookie) {
    for (const pair of inboundCookie.split(";")) {
      const trimmedPair = pair.trim();
      if (!trimmedPair) continue;
      const eqIndex = trimmedPair.indexOf("=");
      if (eqIndex < 1) continue;
      const key = trimmedPair.slice(0, eqIndex);
      const value = trimmedPair.slice(eqIndex + 1);
      cookieMap.set(key, value);
    }
  }

  for (const setCookie of setCookies) {
    const firstPart = setCookie.split(";")[0]?.trim();
    if (!firstPart) continue;
    const eqIndex = firstPart.indexOf("=");
    if (eqIndex < 1) continue;
    const key = firstPart.slice(0, eqIndex);
    const value = firstPart.slice(eqIndex + 1);
    cookieMap.set(key, value);
  }

  if (cookieMap.size === 0) return undefined;
  return Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

export function forwardUpstreamSetCookies(response: Response): void {
  const setCookies = getSetCookieValues(response.headers);

  if (setCookies.length > 0) {
    setResponseHeader("set-cookie", setCookies);
  }
}
