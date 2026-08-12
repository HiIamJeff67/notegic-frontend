import { z } from "zod";
import { NotezyError } from "./errors";

/* ============================== Exception Definition ============================== */

export type ExceptionCode = number;
export type ExceptionPrefix = string;

export const ExceptionSubDomainCodeShiftAmount = 100000;
export const MaxExceptionCode = 99999999;
export const MinExceptionCode = 0;
export const ReservedExceptionCode = 100;

export function IsExceptionCode(exceptionCode: ExceptionCode): boolean {
  return exceptionCode >= MinExceptionCode && exceptionCode <= MaxExceptionCode;
}

export const NotezyExceptionSchema = z.object({
  code: z.number().int().positive(),
  prefix: z.string(),
  reason: z.string(),
  message: z.string(),
  status: z.number().int().positive(),
  details: z.any().optional(),
  origin: z.string().optional(),
  retryable: z.boolean().optional(),
});

export type NotezyExceptionFields = z.infer<typeof NotezyExceptionSchema>;

export class NotezyException {
  public code: number;
  public prefix: string;
  public reason: string;
  public message: string;
  public status: number;
  public details?: any;
  public origin?: string;
  public retryable?: boolean;

  constructor(obj: any) {
    const validated = NotezyExceptionSchema.parse(obj);
    this.code = validated.code;
    this.prefix = validated.prefix;
    this.reason = validated.reason;
    this.message = validated.message;
    this.status = validated.status;
    this.details = validated.details;
    this.origin = validated.origin;
    this.retryable = validated.retryable;
  }

  static nullable(value: any): value is null | undefined {
    return value === null || value === undefined;
  }

  static validate(obj: any): NotezyExceptionFields {
    return NotezyExceptionSchema.parse(obj);
  }

  toJSON(): any {
    return {
      code: this.code,
      reason: this.reason,
      prefix: this.prefix,
      message: this.message,
      status: this.status,
      details: this.details,
      origin: this.origin,
      retryable: this.retryable,
    };
  }

  toString(): string {
    if (this.origin) {
      return `[${this.code}]${this.reason}: ${this.origin}`;
    }
    return `[${this.code}]${this.reason}: ${this.message}`;
  }

  log(errorMode: boolean = true): this {
    if (errorMode) {
      console.error(
        `[${this.code}]${this.reason}: ${this.message}${
          this.origin && `(${this.origin})`
        }`
      );
    } else {
      console.debug(
        `[${this.code}]${this.reason}: ${this.message}${
          this.origin && `(${this.origin})`
        }`
      );
    }

    return this;
  }

  equals(
    other: NotezyException,
    withMessage: boolean = false,
    withDetails: boolean = false,
    withError: boolean = false
  ): boolean {
    return (
      this.code === other.code &&
      this.reason === other.reason &&
      this.prefix === other.prefix &&
      (!withMessage || this.message === other.message) &&
      this.status === other.status &&
      (!withDetails || this.details === other.details) &&
      (!withError || this.origin === other.origin)
    );
  }
}

/* ============================== Error Instance with Exception ============================== */

export class NotezyAPIError extends NotezyError {
  private readonly exception: NotezyException;

  constructor(exception: NotezyException) {
    super(exception.reason, true, exception.message);
    this.name = "APIError";
    this.exception = exception;
  }

  get unWrap(): NotezyException {
    return this.exception;
  }
}

/* ============================== Some Reasons and Dictionaries ============================== */

/* 
  ### Note that we only list the Exception with `IsInternal = false` here 
*/

export const DatabaseExceptionReasons = {
  notFound: "NotFound",
  failedToCreate: "FailedToCreate",
  failedToUpdate: "FailedToUpdate",
  failedToDelete: "FailedToDelete",
};
export const APIExceptionReasons = {
  timeout: "Timeout",
};
export const GraphQLExceptionReasons = {};
export const TypeExceptionReasons = {
  invalidDto: "InvalidDto",
};
export const CommonExceptionReasons = {};

export const ExceptionReasonDictionary = {
  client: {
    fetch: {
      networkRequired: "NetworkRequired",
      missingNetwork: "MissingNetwork",
      undefinedError: "undefinedError",
    },
    validation: {
      zodParsingFailed: "ZodParsingFailed",
      receivedUndefinedRequest: "ReceivedUndefinedRequest",
      inconsistentTokens: "InconsistentTokens",
    },
    localDatabase: {
      localDatabaseUnavailable: "LocalDatabaseUnavailable",
      invalidLoggedInUser: "InvalidLoggedInUser",
    },
    realtime: {
      missingWebSocketURL: "MissingWebSocketURL",
      invalidJsonFrame: "InvalidJsonFrame",
      invalidFrameShape: "InvalidFrameShape",
      unsupportedProtocolVersion: "UnsupportedProtocolVersion",
      missingFrameType: "MissingFrameType",
      missingReadyConnectionId: "MissingReadyConnectionId",
      missingPongRequestId: "MissingPongRequestId",
      missingErrorFrameFields: "MissingErrorFrameFields",
      unsupportedFrameType: "UnsupportedFrameType",
      unexpectedBinaryMessage: "UnexpectedBinaryMessage",
      unableToParseFrame: "UnableToParseFrame",
      invalidBinaryFrame: "InvalidBinaryFrame",
      missingSubscribedConnectorChannelId:
        "MissingSubscribedConnectorChannelId",
      missingChannelTicket: "MissingChannelTicket",
    },
  },
  auth: {
    ...APIExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
    wrongPassword: "WrongPassword",
    wrongAuthCode: "WrongAuthCode",
    loginBlockedDueToTryingTooManyTimes: "LoginBlockedDueToTryingTooManyTimes",
    authCodeBlockedDueToTryingTooManyTimes:
      "AuthCodeBlockedDueToTryingTooManyTimes",
    permissionDeniedDueToUserRole: "PermissionDeniedDueToUserRole",
    permissionDeniedDueToUserPlan: "PermissionDeniedDueToUserPlan",
    permissionDeniedDueToInvalidRequestOriginDomain:
      "PermissionDeniedDueToInvalidRequestOriginDomain",
    permissionDeniedDueToTooManyRequests:
      "PermissionDeniedDueToTooManyRequests",
  },
  user: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
    duplicateName: "DuplicateName",
    duplicateEmail: "DuplicateEmail",
  },
  userInfo: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  userSetting: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  userAccount: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  usersToBadges: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  theme: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  badge: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  search: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
  },
  email: {
    ...APIExceptionReasons,
  },
};
