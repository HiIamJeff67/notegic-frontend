import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type BindGoogleAccountRequest,
  type BindGithubAccountRequest,
  type BindMetaAccountRequest,
  BindGoogleAccountRequestSchema,
  BindGithubAccountRequestSchema,
  BindMetaAccountRequestSchema,
  type BindGoogleAccountResponse,
  type BindGithubAccountResponse,
  type BindMetaAccountResponse,
  BindGoogleAccountResponseSchema,
  BindGithubAccountResponseSchema,
  BindMetaAccountResponseSchema,
  type GetMyAccountRequest,
  GetMyAccountRequestSchema,
  type GetMyAccountResponse,
  GetMyAccountResponseSchema,
  type UnbindGoogleAccountRequest,
  type UnbindGithubAccountRequest,
  type UnbindMetaAccountRequest,
  UnbindGoogleAccountRequestSchema,
  UnbindGithubAccountRequestSchema,
  UnbindMetaAccountRequestSchema,
  type UnbindGoogleAccountResponse,
  type UnbindGithubAccountResponse,
  type UnbindMetaAccountResponse,
  UnbindGoogleAccountResponseSchema,
  UnbindGithubAccountResponseSchema,
  UnbindMetaAccountResponseSchema,
  type UpdateMyAccountRequest,
  UpdateMyAccountRequestSchema,
  type UpdateMyAccountResponse,
  UpdateMyAccountResponseSchema,
} from "@shared/api/interfaces/userAccount.interface";
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import {
  BindGoogleAccount,
  BindGithubAccount,
  BindMetaAccount,
  GetMyAccount,
  UnbindGoogleAccount,
  UnbindGithubAccount,
  UnbindMetaAccount,
  UpdateMyAccount,
} from "@/api/functions/userAccount.serverFn";

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
          throw error;
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
  const validatedRequest = parseRequest(UpdateMyAccountRequestSchema, request);
  try {
    const response = await UpdateMyAccount({ data: validatedRequest });
    return UpdateMyAccountResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyAccount", error);
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

export const mutationFnBindGithubAccount = async (
  request: BindGithubAccountRequest
): Promise<BindGithubAccountResponse> => {
  try {
    const validatedRequest = BindGithubAccountRequestSchema.parse(request);
    const response = await BindGithubAccount({
      data: validatedRequest,
    });
    return BindGithubAccountResponseSchema.parse(response);
  } catch (error) {
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

export const mutationFnBindMetaAccount = async (
  request: BindMetaAccountRequest
): Promise<BindMetaAccountResponse> => {
  try {
    const validatedRequest = BindMetaAccountRequestSchema.parse(request);
    const response = await BindMetaAccount({
      data: validatedRequest,
    });
    return BindMetaAccountResponseSchema.parse(response);
  } catch (error) {
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

export const mutationFnUnbindGithubAccount = async (
  request: UnbindGithubAccountRequest
): Promise<UnbindGithubAccountResponse> => {
  try {
    const validatedRequest = UnbindGithubAccountRequestSchema.parse(request);
    const response = await UnbindGithubAccount({
      data: validatedRequest,
    });
    return UnbindGithubAccountResponseSchema.parse(response);
  } catch (error) {
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

export const mutationFnUnbindMetaAccount = async (
  request: UnbindMetaAccountRequest
): Promise<UnbindMetaAccountResponse> => {
  try {
    const validatedRequest = UnbindMetaAccountRequestSchema.parse(request);
    const response = await UnbindMetaAccount({
      data: validatedRequest,
    });
    return UnbindMetaAccountResponseSchema.parse(response);
  } catch (error) {
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
