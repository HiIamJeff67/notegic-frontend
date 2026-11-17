jest.mock("@/api/functions/userSetting.serverFn", () => ({
  GetMySetting: jest.fn(),
  UpdateMySetting: jest.fn(),
}));

import { NotegicAPIError } from "@shared/api/exceptions";
import { UserSettingExceptions } from "@shared/api/exceptions/userSetting.exception";
import {
  mutationFnUpdateMySetting,
  queryFnGetMySetting,
} from "@shared/api/invokers/userSetting.invoker";
import { minimumRetryDelayMs } from "@shared/api/retryClient";
import {
  GetMySetting,
  UpdateMySetting,
} from "@/api/functions/userSetting.serverFn";

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
    jest
      .mocked(GetMySetting)
      .mockRejectedValueOnce(UserSettingExceptions.TooManyRequests(Date.now()));
    await expect(queryFnGetMySetting({}, GetMySetting)).rejects.toBeInstanceOf(
      NotegicAPIError
    );
    for (let index = 0; index < 1000; index++) {
      await expect(
        queryFnGetMySetting({}, GetMySetting)
      ).rejects.toBeInstanceOf(NotegicAPIError);
      await expect(
        mutationFnUpdateMySetting({ body: { values: {} } }, UpdateMySetting)
      ).rejects.toBeInstanceOf(NotegicAPIError);
    }
    expect(GetMySetting).toHaveBeenCalledTimes(1);
    expect(UpdateMySetting).not.toHaveBeenCalled();
    jest.advanceTimersByTime(minimumRetryDelayMs);
    expect(GetMySetting).toHaveBeenCalledTimes(1);
    expect(UpdateMySetting).not.toHaveBeenCalled();

    jest
      .mocked(UpdateMySetting)
      .mockRejectedValueOnce(UserSettingExceptions.TooManyRequests(Date.now()));
    await expect(
      mutationFnUpdateMySetting({ body: { values: {} } }, UpdateMySetting)
    ).rejects.toBeInstanceOf(NotegicAPIError);
    jest.advanceTimersByTime(minimumRetryDelayMs - 1);
    await expect(queryFnGetMySetting({}, GetMySetting)).rejects.toBeInstanceOf(
      NotegicAPIError
    );
    expect(GetMySetting).toHaveBeenCalledTimes(1);
    expect(UpdateMySetting).toHaveBeenCalledTimes(1);
  });

  it("forwards cancellation and does not retry failed reads", async () => {
    jest.advanceTimersByTime(120_000);
    const controller = new AbortController();
    const error = new DOMException("Aborted", "AbortError");
    jest.mocked(GetMySetting).mockRejectedValueOnce(error);
    await expect(
      queryFnGetMySetting({}, GetMySetting, controller.signal)
    ).rejects.toBe(error);
    expect(GetMySetting).toHaveBeenLastCalledWith({}, controller.signal);
    expect(GetMySetting).toHaveBeenCalledTimes(1);
  });
});
