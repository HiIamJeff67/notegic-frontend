import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type BindDiscordAccountRequest,
  BindDiscordAccountRequestSchema,
  type BindDiscordAccountResponse,
  BindDiscordAccountResponseSchema,
  type BindGithubAccountRequest,
  BindGithubAccountRequestSchema,
  type BindGithubAccountResponse,
  BindGithubAccountResponseSchema,
  type BindGoogleAccountRequest,
  BindGoogleAccountRequestSchema,
  type BindGoogleAccountResponse,
  BindGoogleAccountResponseSchema,
  type BindXAccountRequest,
  BindXAccountRequestSchema,
  type BindXAccountResponse,
  BindXAccountResponseSchema,
  type GetMyAccountResponse,
  GetMyAccountResponseSchema,
  type UnbindDiscordAccountRequest,
  UnbindDiscordAccountRequestSchema,
  type UnbindDiscordAccountResponse,
  UnbindDiscordAccountResponseSchema,
  type UnbindGithubAccountRequest,
  UnbindGithubAccountRequestSchema,
  type UnbindGithubAccountResponse,
  UnbindGithubAccountResponseSchema,
  type UnbindGoogleAccountRequest,
  UnbindGoogleAccountRequestSchema,
  type UnbindGoogleAccountResponse,
  UnbindGoogleAccountResponseSchema,
  type UnbindXAccountRequest,
  UnbindXAccountRequestSchema,
  type UnbindXAccountResponse,
  UnbindXAccountResponseSchema,
  type UpdateMyAccountRequest,
  UpdateMyAccountRequestSchema,
  type UpdateMyAccountResponse,
  UpdateMyAccountResponseSchema,
} from "@shared/api/interfaces/userAccount.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const queryFnGetMyAccount = async (
  func: () => Promise<GetMyAccountResponse>
): Promise<GetMyAccountResponse> => {
  try {
    const response = await func();
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
  request: UpdateMyAccountRequest,
  func: (request: UpdateMyAccountRequest) => Promise<UpdateMyAccountResponse>
): Promise<UpdateMyAccountResponse> => {
  const validatedRequest = parse(UpdateMyAccountRequestSchema, request);
  try {
    const response = await func(validatedRequest);
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
  request: BindGoogleAccountRequest,
  func: (
    request: BindGoogleAccountRequest
  ) => Promise<BindGoogleAccountResponse>
): Promise<BindGoogleAccountResponse> => {
  try {
    const validatedRequest = BindGoogleAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: BindGithubAccountRequest,
  func: (
    request: BindGithubAccountRequest
  ) => Promise<BindGithubAccountResponse>
): Promise<BindGithubAccountResponse> => {
  try {
    const validatedRequest = BindGithubAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: BindXAccountRequest,
  func: (request: BindXAccountRequest) => Promise<BindXAccountResponse>
): Promise<BindXAccountResponse> => {
  try {
    const validatedRequest = BindXAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: BindDiscordAccountRequest,
  func: (
    request: BindDiscordAccountRequest
  ) => Promise<BindDiscordAccountResponse>
): Promise<BindDiscordAccountResponse> => {
  try {
    const validatedRequest = BindDiscordAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UnbindGoogleAccountRequest,
  func: (
    request: UnbindGoogleAccountRequest
  ) => Promise<UnbindGoogleAccountResponse>
): Promise<UnbindGoogleAccountResponse> => {
  try {
    const validatedRequest = UnbindGoogleAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UnbindGithubAccountRequest,
  func: (
    request: UnbindGithubAccountRequest
  ) => Promise<UnbindGithubAccountResponse>
): Promise<UnbindGithubAccountResponse> => {
  try {
    const validatedRequest = UnbindGithubAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UnbindXAccountRequest,
  func: (request: UnbindXAccountRequest) => Promise<UnbindXAccountResponse>
): Promise<UnbindXAccountResponse> => {
  try {
    const validatedRequest = UnbindXAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
  request: UnbindDiscordAccountRequest,
  func: (
    request: UnbindDiscordAccountRequest
  ) => Promise<UnbindDiscordAccountResponse>
): Promise<UnbindDiscordAccountResponse> => {
  try {
    const validatedRequest = UnbindDiscordAccountRequestSchema.parse(request);
    const response = await func(validatedRequest);
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
