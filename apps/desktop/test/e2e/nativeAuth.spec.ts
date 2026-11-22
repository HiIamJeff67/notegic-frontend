import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { APIURLPathDictionary } from "@shared/lib/url/api";
import { WebURLPathDictionary } from "@shared/lib/url/web";

const desktopUserAgent = "NotegicDesktop/0.1";

const token = () => randomBytes(32).toString("base64url");

const postNative = (path: string, body: unknown) =>
  fetch(`${APIURLPathDictionary.base()}/${path}`, {
    method: "POST",
    credentials: "omit",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "User-Agent": desktopUserAgent,
    },
    body: JSON.stringify(body),
  });

test("production authorize page is the desktop sign-in page", async () => {
  for (const url of [
    WebURLPathDictionary.nativeLogin(),
    WebURLPathDictionary.nativeRegister(),
  ]) {
    const response = await fetch(url, { credentials: "omit" });
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("<html");
    expect(html).not.toContain("Invalid URL string");
    expect(html).not.toContain("VITE_APPLICATION_VERSION");
  }
});

test("production native authorization rejects an empty request and accepts a desktop challenge", async () => {
  const refused = await postNative(
    APIURLPathDictionary.auth.nativeRequests,
    {}
  );
  const refusedBody = (await refused.json()) as {
    success: boolean;
    exception: { reason: string } | null;
  };
  expect(refused.status).toBe(400);
  expect(refusedBody.success).toBe(false);
  expect(refusedBody.exception?.reason).toBe("InvalidDto");
  expect(refused.headers.get("set-cookie")).toBeNull();

  const prepared = await postNative(APIURLPathDictionary.auth.nativeRequests, {
    clientId: "notegic-desktop",
    codeChallenge: token(),
    state: token(),
  });
  const preparedBody = (await prepared.json()) as {
    success: boolean;
    data: { requestId: string; expiresIn: number } | null;
  };
  expect(prepared.status).toBe(200);
  expect(preparedBody.success).toBe(true);
  expect(preparedBody.data?.requestId).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(preparedBody.data?.expiresIn).toBe(900);
  expect(prepared.headers.get("set-cookie")).toBeNull();

  const unauthorized = await postNative(
    APIURLPathDictionary.auth.nativeAuthorize,
    {
      requestId: preparedBody.data?.requestId,
    }
  );
  const unauthorizedBody = (await unauthorized.json()) as {
    success: boolean;
  };
  expect(unauthorized.status).toBe(401);
  expect(unauthorizedBody.success).toBe(false);
  expect(unauthorized.headers.get("set-cookie")).toBeNull();
});
