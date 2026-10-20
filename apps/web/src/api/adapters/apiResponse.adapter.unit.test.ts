import { NotegicAPIError } from "@shared/api/exceptions";
import { makeQueryClient } from "@shared/api/queryClient";
import { readAPIResponse } from "./apiResponse.adapter";

const publicException = {
  reason: "RequestRejected",
  domain: "Gateway",
  operation: "Request",
  message: "Request rejected",
  retryable: true,
};

test("preserves cancellation while reading the response body", async () => {
  const aborted = new DOMException("Request cancelled", "AbortError");
  const response = new Response(
    new ReadableStream({
      start(controller) {
        controller.error(aborted);
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  await expect(readAPIResponse(response)).rejects.toBe(aborted);
});

test.each(
  Array.from({ length: 200 }, (_, index) => index + 400)
)("retains upstream HTTP %s on public errors", async status => {
  await expect(
    readAPIResponse(Response.json({ exception: publicException }, { status }))
  ).rejects.toMatchObject({
    unWrap: {
      reason: publicException.reason,
      message: publicException.message,
      retryable: true,
      code: status,
      status,
      prefix: "Gateway",
    },
  });
});

test.each([
  400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504,
])("preserves HTTP %s even when the response body is unusable", async status => {
  for (const [body, contentType] of [
    ["<html>private upstream diagnostic</html>", "text/html"],
    ["private truncated JSON", "application/json"],
    [JSON.stringify({ success: false }), "application/json"],
    [
      JSON.stringify({ exception: { message: "private diagnostic" } }),
      "application/json",
    ],
    ["null", "application/json"],
  ]) {
    const response = new Response(body, {
      status,
      headers: { "Content-Type": contentType },
    });
    const error = await readAPIResponse(response).catch(error => error);

    expect(error).toBeInstanceOf(NotegicAPIError);
    if (!(error instanceof NotegicAPIError)) throw error;
    expect(error.unWrap.status).toBe(status);
    expect(error.unWrap.code).toBe(status);
    expect(JSON.stringify(error.unWrap)).not.toContain("private");
  }
});

test("uses the HTTP status instead of a conflicting legacy body status without replacing its domain code", async () => {
  await expect(
    readAPIResponse(
      Response.json(
        {
          exception: {
            code: 99000001,
            prefix: "Gateway",
            reason: "Unauthorized",
            message: "Rejected",
            status: 500,
          },
        },
        { status: 401 }
      )
    )
  ).rejects.toMatchObject({ unWrap: { code: 99000001, status: 401 } });
});

test("retains a legacy application error carried by HTTP 200", async () => {
  await expect(
    readAPIResponse(
      Response.json({
        exception: {
          code: 99000001,
          prefix: "Gateway",
          reason: "DefinitionConflict",
          message: "Rejected",
          status: 409,
        },
      })
    )
  ).rejects.toMatchObject({ unWrap: { code: 99000001, status: 409 } });
});

test.each([
  200, 201, 202,
])("does not alter successful HTTP %s data or refresh tokens", async status => {
  const body = {
    success: true,
    data: { id: "retained" },
    exception: null,
    refreshableTokens: { newCSRFToken: "fixture" },
  };
  await expect(
    readAPIResponse(Response.json(body, { status }))
  ).resolves.toEqual(body);
});

test("rejects a malformed successful response with a safe protocol error", async () => {
  await expect(
    readAPIResponse(
      new Response("private malformed JSON", {
        headers: { "Content-Type": "application/json" },
      })
    )
  ).rejects.toMatchObject({
    unWrap: { status: 500, reason: "InternalServerError" },
  });
});

test.each([
  { status: 401, retryable: true, retry: false },
  { status: 429, retryable: true, retry: false },
  { status: 503, retryable: true, retry: true },
  { status: 503, retryable: false, retry: false },
])("classifies HTTP $status and retryable=$retryable correctly", async ({
  status,
  retryable,
  retry,
}) => {
  const error = await readAPIResponse(
    Response.json({ exception: { ...publicException, retryable } }, { status })
  ).catch(error => error);
  const client = makeQueryClient();
  for (const options of [
    client.getDefaultOptions().queries,
    client.getDefaultOptions().mutations,
  ]) {
    const retryPolicy = options?.retry as (
      count: number,
      error: unknown
    ) => boolean;
    expect(retryPolicy(0, error)).toBe(retry);
    expect(retryPolicy(1, error)).toBe(false);
  }
  client.clear();
});
