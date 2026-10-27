import { fetchServerFunction } from "./session.bridge";

const getClientCSRFToken = jest.fn();
const setClientCSRFToken = jest.fn();
jest.mock("@/api/clientHeaders", () => ({
  getClientCSRFToken: () => getClientCSRFToken(),
  setClientCSRFToken: (token: unknown) => setClientCSRFToken(token),
}));

const fetchMock = jest.fn();
beforeEach(() => {
  getClientCSRFToken.mockReset().mockReturnValue("current-token");
  setClientCSRFToken.mockReset();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

test("uses the current token rather than captured headers and preserves cancellation", async () => {
  const controller = new AbortController();
  fetchMock.mockResolvedValue(new Response(null));
  await fetchServerFunction("http://localhost/_serverFn/fixture", {
    method: "POST",
    headers: { "X-CSRF-Token": "stale-token", "X-Fixture": "retained" },
    signal: controller.signal,
    body: "fixture-body",
  });
  const [, init] = fetchMock.mock.calls[0];
  expect(init.headers.get("X-CSRF-Token")).toBe("current-token");
  expect(init.headers.get("X-Fixture")).toBe("retained");
  expect(init.signal).toBe(controller.signal);
  expect(init.body).toBe("fixture-body");
});

test("does not resurrect caller headers after logout", async () => {
  getClientCSRFToken.mockReturnValue(null);
  fetchMock.mockResolvedValue(new Response(null));
  await fetchServerFunction("http://localhost/_serverFn/fixture", {
    headers: { "X-CSRF-Token": "stale-token" },
  });
  expect(fetchMock.mock.calls[0][1].headers.has("X-CSRF-Token")).toBe(false);
});

test("stores RPC renewal before deserialization, including a serialized business rejection", async () => {
  fetchMock.mockResolvedValue(
    new Response("serialized-error", {
      headers: { "X-CSRF-Token": "renewed-token" },
    })
  );
  const response = await fetchServerFunction(
    "http://localhost/_serverFn/fixture"
  );
  expect(setClientCSRFToken).toHaveBeenCalledWith("renewed-token");
  expect(await response.text()).toBe("serialized-error");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("an in-flight old session cannot restore CSRF after logout or another login", async () => {
  fetchMock.mockImplementation(async () => {
    getClientCSRFToken.mockReturnValue(null);
    return new Response(null, { headers: { "X-CSRF-Token": "old-response" } });
  });
  await fetchServerFunction("http://localhost/_serverFn/fixture");
  expect(setClientCSRFToken).not.toHaveBeenCalled();
});

test.each([
  401, 403, 500,
])("ignores untrusted renewal on HTTP %s without retry", async status => {
  fetchMock.mockResolvedValue(
    new Response(null, {
      status,
      headers: { "X-CSRF-Token": "rejected-token" },
    })
  );
  await fetchServerFunction("http://localhost/_serverFn/fixture");
  expect(setClientCSRFToken).not.toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
