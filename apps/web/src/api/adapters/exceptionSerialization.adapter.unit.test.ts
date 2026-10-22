import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { createQueryClient } from "@shared/api/queryClient";
import { tError } from "@shared/i18n/error";
import { resources } from "@shared/i18n";
import { makeSerovalPlugin } from "@tanstack/router-core";
import { createInstance } from "i18next";
import { fromJSON, toJSON } from "seroval";
import { apiErrorSerialization } from "./exceptionSerialization.adapter";
import { readAPIResponse } from "./apiResponse.adapter";

test.each([
  400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504,
])("retains backend HTTP %s through the server-function serialization round trip", async status => {
  const error = await readAPIResponse(
    Response.json(
      {
        exception: {
          reason: "RequestRejected",
          domain: "Gateway",
          operation: "Request",
          message: "Request rejected",
          retryable: false,
          details: "private diagnostic",
          origin: "private origin",
        },
      },
      { status }
    )
  ).catch(error => error);
  const plugins = [makeSerovalPlugin(apiErrorSerialization)];
  const serialized = toJSON(error, { plugins });
  const restored = fromJSON(serialized, { plugins }) as NotegicAPIError;

  expect(restored).toBeInstanceOf(NotegicAPIError);
  expect(restored.unWrap.status).toBe(status);
  expect(restored.unWrap.code).toBe(status);
  expect(JSON.stringify(serialized)).not.toContain("private");
});

test("restores API errors across the server function transport without internal diagnostics", async () => {
  const error = new NotegicAPIError(
    new NotegicException({
      code: 409,
      prefix: "Routine",
      reason: "DefinitionConflict",
      message: "The routine was changed; refresh before applying this edit",
      status: 409,
      retryable: false,
      details: { sql: "private diagnostic" },
      origin: "private database origin",
    })
  );
  const plugins = [makeSerovalPlugin(apiErrorSerialization)];
  const serialized = toJSON(error, { plugins });
  const restored = fromJSON(serialized, { plugins }) as NotegicAPIError;

  expect(restored).toBeInstanceOf(NotegicAPIError);
  expect(restored.unWrap.reason).toBe("DefinitionConflict");
  expect(restored.unWrap.status).toBe(409);
  expect(restored.unWrap.retryable).toBe(false);
  expect(restored.unWrap.origin).toBeUndefined();
  expect(restored.unWrap.details).toBeUndefined();
  expect(JSON.stringify(serialized)).not.toContain("private");

  const i18n = createInstance();
  await i18n.init({ resources, lng: "en", fallbackLng: false });
  expect(tError(restored, i18n.t)).toBe(
    i18n.t("server.error.DefinitionConflict")
  );
  const client = createQueryClient();
  const retry = client.getDefaultOptions().mutations?.retry as (
    count: number,
    error: unknown
  ) => boolean;
  expect(retry(0, restored)).toBe(false);
  client.clear();
});

test("does not classify unrelated errors as API errors", () => {
  expect(apiErrorSerialization.test(new Error("ordinary failure"))).toBe(false);
  expect(apiErrorSerialization.test({ name: "APIError" })).toBe(false);
  expect(() =>
    apiErrorSerialization.fromSerializable({
      code: 409,
      prefix: "Routine",
      reason: undefined as unknown as string,
      message: "Invalid transport",
      status: 409,
      retryable: false,
    })
  ).toThrow();
});
