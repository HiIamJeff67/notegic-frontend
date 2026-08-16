import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  GetMyBlockById,
  GetMyBlocksByBlockPackId,
  GetMyBlocksByIds,
} from "@shared/api/functions/block.serverFn";
import {
  type GetMyBlockByIdRequest,
  GetMyBlockByIdRequestSchema,
  GetMyBlockByIdResponse,
  GetMyBlockByIdResponseSchema,
  type GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdRequestSchema,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByBlockPackIdResponseSchema,
  type GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsRequestSchema,
  GetMyBlocksByIdsResponse,
  GetMyBlocksByIdsResponseSchema,
} from "@shared/api/interfaces/block.interface";
import { ZodError } from "zod";

export const queryFnGetMyBlockById = async (
  request: GetMyBlockByIdRequest
): Promise<GetMyBlockByIdResponse> => {
  try {
    const validatedRequest = GetMyBlockByIdRequestSchema.parse(request);
    const response = await GetMyBlockById({ data: validatedRequest });
    return GetMyBlockByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockById", error);
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

export const queryFnGetMyBlocksByIds = async (
  request: GetMyBlocksByIdsRequest
): Promise<GetMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = GetMyBlocksByIdsRequestSchema.parse(request);
    const response = await GetMyBlocksByIds({ data: validatedRequest });
    return GetMyBlocksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlocksByIds", error);
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

export const queryFnGetMyBlocksByBlockPackId = async (
  request: GetMyBlocksByBlockPackIdRequest
): Promise<GetMyBlocksByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlocksByBlockPackIdRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockPackId({
      data: validatedRequest,
    });
    return GetMyBlocksByBlockPackIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlocksByBlockPackId", error);
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
