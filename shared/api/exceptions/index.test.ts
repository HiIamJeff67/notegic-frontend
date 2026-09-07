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
