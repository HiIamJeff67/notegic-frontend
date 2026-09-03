jest.mock("@shared/lib/indexedDBManipulator", () => ({
  IndexedDBManipulator: {
    getItemByKey: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { IndexedDBKey } from "@shared/types/indexedDB.type";

const getItemByKey = jest.mocked(IndexedDBManipulator.getItemByKey);
const updateItem = jest.mocked(IndexedDBManipulator.updateItem);
const removeItem = jest.mocked(IndexedDBManipulator.removeItem);

describe("LocalYjsDocumentStore", () => {
  const caches = new Map<string, unknown>();

  beforeEach(() => {
    caches.clear();
    getItemByKey.mockImplementation(async (key, userPublicId) => {
      return (
        (caches.get(`${userPublicId ?? "global"}:${key}`) as never) ?? null
      );
    });
    updateItem.mockImplementation(async (key, updater, userPublicId) => {
      const cacheKey = `${userPublicId ?? "global"}:${key}`;
      caches.set(cacheKey, updater(caches.get(cacheKey) as never));
      return true;
    });
    removeItem.mockResolvedValue(true);
  });

  it("atomically keeps documents isolated by user while updating one cache", async () => {
    await Promise.all([
      LocalYjsDocumentStore.save(
        "user-a",
        "document-a" as never,
        new Uint8Array([1]),
        new Uint8Array([2]),
        false
      ),
      LocalYjsDocumentStore.save(
        "user-a",
        "document-b" as never,
        new Uint8Array([3, 4]),
        new Uint8Array([5]),
        true
      ),
      LocalYjsDocumentStore.save(
        "user-b",
        "document-a" as never,
        new Uint8Array([6]),
        new Uint8Array([7]),
        false
      ),
    ]);

    await expect(
      LocalYjsDocumentStore.load("user-a", "document-a" as never)
    ).resolves.toEqual(
      expect.objectContaining({
        blockPackId: "document-a",
        stateVector: new Uint8Array([2]),
      })
    );
    await expect(LocalYjsDocumentStore.estimate("user-a")).resolves.toEqual({
      totalSize: 5,
      count: 2,
    });
    await expect(LocalYjsDocumentStore.estimate("user-b")).resolves.toEqual({
      totalSize: 2,
      count: 1,
    });
    expect(updateItem).toHaveBeenCalledWith(
      IndexedDBKey.blockPackYjsDocuments,
      expect.any(Function),
      "user-a"
    );
  });

  it("retains unsent documents during cleanup and removes old snapshots", async () => {
    await LocalYjsDocumentStore.save(
      "user-a",
      "pending" as never,
      new Uint8Array([1]),
      new Uint8Array([1]),
      true
    );
    await LocalYjsDocumentStore.save(
      "user-a",
      "old" as never,
      new Uint8Array([2]),
      new Uint8Array([2]),
      false
    );
    const cache = caches.get(
      `${"user-a"}:${IndexedDBKey.blockPackYjsDocuments}`
    ) as { contents: Array<{ blockPackId: string; updatedAt: Date }> };
    cache.contents[1].updatedAt = new Date("2026-01-01T00:00:00.000Z");

    await LocalYjsDocumentStore.cleanup(
      "user-a",
      new Date("2026-08-01T00:00:00.000Z")
    );

    await expect(LocalYjsDocumentStore.estimate("user-a")).resolves.toEqual({
      totalSize: 2,
      count: 1,
    });
    await expect(
      LocalYjsDocumentStore.load("user-a", "pending" as never)
    ).resolves.toEqual(expect.objectContaining({ needsFlush: true }));
    await expect(
      LocalYjsDocumentStore.load("user-a", "old" as never)
    ).resolves.toBeNull();
  });

  it("surfaces IndexedDB write failures", async () => {
    updateItem.mockResolvedValue(false);

    await expect(
      LocalYjsDocumentStore.save(
        "user-a",
        "document-a" as never,
        new Uint8Array([1]),
        new Uint8Array([1]),
        false
      )
    ).rejects.toThrow("Failed to persist local Yjs document cache.");
  });

  it("keeps large snapshots measurable without truncating their bytes", async () => {
    const update = new Uint8Array(1024 * 1024);
    const stateVector = new Uint8Array([1, 2, 3]);

    await LocalYjsDocumentStore.save(
      "user-a",
      "large-document" as never,
      update,
      stateVector,
      false
    );

    await expect(LocalYjsDocumentStore.estimate("user-a")).resolves.toEqual({
      totalSize: update.byteLength + stateVector.byteLength,
      count: 1,
    });
  });
});
