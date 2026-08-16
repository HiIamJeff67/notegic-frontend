import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionSubDomainCodeShiftAmount,
  NotegicException,
} from "@shared/api/exceptions";
import { DatabaseException } from "@shared/api/exceptions/database.exception";
import { StatusCodes } from "http-status-codes";
import { ExceptionReasonDictionary } from ".";

const UserExceptionSubDomainCode: ExceptionCode = 31;
const ExceptionBaseCode_User: ExceptionCode =
  UserExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_User: ExceptionPrefix = "User";

export class UserExceptions extends DatabaseException {
  static BaseCode: ExceptionCode = ExceptionBaseCode_User;
  static Prefix: ExceptionPrefix = ExceptionPrefix_User;

  static DuplicateName(name: string = "FAKE_NAME"): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.user.duplicateName,
      message: `The name of ${name} is already be used`,
      status: StatusCodes.CONFLICT,
    });
  }

  static DuplicateEmail(email: string = "FAKE_EMAIL"): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.user.duplicateEmail,
      message: `The email of ${email} is already be used`,
      status: StatusCodes.CONFLICT,
    });
  }
}
