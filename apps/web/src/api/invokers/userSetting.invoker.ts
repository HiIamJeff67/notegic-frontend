import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { UserSettingExceptions } from "@shared/api/exceptions/userSetting.exception";
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
import { getRetryClient, minimumRetryDelayMs } from "@shared/api/retryClient";
import { ZodError } from "zod";
import { fetchServerFunction } from "@/api/functions/serverFn";
import {
  GetMySetting,
  UpdateMySetting,
} from "@/api/functions/userSetting.serverFn";

export const queryFnGetMySetting = async (
  request: GetMySettingRequest,
  signal?: AbortSignal
): Promise<GetMySettingResponse> => {
  const retryClient = getRetryClient();
  retryClient.assertReady(UserSettingExceptions.RetryScope, retryAt => {
    throw UserSettingExceptions.TooManyRequests(retryAt);
  });
  try {
    const response = await GetMySetting({
      data: GetMySettingRequestSchema.parse(request),
      signal,
      fetch: retryClient.createFetch({
        scope: UserSettingExceptions.RetryScope,
        fetch: fetchServerFunction,
        minimumDelayMs: minimumRetryDelayMs,
        paused: retryAt => {
          throw UserSettingExceptions.TooManyRequests(retryAt);
        },
      }),
    });
    return GetMySettingResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof NotegicAPIError && error.unWrap.status === 429) {
      const retryAt = retryClient.pause(
        UserSettingExceptions.RetryScope,
        Date.now() + minimumRetryDelayMs
      );
      throw UserSettingExceptions.TooManyRequests(retryAt);
    }
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
  const retryClient = getRetryClient();
  retryClient.assertReady(UserSettingExceptions.RetryScope, retryAt => {
    throw UserSettingExceptions.TooManyRequests(retryAt);
  });
  try {
    const response = await UpdateMySetting({
      data: UpdateMySettingRequestSchema.parse(request),
      fetch: retryClient.createFetch({
        scope: UserSettingExceptions.RetryScope,
        fetch: fetchServerFunction,
        minimumDelayMs: minimumRetryDelayMs,
        paused: retryAt => {
          throw UserSettingExceptions.TooManyRequests(retryAt);
        },
      }),
    });
    return UpdateMySettingResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof NotegicAPIError && error.unWrap.status === 429) {
      const retryAt = retryClient.pause(
        UserSettingExceptions.RetryScope,
        Date.now() + minimumRetryDelayMs
      );
      throw UserSettingExceptions.TooManyRequests(retryAt);
    }
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
