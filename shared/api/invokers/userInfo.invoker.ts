import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  GetMyInfo,
  UpdateMyInfo,
} from "@shared/api/functions/userInfo.serverFn";
import {
  type GetMyInfoRequest,
  GetMyInfoRequestSchema,
  type GetMyInfoResponse,
  GetMyInfoResponseSchema,
  type UpdateMyInfoRequest,
  UpdateMyInfoRequestSchema,
  type UpdateMyInfoResponse,
  UpdateMyInfoResponseSchema,
} from "@shared/api/interfaces/userInfo.interface";
import { ZodError } from "zod";

export const queryFnGetMyInfo = async (
  request: GetMyInfoRequest
): Promise<GetMyInfoResponse> => {
  try {
    const validatedRequest = GetMyInfoRequestSchema.parse(request);
    const response = await GetMyInfo({ data: validatedRequest });
    return GetMyInfoResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyInfo", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateMyInfo = async (
  request: UpdateMyInfoRequest
): Promise<UpdateMyInfoResponse> => {
  try {
    const validatedRequest = UpdateMyInfoRequestSchema.parse(request);
    const response = await UpdateMyInfo({ data: validatedRequest });
    return UpdateMyInfoResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyInfo", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
