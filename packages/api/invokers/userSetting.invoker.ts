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

export const queryFnGetMySetting = async (
  request: GetMySettingRequest,
  func: (
    request: GetMySettingRequest,
    signal?: AbortSignal
  ) => Promise<GetMySettingResponse>,
  signal?: AbortSignal
): Promise<GetMySettingResponse> => {
  const retryClient = getRetryClient();
  retryClient.assertReady(UserSettingExceptions.RetryScope, retryAt => {
    throw UserSettingExceptions.TooManyRequests(retryAt);
  });
  try {
    const response = await func(
      GetMySettingRequestSchema.parse(request),
      signal
    );
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
  request: UpdateMySettingRequest,
  func: (request: UpdateMySettingRequest) => Promise<UpdateMySettingResponse>
): Promise<UpdateMySettingResponse> => {
  const retryClient = getRetryClient();
  retryClient.assertReady(UserSettingExceptions.RetryScope, retryAt => {
    throw UserSettingExceptions.TooManyRequests(retryAt);
  });
  try {
    const response = await func(UpdateMySettingRequestSchema.parse(request));
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
