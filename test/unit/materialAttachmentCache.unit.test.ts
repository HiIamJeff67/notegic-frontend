jest.mock("@shared/api/local/policy", () => ({
  isLocalPreferenceEnabled: jest.fn(() => true),
}));
jest.mock("@shared/lib/indexedDBManipulator", () => ({
  IndexedDBManipulator: {
    getItemByKey: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import {
  cleanupMaterialAttachmentCache,
  clearMaterialAttachmentCache,
  loadMaterialAttachment,
  saveMaterialAttachment,
} from "@shared/api/local/material-attachment.cache";
import { isLocalPreferenceEnabled } from "@shared/api/local/policy";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";

const getItemByKey = jest.mocked(IndexedDBManipulator.getItemByKey);
const setItem = jest.mocked(IndexedDBManipulator.setItem);
const removeItem = jest.mocked(IndexedDBManipulator.removeItem);
const isEnabled = jest.mocked(isLocalPreferenceEnabled);

describe("material attachment cache", () => {
  let cache: unknown;

  beforeEach(() => {
    cache = null;
    getItemByKey.mockClear();
    setItem.mockClear();
    removeItem.mockClear();
    isEnabled.mockReturnValue(true);
    getItemByKey.mockImplementation(async () => cache as never);
    setItem.mockImplementation(async (_, value) => {
      cache = value;
      return true;
    });
    removeItem.mockImplementation(async () => {
      cache = null;
      return true;
    });
  });

  it("saves and loads only the current material version", async () => {
    const updatedAt = new Date("2026-08-20T00:00:00.000Z");
    const content = new Blob(["hello"], { type: "text/plain" });

    await saveMaterialAttachment("material-1" as never, updatedAt, content);

    await expect(
      loadMaterialAttachment("material-1" as never, updatedAt)
    ).resolves.toBe(content);
    await expect(
      loadMaterialAttachment(
        "material-1" as never,
        new Date("2026-08-21T00:00:00.000Z")
      )
    ).resolves.toBeNull();
  });

  it("clears expired cache entries and respects the setting", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-01T00:00:00.000Z"));
    const updatedAt = new Date("2026-08-01T00:00:00.000Z");
    await saveMaterialAttachment(
      "material-1" as never,
      updatedAt,
      new Blob(["hello"], { type: "text/plain" })
    );

    await cleanupMaterialAttachmentCache(
      Date.parse("2026-08-20T00:00:00.000Z")
    );
    expect(removeItem).toHaveBeenCalled();

    isEnabled.mockReturnValue(false);
    await saveMaterialAttachment(
      "material-2" as never,
      updatedAt,
      new Blob(["world"], { type: "text/plain" })
    );
    expect(setItem).toHaveBeenCalledTimes(1);

    await clearMaterialAttachmentCache();
    expect(removeItem).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
