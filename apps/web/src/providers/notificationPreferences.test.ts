import {
  canSendDesktopNotification,
  isQuietHours,
} from "@/providers/notificationPreferences";

const preferences = {
  desktopNotifications: true,
  quietMode: true,
  quietModeStart: "22:00",
  quietModeEnd: "08:00",
};

describe("notification preferences", () => {
  it("handles quiet hours that cross midnight", () => {
    expect(isQuietHours(new Date(2026, 0, 1, 23, 30), "22:00", "08:00")).toBe(
      true
    );
    expect(isQuietHours(new Date(2026, 0, 1, 7, 30), "22:00", "08:00")).toBe(
      true
    );
    expect(isQuietHours(new Date(2026, 0, 1, 12, 0), "22:00", "08:00")).toBe(
      false
    );
  });

  it("allows critical notifications during quiet hours", () => {
    const now = new Date(2026, 0, 1, 23, 30);
    expect(
      canSendDesktopNotification(preferences, "granted", "normal", now)
    ).toBe(false);
    expect(
      canSendDesktopNotification(preferences, "granted", "critical", now)
    ).toBe(true);
  });

  it("requires both the local switch and browser permission", () => {
    expect(canSendDesktopNotification(preferences, "default", "normal")).toBe(
      false
    );
    expect(
      canSendDesktopNotification(
        { ...preferences, desktopNotifications: false },
        "granted",
        "normal"
      )
    ).toBe(false);
  });
});
