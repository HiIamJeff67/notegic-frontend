import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { ZodError, type ZodType } from "zod";

export async function invokeVisualizeQuery<TRequest, TResponse>(
  request: TRequest,
  requestSchema: ZodType<TRequest>,
  responseSchema: ZodType<TResponse>,
  serverFunction: (options: { data: TRequest }) => Promise<unknown>,
  operationName: string
): Promise<TResponse> {
  try {
    const validatedRequest = requestSchema.parse(request);
    const response = await serverFunction({ data: validatedRequest });
    return responseSchema.parse(response);
  } catch (error) {
    console.error(`error happening in ${operationName}`, error);
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
}
