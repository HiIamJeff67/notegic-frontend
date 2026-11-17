import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionSubDomainCodeShiftAmount,
  NotegicAPIError,
  NotegicException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";
import { ExceptionReasonDictionary } from ".";
import { DatabaseException } from "./database.exception";

const UserSettingExceptionSubDomainCode: ExceptionCode = 34;
const ExceptionBaseCode_UserSetting: ExceptionCode =
  UserSettingExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_UserSetting: ExceptionPrefix = "UserSetting";

export class UserSettingExceptions extends DatabaseException {
  static BaseCode: ExceptionCode = ExceptionBaseCode_UserSetting;
  static Prefix: ExceptionPrefix = ExceptionPrefix_UserSetting;
  static RetryScope = "userSetting";

  static TooManyRequests = (retryAt: number): NotegicAPIError => {
    return new NotegicAPIError(
      new NotegicException({
        code: this.BaseCode + 5,
        prefix: this.Prefix,
        reason: ExceptionReasonDictionary.userSetting.tooManyRequests,
        message: `User settings requests are paused until ${retryAt}`,
        status: StatusCodes.TOO_MANY_REQUESTS,
        details: { retryAt },
        retryable: false,
      })
    );
  };
}
