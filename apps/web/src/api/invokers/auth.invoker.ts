import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
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
import { ZodError } from "zod";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";

export const mutationFnRegister = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const validatedRequest = RegisterRequestSchema.parse(request);
    const response = await Register({ data: validatedRequest });
    return RegisterResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRegister", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
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
  try {
    const validatedRequest = RegisterViaGoogleRequestSchema.parse(request);
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
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
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
  try {
    const validatedRequest = LoginRequestSchema.parse(request);
    const response = await Login({ data: validatedRequest });
    return LoginResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLogin", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
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
  try {
    const validatedRequest = LoginViaGoogleRequestSchema.parse(request);
    const response = await LoginViaGoogle({ data: validatedRequest });
    return LoginViaGoogleResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLoginViaGoogle", error);
    console.error(error);
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed: ${errorMessage}`);
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
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
          throw new Error(error.unWrap.message);
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
  try {
    const validatedRequest = SendAuthCodeRequestSchema.parse(request);
    const response = await SendAuthCode({ data: validatedRequest });
    return SendAuthCodeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnSendAuthCode", error);
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
          throw new Error(error.unWrap.message);
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
  try {
    const validatedRequest = ValidateEmailRequestSchema.parse(request);
    const response = await ValidateEmail({ data: validatedRequest });
    return ValidateEmailResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnValidateEmail", error);
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
          throw new Error(error.unWrap.message);
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
  try {
    const validatedRequest = ResetEmailRequestSchema.parse(request);
    const response = await ResetEmail({ data: validatedRequest });
    return ResetEmailResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnResetEmail", error);
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
          throw new Error(error.unWrap.message);
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
  try {
    const validatedRequest = ForgetPasswordRequestSchema.parse(request);
    const response = await ForgetPassword({ data: validatedRequest });
    return ForgetPasswordResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnForgetPassword", error);
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
          throw new Error(error.unWrap.message);
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
  try {
    const validatedRequest = ResetMeRequestSchema.parse(request);
    const response = await ResetMe({ data: validatedRequest });
    return ResetMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnResetMe", error);
    console.error(error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      throw new Error(error.unWrap.message);
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};

export const mutationFnDeleteMe = async (
  request: DeleteMeRequest
): Promise<DeleteMeResponse> => {
  try {
    const validatedRequest = DeleteMeRequestSchema.parse(request);
    const response = await DeleteMe({ data: validatedRequest });
    return DeleteMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMe", error);
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
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
    }

    throw error;
  }
};
