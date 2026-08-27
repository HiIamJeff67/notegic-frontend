import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  BindGoogleAccount,
  GetMyAccount,
  UnbindGoogleAccount,
  UpdateMyAccount,
} from "@/api/functions/userAccount.serverFn";
import {
  type BindGoogleAccountRequest,
  BindGoogleAccountRequestSchema,
  type BindGoogleAccountResponse,
  BindGoogleAccountResponseSchema,
  type GetMyAccountRequest,
  GetMyAccountRequestSchema,
  type GetMyAccountResponse,
  GetMyAccountResponseSchema,
  type UnbindGoogleAccountRequest,
  UnbindGoogleAccountRequestSchema,
  type UnbindGoogleAccountResponse,
  UnbindGoogleAccountResponseSchema,
  type UpdateMyAccountRequest,
  UpdateMyAccountRequestSchema,
  type UpdateMyAccountResponse,
  UpdateMyAccountResponseSchema,
} from "@shared/api/interfaces/userAccount.interface";
import { ZodError } from "zod";

export const queryFnGetMyAccount = async (
  request: GetMyAccountRequest
): Promise<GetMyAccountResponse> => {
  try {
    const validatedRequest = GetMyAccountRequestSchema.parse(request);
    const response = await GetMyAccount({ data: validatedRequest });
    return GetMyAccountResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyAccount", error);
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

export const mutationFnUpdateMyAccount = async (
  request: UpdateMyAccountRequest
): Promise<UpdateMyAccountResponse> => {
  try {
    const validatedRequest = UpdateMyAccountRequestSchema.parse(request);
    const response = await UpdateMyAccount({ data: validatedRequest });
    return UpdateMyAccountResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyAccount", error);
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

export const mutationFnBindGoogleAccount = async (
  request: BindGoogleAccountRequest
): Promise<BindGoogleAccountResponse> => {
  try {
    const validatedRequest = BindGoogleAccountRequestSchema.parse(request);
    const response = await BindGoogleAccount({
      data: validatedRequest,
    });
    return BindGoogleAccountResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnBindGoogleAccount", error);
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

export const mutationFnUnbindGoogleAccount = async (
  request: UnbindGoogleAccountRequest
): Promise<UnbindGoogleAccountResponse> => {
  try {
    const validatedRequest = UnbindGoogleAccountRequestSchema.parse(request);
    const response = await UnbindGoogleAccount({
      data: validatedRequest,
    });
    return UnbindGoogleAccountResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUnbindGoogleAccount", error);
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
