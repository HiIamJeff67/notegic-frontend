import {
  createRetryClient,
  getRetryAt,
  getRetryClient,
  minimumRetryDelayMs,
} from "@shared/api/retryClient";

describe("retry client", () => {
  const paused = (retryAt: number): never => {
    throw new Error(String(retryAt));
  };

  beforeAll(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    });
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-12T14:00:00Z"));
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, "window");
    jest.useRealTimers();
  });

  it("keeps a separate deadline for each API scope", () => {
    const client = createRetryClient();
    const retryAt = Date.now() + minimumRetryDelayMs;
    client.pause("userSetting", retryAt);
    expect(client.deadline("userSetting")).toBe(retryAt);
    expect(client.deadline("account")).toBe(0);
  });

  it("keeps the later deadline when a shorter pause arrives", () => {
    const client = createRetryClient();
    const later = Date.now() + 120_000;
    client.pause("userSetting", later);
    expect(client.pause("userSetting", Date.now() + 30_000)).toBe(later);
    expect(client.deadline("userSetting")).toBe(later);
  });

  it("does not record a deadline outside the browser", () => {
    Reflect.deleteProperty(globalThis, "window");
    try {
      const client = createRetryClient();
      const retryAt = Date.now() + minimumRetryDelayMs;
      expect(client.pause("userSetting", retryAt)).toBe(retryAt);
      expect(client.deadline("userSetting")).toBe(0);
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {},
      });
    }
  });

  it("stops a ready check for the paused scope only", () => {
    const client = createRetryClient();
    const retryAt = Date.now() + minimumRetryDelayMs;
    client.pause("userSetting", retryAt);
    expect(() => client.assertReady("userSetting", paused)).toThrow(
      String(retryAt)
    );
    expect(() => client.assertReady("account", paused)).not.toThrow();
  });

  it("keeps a created fetch on the client that made it", async () => {
    const client = createRetryClient();
    const retryAt = Date.now() + minimumRetryDelayMs;
    client.pause("userSetting", retryAt);
    const request = jest.fn();
    const fetch = client.createFetch({
      scope: "userSetting",
      fetch: request,
      minimumDelayMs: minimumRetryDelayMs,
      paused,
    });
    await expect(fetch("https://example.test")).rejects.toThrow(
      String(retryAt)
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("does not send while the scope is paused", async () => {
    const client = createRetryClient();
    const retryAt = Date.now() + minimumRetryDelayMs;
    client.pause("userSetting", retryAt);
    const request = jest.fn();
    await expect(
      client.fetch({
        scope: "userSetting",
        input: "https://example.test",
        fetch: request,
        minimumDelayMs: minimumRetryDelayMs,
        paused,
      })
    ).rejects.toThrow(String(retryAt));
    expect(request).not.toHaveBeenCalled();
  });

  it("pauses from Retry-After and applies the minimum delay", async () => {
    const client = createRetryClient();
    const request = jest.fn().mockResolvedValue(
      new Response("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "30" },
      })
    );
    const retryAt = Date.now() + minimumRetryDelayMs;
    await expect(
      client.fetch({
        scope: "userSetting",
        input: "https://example.test",
        fetch: request,
        minimumDelayMs: minimumRetryDelayMs,
        paused,
      })
    ).rejects.toThrow(String(retryAt));
    expect(request).toHaveBeenCalledTimes(1);
    expect(client.deadline("userSetting")).toBe(retryAt);
  });

  it("returns one browser client", () => {
    expect(getRetryClient()).toBe(getRetryClient());
  });
});

describe("Retry-After", () => {
  const now = Date.parse("2026-09-12T14:00:00Z");
  it.each([
    null,
    "",
    "garbage",
    "-1",
    "0",
    "30",
    "Fri, 11 Sep 2026 14:00:00 GMT",
  ])("uses the caller minimum for %s", value => {
    expect(getRetryAt(value, now, 60_000)).toBe(now + 60_000);
  });
  it("honors a delta shorter than the minimum when the caller allows it", () => {
    expect(getRetryAt("30", now, 0)).toBe(now + 30_000);
  });
  it("honors longer delta-seconds", () => {
    expect(getRetryAt("120", now, 60_000)).toBe(now + 120_000);
  });
  it("honors an HTTP date", () => {
    expect(getRetryAt("Sat, 12 Sep 2026 14:05:00 GMT", now, 60_000)).toBe(
      now + 300_000
    );
  });
});
