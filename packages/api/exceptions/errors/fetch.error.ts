import { NotegicException } from "@shared/api/exceptions";
import { NotegicError } from ".";

export class NotegicFetchError extends NotegicError {
  private readonly exception: NotegicException;

  constructor(exception: NotegicException) {
    super(exception.reason, true, exception.message);
    this.name = "FetchError";
    this.exception = exception;
  }

  get unWrap(): NotegicException {
    return this.exception;
  }
}
