const setResponseHeader = jest.fn();

jest.mock("@tanstack/react-start/server", () => ({ setResponseHeader }), {
  virtual: true,
});

import {
  forwardUpstreamSetCookies,
  getSetCookieValues,
  mergeCookieHeader,
} from "@/api/cookies/bridge";

describe("SSR cookie bridge", () => {
  beforeEach(() => setResponseHeader.mockReset());

  it("preserves multiple upstream Set-Cookie values when the runtime exposes them", () => {
    const headers = {
      getSetCookie: () => [
        "accessToken=next; Path=/",
        "refreshToken=next; Path=/",
      ],
      get: jest.fn(),
    } as unknown as Headers;

    expect(getSetCookieValues(headers)).toEqual([
      "accessToken=next; Path=/",
      "refreshToken=next; Path=/",
    ]);
  });

  it("merges refreshed cookies without retaining stale values", () => {
    expect(
      mergeCookieHeader("accessToken=old; theme=dark", [
        "accessToken=new; Path=/; HttpOnly",
        "refreshToken=next; Path=/; HttpOnly",
      ])
    ).toBe("accessToken=new; theme=dark; refreshToken=next");
  });

  it("forwards every upstream Set-Cookie header to the SSR response", () => {
    const response = {
      headers: {
        getSetCookie: () => [
          "accessToken=next; Path=/",
          "refreshToken=next; Path=/",
        ],
      },
    } as unknown as Response;

    forwardUpstreamSetCookies(response);

    expect(setResponseHeader).toHaveBeenCalledWith("set-cookie", [
      "accessToken=next; Path=/",
      "refreshToken=next; Path=/",
    ]);
  });
});
