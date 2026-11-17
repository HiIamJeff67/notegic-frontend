import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  ExceptionSubDomainCodeShiftAmount,
  NotegicException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";

const LocalDatabaseClientExceptionDomainCode: ExceptionCode = 992;
const ClientExceptionBaseCode_LocalDatabase: ExceptionCode =
  LocalDatabaseClientExceptionDomainCode * ExceptionSubDomainCodeShiftAmount;
const ClientExceptionPrefix_LocalDatabase: ExceptionPrefix = "LocalDatabase";

export class LocalDatabaseClientExceptions {
  static BaseCode: ExceptionCode = ClientExceptionBaseCode_LocalDatabase;
  static Prefix: ExceptionPrefix = ClientExceptionPrefix_LocalDatabase;

  static LocalDatabaseUnavailable = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.client.localDatabase.localDatabaseUnavailable,
      message: "Local database unavailable, please contact us",
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };

  static InvalidLoggedInUser = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.client.localDatabase.invalidLoggedInUser,
      message:
        "Zero or more than one logged in users detected, there should be exactly one user that is currently logged in",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  };
}
