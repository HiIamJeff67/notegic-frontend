import { getAccessToken, setAccessToken } from "./accessToken";

describe("desktop access token", () => {
  it("keeps the bearer token in memory", () => {
    setAccessToken("  session-token  ");
    expect(getAccessToken()).toBe("session-token");
  });
});
