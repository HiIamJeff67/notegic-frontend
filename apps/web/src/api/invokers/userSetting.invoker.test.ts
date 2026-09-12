jest.mock("@/api/functions/userSetting.serverFn", () => ({
  GetMySetting: jest.fn(),
  UpdateMySetting: jest.fn(),
}));

import {
  GetMySetting,
  UpdateMySetting,
} from "@/api/functions/userSetting.serverFn";
import {
  mutationFnUpdateMySetting,
  queryFnGetMySetting,
  UserSettingsRateLimitError,
} from "./userSetting.invoker";

describe("settings request cooldown", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    });
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2100-01-01"));
  });
  afterAll(() => {
    Reflect.deleteProperty(globalThis, "window");
    jest.useRealTimers();
  });
  beforeEach(() => {
    jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    jest.clearAllMocks();
  });

  it("blocks GET and PUT throughout cooldown without queued replay", async () => {
    const deadline = Date.now() + 60_000;
    jest
      .mocked(GetMySetting)
      .mockResolvedValueOnce({ rateLimitedUntil: deadline });
    await expect(queryFnGetMySetting({})).rejects.toBeInstanceOf(
      UserSettingsRateLimitError
    );
    for (let index = 0; index < 1000; index++) {
      await expect(queryFnGetMySetting({})).rejects.toBeInstanceOf(
        UserSettingsRateLimitError
      );
      await expect(
        mutationFnUpdateMySetting({ body: { values: {} } })
      ).rejects.toBeInstanceOf(UserSettingsRateLimitError);
    }
    expect(GetMySetting).toHaveBeenCalledTimes(1);
    expect(UpdateMySetting).not.toHaveBeenCalled();
    jest.advanceTimersByTime(60_000);
    expect(GetMySetting).toHaveBeenCalledTimes(1);
    expect(UpdateMySetting).not.toHaveBeenCalled();

    jest
      .mocked(UpdateMySetting)
      .mockResolvedValueOnce({ rateLimitedUntil: Date.now() + 120_000 });
    await expect(
      mutationFnUpdateMySetting({ body: { values: {} } })
    ).rejects.toBeInstanceOf(UserSettingsRateLimitError);
    jest.advanceTimersByTime(60_000);
    await expect(queryFnGetMySetting({})).rejects.toBeInstanceOf(
      UserSettingsRateLimitError
    );
    expect(GetMySetting).toHaveBeenCalledTimes(1);
    expect(UpdateMySetting).toHaveBeenCalledTimes(1);
  });

  it("forwards cancellation and does not retry failed reads", async () => {
    jest.advanceTimersByTime(120_000);
    const controller = new AbortController();
    const error = new DOMException("Aborted", "AbortError");
    jest.mocked(GetMySetting).mockRejectedValueOnce(error);
    await expect(queryFnGetMySetting({}, controller.signal)).rejects.toBe(
      error
    );
    expect(GetMySetting).toHaveBeenLastCalledWith({
      data: {},
      signal: controller.signal,
      fetch: expect.any(Function),
    });
    expect(GetMySetting).toHaveBeenCalledTimes(1);
  });

  it("also pauses on a non-JSON HTTP 429 from the web server", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "120" },
      })
    );
    jest.mocked(GetMySetting).mockImplementationOnce(async options => {
      await options!.fetch!("https://example.test/settings", {});
      throw new Error("unreachable");
    });
    try {
      await expect(queryFnGetMySetting({})).rejects.toBeInstanceOf(
        UserSettingsRateLimitError
      );
      await expect(
        mutationFnUpdateMySetting({ body: { values: {} } })
      ).rejects.toBeInstanceOf(UserSettingsRateLimitError);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
