import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { createSerializationAdapter } from "@tanstack/react-router";

export const apiErrorSerialization = createSerializationAdapter({
  key: "notegic/APIError",
  test: (value): value is NotegicAPIError => value instanceof NotegicAPIError,
  toSerializable: error => ({
    code: error.unWrap.code,
    prefix: error.unWrap.prefix,
    reason: error.unWrap.reason,
    message: error.unWrap.message,
    status: error.unWrap.status,
    retryable: error.unWrap.retryable,
  }),
  fromSerializable: exception =>
    new NotegicAPIError(new NotegicException(exception)),
});
