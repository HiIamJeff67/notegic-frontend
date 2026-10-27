import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
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
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import { UpdateMyInfo } from "@/api/functions/userInfo.clientFn";
import { GetMyInfo } from "@/api/functions/userInfo.serverFn";

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
          throw error;
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
  const validatedRequest = parseRequest(UpdateMyInfoRequestSchema, request);
  try {
    const response = await UpdateMyInfo(validatedRequest);
    return UpdateMyInfoResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyInfo", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
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
