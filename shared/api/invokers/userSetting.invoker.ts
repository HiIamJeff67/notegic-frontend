import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  GetMySetting,
  UpdateMySetting,
} from "@shared/api/functions/userSetting.serverFn";
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

export const queryFnGetMySetting = async (
  request: GetMySettingRequest
): Promise<GetMySettingResponse> => {
  try {
    return GetMySettingResponseSchema.parse(
      await GetMySetting({ data: GetMySettingRequestSchema.parse(request) })
    );
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
    return UpdateMySettingResponseSchema.parse(
      await UpdateMySetting({
        data: UpdateMySettingRequestSchema.parse(request),
      })
    );
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
