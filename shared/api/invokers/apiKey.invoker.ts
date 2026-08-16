import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateMyAPIKey,
  ListMyAPIKeys,
  RevokeMyAPIKey,
} from "@shared/api/functions/apiKey.serverFn";
import {
  CreateMyAPIKeyRequestSchema,
  CreateMyAPIKeyResponseSchema,
  ListMyAPIKeysRequestSchema,
  ListMyAPIKeysResponseSchema,
  RevokeMyAPIKeyRequestSchema,
  RevokeMyAPIKeyResponseSchema,
  type CreateMyAPIKeyRequest,
  type CreateMyAPIKeyResponse,
  type ListMyAPIKeysRequest,
  type ListMyAPIKeysResponse,
  type RevokeMyAPIKeyRequest,
  type RevokeMyAPIKeyResponse,
} from "@shared/api/interfaces/apiKey.interface";
import { ZodError } from "zod";

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
  try {
    return CreateMyAPIKeyResponseSchema.parse(
      await CreateMyAPIKey({
        data: CreateMyAPIKeyRequestSchema.parse(request),
      })
    );
  } catch (error) {
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
