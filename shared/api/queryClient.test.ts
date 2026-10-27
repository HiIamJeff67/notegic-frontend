import { NotegicAPIError, NotegicException } from "./exceptions";
import { createQueryClient } from "./queryClient";
import { ValidationClientException } from "./exceptions/client/validation.exception";
import { NotegicValidationError } from "./exceptions/errors/validation.error";
import { z } from "zod";

describe("query retry policy", () => {
  it("never retries validation failures in queries or mutations", async () => {
    const parsed = z.string().safeParse(null);
    if (parsed.success) throw new Error("Expected invalid fixture");
    const error = new NotegicValidationError(
      ValidationClientException.ZodParsingFailed(parsed.error)
    );
    const client = createQueryClient();
    const queryFn = jest.fn().mockRejectedValue(error);
    const mutationFn = jest.fn().mockRejectedValue(error);
    await expect(
      client.fetchQuery({ queryKey: ["validation"], queryFn })
    ).rejects.toBe(error);
    await expect(
      client.getMutationCache().build(client, { mutationFn }).execute(undefined)
    ).rejects.toBe(error);
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(error.unWrap.retryable).toBe(false);
    client.clear();
  });
  it.each([400, 401, 403, 404, 429])("does not retry HTTP %s", async status => {
    const client = createQueryClient();
    const error = new NotegicAPIError(
      new NotegicException({
        code: status,
        prefix: "Test",
        reason: "Rejected",
        message: "Rejected",
        status,
      })
    );
    const queryFn = jest.fn().mockRejectedValue(error);
    await expect(
      client.fetchQuery({ queryKey: [status], queryFn })
    ).rejects.toBe(error);
    expect(queryFn).toHaveBeenCalledTimes(1);
    client.clear();
  });
  it("respects the backend public retryable flag even without HTTP status", async () => {
    const client = createQueryClient();
    const error = new NotegicAPIError(
      new NotegicException({
        reason: "NotFound",
        domain: "UserSetting",
        operation: "Repository",
        message: "Missing",
        retryable: false,
      })
    );
    const queryFn = jest.fn().mockRejectedValue(error);
    await expect(
      client.fetchQuery({ queryKey: ["public-error"], queryFn })
    ).rejects.toBe(error);
    expect(queryFn).toHaveBeenCalledTimes(1);
    client.clear();
  });
  it("does not retry an aborted request", async () => {
    const client = createQueryClient();
    const queryFn = jest
      .fn()
      .mockRejectedValue(new DOMException("Aborted", "AbortError"));
    await expect(
      client.fetchQuery({ queryKey: ["abort"], queryFn })
    ).rejects.toHaveProperty("name", "AbortError");
    expect(queryFn).toHaveBeenCalledTimes(1);
    client.clear();
  });
});
