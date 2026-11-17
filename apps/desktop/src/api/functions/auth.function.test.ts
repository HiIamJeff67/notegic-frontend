import { setAccessToken } from "../tokens/accessToken";
import { Login, Register } from "./auth.function";

jest.mock("@shared/lib/url/api", () => ({
  CurrentAPIBaseURL: "api/development/test",
  APIURLPathDictionary: {
    auth: {
      login: "auth/login",
      register: "auth/register",
    },
    origin: () => "http://api.test",
  },
}));

const loginResponse = {
  success: true,
  data: {
    publicId: "user-1",
    name: "user1",
    displayName: "User",
    email: "user@example.com",
    csrfToken: "csrf-token",
    updatedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  exception: null,
};

const headersOf = (init: RequestInit | undefined): Headers =>
  new Headers(init?.headers);

describe("desktop auth requests", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    setAccessToken("");
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it("posts login without a cookie or CSRF header", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await Login({
      body: { account: "user1", password: "Password1!" },
    });

    expect(response.data.publicId).toBe("user-1");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/login");
    expect(init.credentials).toBe("omit");
    expect(init.method).toBe("POST");
    const headers = headersOf(init);
    expect(headers.get("Cookie")).toBeNull();
    expect(headers.get("X-CSRF-Token")).toBeNull();
    expect(headers.get("Authorization")).toBeNull();
  });

  it("sends the bearer token and still omits the web session cookie", async () => {
    setAccessToken("desktop-token");
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ...loginResponse,
          data: { ...loginResponse.data, updatedAt: undefined },
        }),
        {
          status: 201,
          headers: { "content-type": "application/json" },
        }
      )
    );

    await Register({
      body: {
        name: "user1",
        email: "user@example.com",
        password: "Password1!",
      },
    });

    const headers = headersOf(
      (fetchMock.mock.calls[0] as [string, RequestInit])[1]
    );
    expect(headers.get("Authorization")).toBe("Bearer desktop-token");
    expect(headers.get("Cookie")).toBeNull();
    expect(headers.get("X-CSRF-Token")).toBeNull();
  });
});
