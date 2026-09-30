import type { ServerTranslation } from "./server.type";

export const EnglishServerTranslation = {
  error: {
    InternalServerError: "Something went wrong on our side. Please try again.",
    InvalidDto: "Some submitted information is invalid.",
    InvalidInput: "The submitted input is invalid.",
    InvalidRequest: "The request is invalid.",
    InvalidAuthenticationCode: "The sign-in code is invalid or has expired.",
    TokenExchangeFailed: "Sign-in could not be completed. Please try again.",
    OAuthProviderUnavailable:
      "The sign-in provider is temporarily unavailable.",
    ResponseReadFailed: "The sign-in provider returned an unreadable response.",
    InvalidResponse: "The sign-in provider returned an invalid response.",
    WrongPassword: "The password is incorrect.",
    WrongAuthCode: "The verification code is incorrect.",
    LoginBlockedDueToTryingTooManyTimes:
      "Too many sign-in attempts. Please try again later.",
    AuthCodeBlockedDueToTryingTooManyTimes:
      "Too many verification code requests. Please try again later.",
    PermissionDeniedDueToUserRole:
      "Your account role does not allow this action.",
    PermissionDeniedDueToUserPlan:
      "Your current plan does not allow this action.",
    PermissionDeniedDueToInvalidRequestOriginDomain:
      "This request origin is not allowed.",
    PermissionDeniedDueToTooManyRequests:
      "Too many requests. Please wait and try again.",
    TurnstileVerificationFailed: "Human verification failed. Please try again.",
    TurnstileProviderUnavailable:
      "Human verification is temporarily unavailable.",
    InvalidCSRFToken:
      "Your security token is missing or invalid. Refresh the page and try again.",
    RefreshFailed: "Your session could not be refreshed. Please sign in again.",
    SessionUnavailable: "Your session is unavailable. Please sign in again.",
    InvalidSession: "Your session is invalid. Please sign in again.",
    Unauthorized: "Please sign in to continue.",
    PermissionDenied: "You do not have permission to perform this action.",
    NotFound: "The requested item could not be found.",
    DuplicateName: "This name is already in use.",
    DuplicateEmail: "This email address is already in use.",
    NoChanges: "No changes were made.",
    FailedToGet: "The requested information could not be loaded.",
    FailedToCreate: "The item could not be created. Please try again.",
    FailedToUpdate: "The item could not be updated. Please try again.",
    FailedToDelete: "The item could not be deleted. Please try again.",
    QueryFailed: "The request could not be completed. Please try again.",
    GenerationFailed: "The requested item could not be generated.",
    FileTooLarge: "The file is too large.",
    InvalidType: "The file type is not supported.",
    StorageUnavailable: "File storage is temporarily unavailable.",
    EmailServiceUnavailable: "Email delivery is temporarily unavailable.",
    InvalidChannelPermission:
      "You do not have permission to access this channel.",
    RoomAdmissionUnavailable:
      "A realtime connection could not be established. Please try again.",
  },
} satisfies ServerTranslation;
