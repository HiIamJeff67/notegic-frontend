import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  GetMySettingRequest,
  GetMySettingRequestSchema,
  GetMySettingResponse,
  GetMySettingResponseSchema,
  UpdateMySettingRequest,
  UpdateMySettingRequestSchema,
  UpdateMySettingResponse,
  UpdateMySettingResponseSchema,
} from "@shared/api/interfaces/userSetting.interface";
import { ZodError } from "zod";
import {
  GetMySetting,
  UpdateMySetting,
} from "@/api/functions/userSetting.serverFn";
import { getRetryAt } from "@/api/retry";

// Shared by settings reads and writes in this browser, never by SSR users.
let rateLimitedUntil = 0;

export class UserSettingsRateLimitError extends Error {
  constructor(public readonly retryAt: number) {
    super("User settings requests are temporarily paused after HTTP 429");
  }
}

const fetchUserSettings: typeof fetch = async (input, init) => {
  if (Date.now() < rateLimitedUntil)
    throw new UserSettingsRateLimitError(rateLimitedUntil);
  const response = await fetch(input, init);
  if (response.status === 429) {
    const retryAt = getRetryAt(response.headers.get("Retry-After"));
    if (typeof window !== "undefined")
      rateLimitedUntil = Math.max(rateLimitedUntil, retryAt);
    throw new UserSettingsRateLimitError(retryAt);
  }
  return response;
};

export const queryFnGetMySetting = async (
  request: GetMySettingRequest,
  signal?: AbortSignal
): Promise<GetMySettingResponse> => {
  try {
    if (Date.now() < rateLimitedUntil)
      throw new UserSettingsRateLimitError(rateLimitedUntil);
    const response = await GetMySetting({
      data: GetMySettingRequestSchema.parse(request),
      signal,
      fetch: fetchUserSettings,
    });
    if ("rateLimitedUntil" in response) {
      if (typeof window !== "undefined")
        rateLimitedUntil = Math.max(
          rateLimitedUntil,
          response.rateLimitedUntil
        );
      throw new UserSettingsRateLimitError(response.rateLimitedUntil);
    }
    return GetMySettingResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof NotegicAPIError) throw error;
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateMySetting = async (
  request: UpdateMySettingRequest
): Promise<UpdateMySettingResponse> => {
  try {
    if (Date.now() < rateLimitedUntil)
      throw new UserSettingsRateLimitError(rateLimitedUntil);
    const response = await UpdateMySetting({
      data: UpdateMySettingRequestSchema.parse(request),
      fetch: fetchUserSettings,
    });
    if ("rateLimitedUntil" in response) {
      if (typeof window !== "undefined")
        rateLimitedUntil = Math.max(
          rateLimitedUntil,
          response.rateLimitedUntil
        );
      throw new UserSettingsRateLimitError(response.rateLimitedUntil);
    }
    return UpdateMySettingResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof NotegicAPIError) throw error;
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
