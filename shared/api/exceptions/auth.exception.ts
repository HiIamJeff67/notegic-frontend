import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionSubDomainCodeShiftAmount,
  NotegicException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";
import { ExceptionReasonDictionary } from ".";
import { DatabaseException } from "./database.exception";

const AuthExceptionSubDomainCode: ExceptionCode = 31;
const ExceptionBaseCode_Auth: ExceptionCode =
  AuthExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_Auth: ExceptionPrefix = "Auth";

export class AuthExceptions extends DatabaseException {
  static BaseCode: ExceptionCode = ExceptionBaseCode_Auth;
  static Prefix: ExceptionPrefix = ExceptionPrefix_Auth;

  static WrongPassword = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.wrongPassword,
      message: "The password is not match",
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static WrongAuthCode = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 5,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.wrongAuthCode,
      message: "The authentication code is not match",
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static LoginBlockedDueToTryingTooManyTimes = (
    blockUntil: Date = new Date()
  ): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 8,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth.loginBlockedDueToTryingTooManyTimes,
      message: `Blocked the login procedure because user has tried too many times and require to wait until ${blockUntil}`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static AuthCodeBlockedDueToTryingTooManyTimes = (
    blockUntil: Date = new Date()
  ): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 9,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth.authCodeBlockedDueToTryingTooManyTimes,
      message: `Blocked the generating auth code procedure because user has tried too many times and require to wait until ${blockUntil}`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static PermissionDeniedDueToUserRole = (
    userRole: any = "FAKE_USER_ROLE"
  ): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 101,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.permissionDeniedDueToUserRole,
      message: `The current user role of ${userRole} does not have access to this operation`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static PermissionDeniedDueToUserPlan = (
    userPlan: any = "FAKE_USER_PLAN"
  ): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 102,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.permissionDeniedDueToUserPlan,
      message: `The current user plan of ${userPlan} does not have access to this operation`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static PermissionDeniedDueToInvalidRequestOriginDomain = (
    origin: any = "FAKE_ORIGIN"
  ): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 103,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth
          .permissionDeniedDueToInvalidRequestOriginDomain,
      message: `The current request origin domain of ${origin} is invalid`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  static PermissionDeniedDueToTooManyRequests = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 104,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth.permissionDeniedDueToTooManyRequests,
      message: "Too many requests, please wait for a while",
      status: StatusCodes.UNAUTHORIZED,
    });
  };
}
