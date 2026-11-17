import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type DeleteMeRequest,
  DeleteMeRequestSchema,
  type DeleteMeResponse,
  DeleteMeResponseSchema,
  type ForgetPasswordRequest,
  ForgetPasswordRequestSchema,
  type ForgetPasswordResponse,
  ForgetPasswordResponseSchema,
  type LoginRequest,
  LoginRequestSchema,
  type LoginResponse,
  LoginResponseSchema,
  type LoginViaDiscordRequest,
  LoginViaDiscordRequestSchema,
  type LoginViaDiscordResponse,
  LoginViaDiscordResponseSchema,
  type LoginViaGithubRequest,
  LoginViaGithubRequestSchema,
  type LoginViaGithubResponse,
  LoginViaGithubResponseSchema,
  type LoginViaGoogleRequest,
  LoginViaGoogleRequestSchema,
  type LoginViaGoogleResponse,
  LoginViaGoogleResponseSchema,
  type LoginViaXRequest,
  LoginViaXRequestSchema,
  type LoginViaXResponse,
  LoginViaXResponseSchema,
  type LogoutRequest,
  LogoutRequestSchema,
  type LogoutResponse,
  LogoutResponseSchema,
  type RegisterRequest,
  RegisterRequestSchema,
  type RegisterResponse,
  RegisterResponseSchema,
  type RegisterViaDiscordRequest,
  RegisterViaDiscordRequestSchema,
  type RegisterViaDiscordResponse,
  RegisterViaDiscordResponseSchema,
  type RegisterViaGithubRequest,
  RegisterViaGithubRequestSchema,
  type RegisterViaGithubResponse,
  RegisterViaGithubResponseSchema,
  type RegisterViaGoogleRequest,
  RegisterViaGoogleRequestSchema,
  type RegisterViaGoogleResponse,
  RegisterViaGoogleResponseSchema,
  type RegisterViaXRequest,
  RegisterViaXRequestSchema,
  type RegisterViaXResponse,
  RegisterViaXResponseSchema,
  type ResetEmailRequest,
  ResetEmailRequestSchema,
  type ResetEmailResponse,
  ResetEmailResponseSchema,
  type ResetMeRequest,
  ResetMeRequestSchema,
  type ResetMeResponse,
  ResetMeResponseSchema,
  type SendAuthCodeRequest,
  SendAuthCodeRequestSchema,
  type SendAuthCodeResponse,
  SendAuthCodeResponseSchema,
  type ValidateEmailRequest,
  ValidateEmailRequestSchema,
  type ValidateEmailResponse,
  ValidateEmailResponseSchema,
} from "@shared/api/interfaces/auth.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const mutationFnRegister = async (
  request: RegisterRequest,
  func: (request: RegisterRequest) => Promise<RegisterResponse>
): Promise<RegisterResponse> => {
  const validatedRequest = parse(RegisterRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return RegisterResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRegister", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.duplicateName:
          throw error.setPresentation("error.apiError.register.duplicateName");

        case ExceptionReasonDictionary.user.duplicateEmail:
          throw error.setPresentation("error.apiError.register.duplicateEmail");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }
    throw error;
  }
};

export const mutationFnRegisterViaGoogle = async (
  request: RegisterViaGoogleRequest,
  func: (
    request: RegisterViaGoogleRequest
  ) => Promise<RegisterViaGoogleResponse>
): Promise<RegisterViaGoogleResponse> => {
  const validatedRequest = parse(RegisterViaGoogleRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return RegisterViaGoogleResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRegisterViaGoogle", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnRegisterViaGithub = async (
  request: RegisterViaGithubRequest,
  func: (
    request: RegisterViaGithubRequest
  ) => Promise<RegisterViaGithubResponse>
): Promise<RegisterViaGithubResponse> => {
  const validatedRequest = parse(RegisterViaGithubRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return RegisterViaGithubResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnRegisterViaX = async (
  request: RegisterViaXRequest,
  func: (request: RegisterViaXRequest) => Promise<RegisterViaXResponse>
): Promise<RegisterViaXResponse> => {
  const validatedRequest = parse(RegisterViaXRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return RegisterViaXResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnRegisterViaDiscord = async (
  request: RegisterViaDiscordRequest,
  func: (
    request: RegisterViaDiscordRequest
  ) => Promise<RegisterViaDiscordResponse>
): Promise<RegisterViaDiscordResponse> => {
  const validatedRequest = parse(RegisterViaDiscordRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return RegisterViaDiscordResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnLogin = async (
  request: LoginRequest,
  func: (request: LoginRequest) => Promise<LoginResponse>
): Promise<LoginResponse> => {
  const validatedRequest = parse(LoginRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return LoginResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLogin", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnLoginViaGoogle = async (
  request: LoginViaGoogleRequest,
  func: (request: LoginViaGoogleRequest) => Promise<LoginViaGoogleResponse>
): Promise<LoginViaGoogleResponse> => {
  const validatedRequest = parse(LoginViaGoogleRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return LoginViaGoogleResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLoginViaGoogle", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnLoginViaGithub = async (
  request: LoginViaGithubRequest,
  func: (request: LoginViaGithubRequest) => Promise<LoginViaGithubResponse>
): Promise<LoginViaGithubResponse> => {
  const validatedRequest = parse(LoginViaGithubRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return LoginViaGithubResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnLoginViaX = async (
  request: LoginViaXRequest,
  func: (request: LoginViaXRequest) => Promise<LoginViaXResponse>
): Promise<LoginViaXResponse> => {
  const validatedRequest = parse(LoginViaXRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return LoginViaXResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnLoginViaDiscord = async (
  request: LoginViaDiscordRequest,
  func: (request: LoginViaDiscordRequest) => Promise<LoginViaDiscordResponse>
): Promise<LoginViaDiscordResponse> => {
  const validatedRequest = parse(LoginViaDiscordRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return LoginViaDiscordResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("auth.validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnLogout = async (
  request: LogoutRequest,
  func: (request: LogoutRequest) => Promise<LogoutResponse>
): Promise<LogoutResponse> => {
  try {
    const validatedRequest = LogoutRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return LogoutResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLogout", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnSendAuthCode = async (
  request: SendAuthCodeRequest,
  func: (request: SendAuthCodeRequest) => Promise<SendAuthCodeResponse>
): Promise<SendAuthCodeResponse> => {
  const validatedRequest = parse(SendAuthCodeRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return SendAuthCodeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnSendAuthCode", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.auth.turnstileVerificationFailed:
          throw error.setPresentation("auth.turnstileRequired");

        case ExceptionReasonDictionary.auth.turnstileProviderUnavailable:
          throw error.setPresentation("auth.turnstileUnavailable");

        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnValidateEmail = async (
  request: ValidateEmailRequest,
  func: (request: ValidateEmailRequest) => Promise<ValidateEmailResponse>
): Promise<ValidateEmailResponse> => {
  const validatedRequest = parse(ValidateEmailRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return ValidateEmailResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnValidateEmail", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnResetEmail = async (
  request: ResetEmailRequest,
  func: (request: ResetEmailRequest) => Promise<ResetEmailResponse>
): Promise<ResetEmailResponse> => {
  const validatedRequest = parse(ResetEmailRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return ResetEmailResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnResetEmail", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnForgetPassword = async (
  request: ForgetPasswordRequest,
  func: (request: ForgetPasswordRequest) => Promise<ForgetPasswordResponse>
): Promise<ForgetPasswordResponse> => {
  const validatedRequest = parse(ForgetPasswordRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return ForgetPasswordResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnForgetPassword", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnResetMe = async (
  request: ResetMeRequest,
  func: (request: ResetMeRequest) => Promise<ResetMeResponse>
): Promise<ResetMeResponse> => {
  const validatedRequest = parse(ResetMeRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return ResetMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnResetMe", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      throw error;
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnDeleteMe = async (
  request: DeleteMeRequest,
  func: (request: DeleteMeRequest) => Promise<DeleteMeResponse>
): Promise<DeleteMeResponse> => {
  const validatedRequest = parse(DeleteMeRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return DeleteMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMe", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw error.setPresentation("error.apiError.getUser.failedToGetUser");

        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};
