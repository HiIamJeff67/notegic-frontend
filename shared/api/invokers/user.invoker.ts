import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  GetMe,
  GetUserData,
  UpdateMe,
} from "@shared/api/functions/user.serverFn";
import {
  type GetMeRequest,
  GetMeRequestSchema,
  type GetMeResponse,
  GetMeResponseSchema,
  type GetUserDataRequest,
  GetUserDataRequestSchema,
  type GetUserDataResponse,
  GetUserDataResponseSchema,
  type UpdateMeRequest,
  UpdateMeRequestSchema,
  type UpdateMeResponse,
  UpdateMeResponseSchema,
} from "@shared/api/interfaces/user.interface";
import { ZodError } from "zod";

export const queryFnGetUserData = async (
  request: GetUserDataRequest
): Promise<GetUserDataResponse> => {
  try {
    const validatedRequest = GetUserDataRequestSchema.parse(request);
    const response = await GetUserData({ data: validatedRequest });
    return GetUserDataResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetUserData", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error("error.apiError.getUser.failedToGetUser");
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};

export const queryFnGetMe = async (
  request: GetMeRequest
): Promise<GetMeResponse> => {
  try {
    const validatedRequest = GetMeRequestSchema.parse(request);
    const response = await GetMe({ data: validatedRequest });
    return GetMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMe", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error("error.apiError.getUser.failedToGetUser");
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};

export const mutationFnUpdateMe = async (
  request: UpdateMeRequest
): Promise<UpdateMeResponse> => {
  try {
    const validatedRequest = UpdateMeRequestSchema.parse(request);
    const response = await UpdateMe({ data: validatedRequest });
    return UpdateMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMe", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error("error.apiError.getUser.failedToGetUser");
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};
