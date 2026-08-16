import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  ExceptionSubDomainCodeShiftAmount,
  NotegicException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

const ValidationClientExceptionDomainCode: ExceptionCode = 991;
const ClientExceptionBaseCode_Validation: ExceptionCode =
  ValidationClientExceptionDomainCode * ExceptionSubDomainCodeShiftAmount;
const ClientExceptionPrefix_Validation: ExceptionPrefix = "Validation";

export class ValidationClientException {
  static BaseCode: ExceptionCode = ClientExceptionBaseCode_Validation;
  static Prefix: ExceptionPrefix = ClientExceptionPrefix_Validation;

  static ZodParsingFailed = (zodError: ZodError): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.validation.zodParsingFailed,
      message: `Failed to parsing types by zod, failed fields: ${JSON.stringify(zodError.flatten().fieldErrors)}`,
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };

  static ReceivedUndefinedRequest = (): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.client.validation.receivedUndefinedRequest,
      message: "Received undefined request",
      status: StatusCodes.BAD_REQUEST,
    });
  };

  static InconsistentToken = (
    first: string,
    second: string
  ): NotegicException => {
    return new NotegicException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.validation.inconsistentTokens,
      message: `Inconsistent tokens between ${first} and ${second}`,
      status: StatusCodes.BAD_REQUEST,
    });
  };
}
