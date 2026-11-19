import { desktopCallback, nativeCallbackUrl } from "./nativeAuthorization";

describe("desktop callback", () => {
  it("adds code and state without rewriting the scheme", () => {
    expect(nativeCallbackUrl(desktopCallback, "code", "state")).toBe(
      "com.notegic.desktop:/callback?code=code&state=state"
    );
  });

  it("rejects an unregistered callback", () => {
    expect(() =>
      nativeCallbackUrl("https://example.test/callback", "code", "state")
    ).toThrow("Unregistered desktop callback");
  });
});
