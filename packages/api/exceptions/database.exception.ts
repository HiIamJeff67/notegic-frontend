import {
  ExceptionCode,
  ExceptionPrefix,
  NotegicException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";
import {
  APIExceptionReasons,
  DatabaseExceptionReasons,
  TypeExceptionReasons,
} from ".";

/* ============================== General Exceptions Definitions ============================== */
export class DatabaseException {
  static BaseCode: ExceptionCode;
  static Prefix: ExceptionPrefix;

  static NotFound(): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.notFound,
      message: `${this.Prefix} Not found`,
      status: StatusCodes.NOT_FOUND,
    });
  }

  static FailedToCreate(): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.failedToCreate,
      message: `Failed to create ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  static FailedToUpdate(): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 3,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.failedToUpdate,
      message: `Failed to update ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  static FailedToDelete(): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 4,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.failedToDelete,
      message: `Failed to delete ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export class APIException {
  static BaseCode: ExceptionCode;
  static Prefix: ExceptionPrefix;

  static Timeout(time: number = 0): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 12,
      prefix: this.Prefix,
      reason: APIExceptionReasons.timeout,
      message: `Timeout in ${this.Prefix} with ${time}`,
      status: StatusCodes.REQUEST_TIMEOUT,
    });
  }
}

export class GraphQLException {
  static BaseCode: ExceptionCode;
  static Prefix: ExceptionPrefix;
}

export class TypeException {
  static BaseCode: ExceptionCode;
  static Prefix: ExceptionPrefix;
}

export class CommonException {
  static BaseCode: ExceptionCode;
  static Prefix: ExceptionPrefix;

  static InvalidDto(): NotegicException {
    return new NotegicException({
      code: this.BaseCode + 32,
      prefix: this.Prefix,
      reason: TypeExceptionReasons.invalidDto,
      message: `Invalid dto detected in ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
