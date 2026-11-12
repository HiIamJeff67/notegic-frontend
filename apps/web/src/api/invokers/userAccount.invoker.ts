import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type BindGoogleAccountRequest,
  type BindGithubAccountRequest,
  type BindXAccountRequest,
  type BindDiscordAccountRequest,
  BindGoogleAccountRequestSchema,
  BindGithubAccountRequestSchema,
  BindXAccountRequestSchema,
  BindDiscordAccountRequestSchema,
  type BindGoogleAccountResponse,
  type BindGithubAccountResponse,
  type BindXAccountResponse,
  type BindDiscordAccountResponse,
  BindGoogleAccountResponseSchema,
  BindGithubAccountResponseSchema,
  BindXAccountResponseSchema,
  BindDiscordAccountResponseSchema,
  type GetMyAccountResponse,
  GetMyAccountResponseSchema,
  type UnbindGoogleAccountRequest,
  type UnbindGithubAccountRequest,
  type UnbindXAccountRequest,
  type UnbindDiscordAccountRequest,
  UnbindGoogleAccountRequestSchema,
  UnbindGithubAccountRequestSchema,
  UnbindXAccountRequestSchema,
  UnbindDiscordAccountRequestSchema,
  type UnbindGoogleAccountResponse,
  type UnbindGithubAccountResponse,
  type UnbindXAccountResponse,
  type UnbindDiscordAccountResponse,
  UnbindGoogleAccountResponseSchema,
  UnbindGithubAccountResponseSchema,
  UnbindXAccountResponseSchema,
  UnbindDiscordAccountResponseSchema,
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
  BindXAccount,
  BindDiscordAccount,
  GetMyAccount,
  UnbindGoogleAccount,
  UnbindGithubAccount,
  UnbindXAccount,
  UnbindDiscordAccount,
  UpdateMyAccount,
} from "@/api/functions/userAccount.serverFn";

export const queryFnGetMyAccount = async (): Promise<GetMyAccountResponse> => {
  try {
    const response = await GetMyAccount();
    return GetMyAccountResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof TypeError) {
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

export const mutationFnBindXAccount = async (
  request: BindXAccountRequest
): Promise<BindXAccountResponse> => {
  try {
    const validatedRequest = BindXAccountRequestSchema.parse(request);
    const response = await BindXAccount({
      data: validatedRequest,
    });
    return BindXAccountResponseSchema.parse(response);
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

export const mutationFnBindDiscordAccount = async (
  request: BindDiscordAccountRequest
): Promise<BindDiscordAccountResponse> => {
  try {
    const validatedRequest = BindDiscordAccountRequestSchema.parse(request);
    const response = await BindDiscordAccount({
      data: validatedRequest,
    });
    return BindDiscordAccountResponseSchema.parse(response);
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

export const mutationFnUnbindXAccount = async (
  request: UnbindXAccountRequest
): Promise<UnbindXAccountResponse> => {
  try {
    const validatedRequest = UnbindXAccountRequestSchema.parse(request);
    const response = await UnbindXAccount({
      data: validatedRequest,
    });
    return UnbindXAccountResponseSchema.parse(response);
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

export const mutationFnUnbindDiscordAccount = async (
  request: UnbindDiscordAccountRequest
): Promise<UnbindDiscordAccountResponse> => {
  try {
    const validatedRequest = UnbindDiscordAccountRequestSchema.parse(request);
    const response = await UnbindDiscordAccount({
      data: validatedRequest,
    });
    return UnbindDiscordAccountResponseSchema.parse(response);
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
