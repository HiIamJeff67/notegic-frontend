import { getAccessToken, setAccessToken } from "./session";

describe("desktop access token", () => {
  it("keeps the bearer token in memory", () => {
    setAccessToken("  session-token  ");
    expect(getAccessToken()).toBe("session-token");
  });
});
