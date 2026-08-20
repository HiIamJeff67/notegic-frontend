jest.mock("@shared/lib/localStorageManipulator", () => ({
  LocalStorageManipulator: {
    getItemByKey: jest.fn(),
  },
}));

import { isLocalPreferenceEnabled } from "@shared/api/local/policy";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";

const getItemByKey = jest.mocked(LocalStorageManipulator.getItemByKey);

describe("local data policy", () => {
  beforeEach(() => {
    getItemByKey.mockReset();
    getItemByKey.mockReturnValue(null as never);
  });

  it("keeps local data features enabled when preferences are unavailable", () => {
    expect(isLocalPreferenceEnabled("localVault")).toBe(true);
    expect(isLocalPreferenceEnabled("offlineQueue")).toBe(true);
  });

  it("respects disabled local database and offline queue settings", () => {
    getItemByKey.mockReturnValue({
      localVault: false,
      offlineQueue: false,
    } as never);

    expect(isLocalPreferenceEnabled("localVault")).toBe(false);
    expect(isLocalPreferenceEnabled("offlineQueue")).toBe(false);
  });

  it("only disables the selected feature", () => {
    getItemByKey.mockReturnValue({ localVault: false } as never);

    expect(isLocalPreferenceEnabled("localVault")).toBe(false);
    expect(isLocalPreferenceEnabled("offlineQueue")).toBe(true);
  });
});
