import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type CreateMyAPIKeyRequest,
  CreateMyAPIKeyRequestSchema,
  type CreateMyAPIKeyResponse,
  CreateMyAPIKeyResponseSchema,
  type ListMyAPIKeysRequest,
  ListMyAPIKeysRequestSchema,
  type ListMyAPIKeysResponse,
  ListMyAPIKeysResponseSchema,
  type RevokeMyAPIKeyRequest,
  RevokeMyAPIKeyRequestSchema,
  type RevokeMyAPIKeyResponse,
  RevokeMyAPIKeyResponseSchema,
} from "@shared/api/interfaces/apiKey.interface";
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import {
  CreateMyAPIKey,
  ListMyAPIKeys,
  RevokeMyAPIKey,
} from "@/api/functions/apiKey.serverFn";

const rethrowAPIKeyError = (error: unknown): never => {
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
};

export const mutationFnCreateMyAPIKey = async (
  request: CreateMyAPIKeyRequest
): Promise<CreateMyAPIKeyResponse> => {
  const validatedRequest = parseRequest(CreateMyAPIKeyRequestSchema, request);
  try {
    return CreateMyAPIKeyResponseSchema.parse(
      await CreateMyAPIKey({
        data: validatedRequest,
      })
    );
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    }
    return rethrowAPIKeyError(error);
  }
};

export const queryFnListMyAPIKeys = async (
  request: ListMyAPIKeysRequest
): Promise<ListMyAPIKeysResponse> => {
  try {
    return ListMyAPIKeysResponseSchema.parse(
      await ListMyAPIKeys({
        data: ListMyAPIKeysRequestSchema.parse(request),
      })
    );
  } catch (error) {
    return rethrowAPIKeyError(error);
  }
};

export const mutationFnRevokeMyAPIKey = async (
  request: RevokeMyAPIKeyRequest
): Promise<RevokeMyAPIKeyResponse> => {
  try {
    return RevokeMyAPIKeyResponseSchema.parse(
      await RevokeMyAPIKey({
        data: RevokeMyAPIKeyRequestSchema.parse(request),
      })
    );
  } catch (error) {
    return rethrowAPIKeyError(error);
  }
};
