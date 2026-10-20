import {
  NotegicException,
  NotegicExceptionSchema,
} from "@shared/api/exceptions";

test("accepts the backend public exception shape", () => {
  const exception = {
    reason: "PermissionDenied",
    domain: "RoutineTask",
    operation: "GetMyRoutineTasksByRoutineIds",
    message: "Permission denied",
    retryable: false,
  };

  expect(NotegicExceptionSchema.parse(exception)).toMatchObject(exception);
  expect(new NotegicException(exception).toJSON()).toMatchObject({
    code: 500,
    prefix: "RoutineTask",
    reason: exception.reason,
    message: exception.message,
    status: 500,
  });
});

test("preserves the client exception shape", () => {
  const exception = new NotegicException({
    code: 99000001,
    prefix: "Fetch",
    reason: "MissingNetwork",
    message: "Network is missing",
    status: 502,
  });

  expect(exception.toJSON()).toMatchObject({
    code: 99000001,
    prefix: "Fetch",
    reason: "MissingNetwork",
    status: 502,
  });
});

test.each([
  400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504,
])("preserves HTTP %s on a backend public exception", status => {
  const exception = new NotegicException(
    {
      reason: "Rejected",
      domain: "Gateway",
      operation: "Request",
      message: "Request rejected",
      retryable: false,
    },
    status
  );

  expect(exception.status).toBe(status);
  expect(exception.code).toBe(status);
});

test.each([
  undefined,
  0,
  200,
  302,
  399,
  600,
  401.5,
  NaN,
])("does not replace a legacy error status with invalid/non-error transport status %s", httpStatus => {
  const exception = new NotegicException(
    {
      code: 99000001,
      prefix: "Gateway",
      reason: "Rejected",
      message: "Rejected",
      status: 409,
    },
    httpStatus
  );

  expect(exception.status).toBe(409);
  expect(exception.code).toBe(99000001);
});
