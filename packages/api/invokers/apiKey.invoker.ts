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
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const mutationFnCreateMyAPIKey = async (
  request: CreateMyAPIKeyRequest,
  func: (request: CreateMyAPIKeyRequest) => Promise<CreateMyAPIKeyResponse>
): Promise<CreateMyAPIKeyResponse> => {
  const validatedRequest = parse(CreateMyAPIKeyRequestSchema, request);
  try {
    return CreateMyAPIKeyResponseSchema.parse(await func(validatedRequest));
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    }
    if (error instanceof NotegicAPIError) throw error;
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnListMyAPIKeys = async (
  request: ListMyAPIKeysRequest,
  func: (request: ListMyAPIKeysRequest) => Promise<ListMyAPIKeysResponse>
): Promise<ListMyAPIKeysResponse> => {
  try {
    return ListMyAPIKeysResponseSchema.parse(
      await func(ListMyAPIKeysRequestSchema.parse(request))
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

export const mutationFnRevokeMyAPIKey = async (
  request: RevokeMyAPIKeyRequest,
  func: (request: RevokeMyAPIKeyRequest) => Promise<RevokeMyAPIKeyResponse>
): Promise<RevokeMyAPIKeyResponse> => {
  try {
    return RevokeMyAPIKeyResponseSchema.parse(
      await func(RevokeMyAPIKeyRequestSchema.parse(request))
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
