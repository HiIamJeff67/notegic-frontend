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
  type LoginViaGoogleRequest,
  LoginViaGoogleRequestSchema,
  type LoginViaGoogleResponse,
  LoginViaGoogleResponseSchema,
  type LogoutRequest,
  LogoutRequestSchema,
  type LogoutResponse,
  LogoutResponseSchema,
  type RegisterRequest,
  RegisterRequestSchema,
  type RegisterResponse,
  RegisterResponseSchema,
  type RegisterViaGoogleRequest,
  RegisterViaGoogleRequestSchema,
  type RegisterViaGoogleResponse,
  RegisterViaGoogleResponseSchema,
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
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import {
  DeleteMe,
  ForgetPassword,
  Login,
  LoginViaGoogle,
  Logout,
  Register,
  RegisterViaGoogle,
  ResetEmail,
  ResetMe,
  SendAuthCode,
  ValidateEmail,
} from "@/api/functions/auth.serverFn";

export const mutationFnRegister = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  const validatedRequest = parseRequest(RegisterRequestSchema, request);
  try {
    const response = await Register({ data: validatedRequest });
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
  request: RegisterViaGoogleRequest
): Promise<RegisterViaGoogleResponse> => {
  const validatedRequest = parseRequest(
    RegisterViaGoogleRequestSchema,
    request
  );
  try {
    const response = await RegisterViaGoogle({
      data: validatedRequest,
    });
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

export const mutationFnLogin = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  const validatedRequest = parseRequest(LoginRequestSchema, request);
  try {
    const response = await Login({ data: validatedRequest });
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
  request: LoginViaGoogleRequest
): Promise<LoginViaGoogleResponse> => {
  const validatedRequest = parseRequest(LoginViaGoogleRequestSchema, request);
  try {
    const response = await LoginViaGoogle({ data: validatedRequest });
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

export const mutationFnLogout = async (
  request: LogoutRequest
): Promise<LogoutResponse> => {
  try {
    const validatedRequest = LogoutRequestSchema.parse(request);
    const response = await Logout({ data: validatedRequest });
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
  request: SendAuthCodeRequest
): Promise<SendAuthCodeResponse> => {
  const validatedRequest = parseRequest(SendAuthCodeRequestSchema, request);
  try {
    const response = await SendAuthCode({ data: validatedRequest });
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
  request: ValidateEmailRequest
): Promise<ValidateEmailResponse> => {
  const validatedRequest = parseRequest(ValidateEmailRequestSchema, request);
  try {
    const response = await ValidateEmail({ data: validatedRequest });
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
  request: ResetEmailRequest
): Promise<ResetEmailResponse> => {
  const validatedRequest = parseRequest(ResetEmailRequestSchema, request);
  try {
    const response = await ResetEmail({ data: validatedRequest });
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
  request: ForgetPasswordRequest
): Promise<ForgetPasswordResponse> => {
  const validatedRequest = parseRequest(ForgetPasswordRequestSchema, request);
  try {
    const response = await ForgetPassword({ data: validatedRequest });
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
  request: ResetMeRequest
): Promise<ResetMeResponse> => {
  const validatedRequest = parseRequest(ResetMeRequestSchema, request);
  try {
    const response = await ResetMe({ data: validatedRequest });
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
  request: DeleteMeRequest
): Promise<DeleteMeResponse> => {
  const validatedRequest = parseRequest(DeleteMeRequestSchema, request);
  try {
    const response = await DeleteMe({ data: validatedRequest });
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
