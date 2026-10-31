import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  GetMyQuotaRequest,
  GetMyQuotaRequestSchema,
  GetMyQuotaResponse,
  GetMyQuotaResponseSchema,
} from "@shared/api/interfaces/userQuota.interface";
import { ZodError } from "zod";
import { GetMyQuota } from "@/api/functions/userQuota.serverFn";

export const queryFnGetMyQuota = async (
  request: GetMyQuotaRequest
): Promise<GetMyQuotaResponse> => {
  try {
    const validatedRequest = GetMyQuotaRequestSchema.parse(request);
    const response = await GetMyQuota({ data: validatedRequest });
    return GetMyQuotaResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof NotegicAPIError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
