import { runInNewContext } from "node:vm";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { createQueryClient } from "@shared/api/queryClient";
import { resources } from "@shared/i18n";
import { tError } from "@shared/i18n/error";
import { makeSerovalPlugin } from "@tanstack/router-core";
import { createInstance } from "i18next";
import { fromJSON, toJSON } from "seroval";
import { readAPIResponse } from "./apiResponse.adapter";
import { apiErrorSerialization } from "./exceptionSerialization.adapter";

jest.mock(
  "@tanstack/react-start",
  () => ({
    createIsomorphicFn: () => ({ server: () => ({ client: () => () => {} }) }),
  }),
  { virtual: true }
);
jest.mock(
  "@tanstack/react-start/server",
  () => ({ setResponseHeader: jest.fn() }),
  { virtual: true }
);

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

test("retains quota failures for localized presentation without retrying", async () => {
  const error = await readAPIResponse(
    Response.json(
      {
        success: false,
        data: null,
        exception: {
          reason: "QuotaExceeded",
          domain: "UserQuota",
          operation: "EnforceLimit",
          message: "The current plan's quota has been reached",
          retryable: false,
          details: "private diagnostic",
          origin: "private origin",
        },
      },
      { status: 403 }
    )
  ).catch(error => error);
  const plugins = [makeSerovalPlugin(apiErrorSerialization)];
  const serialized = toJSON(error, { plugins });
  const restored = fromJSON(serialized, { plugins }) as NotegicAPIError;

  expect(restored).toBeInstanceOf(NotegicAPIError);
  expect(restored.unWrap.reason).toBe("QuotaExceeded");
  expect(restored.unWrap.status).toBe(403);
  expect(restored.unWrap.origin).toBeUndefined();
  expect(restored.unWrap.details).toBeUndefined();
  expect(JSON.stringify(serialized)).not.toContain("private");

  const i18n = createInstance();
  await i18n.init({ resources, lng: "zh-TW", fallbackLng: false });
  expect(tError(restored, i18n.t)).toBe("已達到目前方案的使用額度。");
  const client = createQueryClient();
  for (const options of [
    client.getDefaultOptions().queries,
    client.getDefaultOptions().mutations,
  ]) {
    const retry = options?.retry as (count: number, error: unknown) => boolean;
    expect(retry(0, restored)).toBe(false);
  }
  client.clear();
});

test("does not classify unrelated errors as API errors", () => {
  expect(apiErrorSerialization.test(new Error("ordinary failure"))).toBe(false);
  expect(apiErrorSerialization.test({ name: "APIError" })).toBe(false);
  expect(
    apiErrorSerialization.test({ [Symbol.for("notegic/APIError")]: true })
  ).toBe(false);
  expect(
    apiErrorSerialization.test({
      [Symbol.for("notegic/APIError")]: true,
      unWrap: { reason: "QuotaExceeded" },
    })
  ).toBe(false);
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

test("recognises branded API errors across runtime realms", () => {
  const error = runInNewContext(
    `class APIError extends Error {
      constructor(exception) {
        super(exception.reason);
        this[Symbol.for("notegic/APIError")] = true;
        this.unWrap = exception;
      }
    }
    new APIError(exception)`,
    {
      exception: new NotegicException(
        {
          reason: "RescheduleRequired",
          domain: "Routine",
          operation: "Activate",
          message: "Choose a future schedule before activating this routine",
          retryable: false,
        },
        409
      ),
    }
  );
  expect(error).not.toBeInstanceOf(Error);
  expect(apiErrorSerialization.test(error)).toBe(true);
  const plugins = [makeSerovalPlugin(apiErrorSerialization)];
  const restored = fromJSON(toJSON(error, { plugins }), {
    plugins,
  }) as NotegicAPIError;
  expect(restored).toBeInstanceOf(NotegicAPIError);
  expect(restored.unWrap.reason).toBe("RescheduleRequired");
  expect(restored.unWrap.status).toBe(409);
  expect(restored.unWrap.retryable).toBe(false);
});

test("recognises API errors from a reloaded module before the shallow Error plugin", () => {
  let reloaded: typeof import("@shared/api/exceptions");
  jest.isolateModules(() => {
    reloaded = require("@shared/api/exceptions");
  });
  const error = new reloaded!.NotegicAPIError(
    new reloaded!.NotegicException(
      {
        reason: "DefinitionConflict",
        domain: "Routine",
        operation: "UpdateDefinition",
        message: "The routine was changed; refresh before applying this edit",
        retryable: false,
      },
      409
    )
  );
  expect(error).toBeInstanceOf(NotegicAPIError);
  expect(apiErrorSerialization.test(error)).toBe(true);
  const plugins = [makeSerovalPlugin(apiErrorSerialization)];
  const restored = fromJSON(toJSON(error, { plugins }), {
    plugins,
  }) as NotegicAPIError;
  expect(restored).toBeInstanceOf(reloaded!.NotegicAPIError);
  expect(restored.unWrap.status).toBe(409);
  expect(restored.unWrap.reason).toBe("DefinitionConflict");
});
