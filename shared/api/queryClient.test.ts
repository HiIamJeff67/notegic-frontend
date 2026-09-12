import { NotegicAPIError, NotegicException } from "./exceptions";
import { makeQueryClient } from "./queryClient";

describe("query retry policy", () => {
  it.each([400, 401, 403, 404, 429])("does not retry HTTP %s", async status => {
    const client = makeQueryClient();
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
    const client = makeQueryClient();
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
    const client = makeQueryClient();
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
