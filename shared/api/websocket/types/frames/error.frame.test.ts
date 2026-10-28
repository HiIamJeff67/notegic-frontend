import { parseRealtimeErrorFrame } from "./error.frame";

describe("parseRealtimeErrorFrame", () => {
  it.each([
    undefined,
    false,
    "true",
    1,
    null,
  ])("does not infer recovery from %p", recoverable => {
    expect(
      parseRealtimeErrorFrame({
        code: "resubscribe_required",
        message: "fixture",
        recoverable,
      }).recoverable
    ).toBe(false);
  });

  it("retains the explicit recovery policy and channel correlation", () => {
    expect(
      parseRealtimeErrorFrame({
        code: "resubscribe_required",
        message: "fixture",
        recoverable: true,
        channelId: "fixture-pack",
        connectorChannelId: 7,
      })
    ).toMatchObject({
      code: "resubscribe_required",
      recoverable: true,
      channelId: "fixture-pack",
      connectorChannelId: 7,
    });
  });
});
