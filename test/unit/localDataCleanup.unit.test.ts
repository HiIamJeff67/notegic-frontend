jest.mock("@shared/lib/indexedDBManipulator", () => ({
  IndexedDBManipulator: {
    getItemByKey: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));
jest.mock("@/api/local/db", () => ({
  localDB: {
    isEnabled: true,
    isReady: true,
    query: {
      User: {
        findFirst: jest.fn().mockResolvedValue({ publicId: "user-a" }),
      },
    },
  },
}));
jest.mock("@shared/blockpack/localYjsDocumentStore", () => ({
  LocalYjsDocumentStore: {
    cleanup: jest.fn(),
  },
}));

import { cleanupLocalData } from "@/api/local/local-data.cleanup";
import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { IndexedDBKey } from "@shared/types/indexedDB.type";

const getItemByKey = jest.mocked(IndexedDBManipulator.getItemByKey);
const setItem = jest.mocked(IndexedDBManipulator.setItem);
const removeItem = jest.mocked(IndexedDBManipulator.removeItem);
const cleanupYjs = jest.mocked(LocalYjsDocumentStore.cleanup);

describe("local data cleanup", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-20T00:00:00.000Z"));
    getItemByKey.mockImplementation(async key => {
      if (key === IndexedDBKey.backgroundImages) {
        return {
          header: { totalSize: 300 },
          contents: [
            {
              id: "current",
              contentType: "image/png",
              file: new File([new Uint8Array(1)], "current.png"),
              timestamp: new Date("2026-07-01T00:00:00.000Z"),
              byteSize: 100,
            },
            {
              id: "expired",
              contentType: "image/png",
              file: new File([new Uint8Array(1)], "expired.png"),
              timestamp: new Date("2026-07-01T00:00:00.000Z"),
              byteSize: 100,
            },
            {
              id: "recent",
              contentType: "image/png",
              file: new File([new Uint8Array(1)], "recent.png"),
              timestamp: new Date("2026-08-01T00:00:00.000Z"),
              byteSize: 100,
            },
          ],
        } as never;
      }
      if (key === IndexedDBKey.backgroundImageThumbnails) {
        return {
          header: { totalSize: 3 },
          contents: [
            {
              id: "current",
              contentType: "image/png",
              thumbnailURL: "current",
              timestamp: new Date("2026-07-01T00:00:00.000Z"),
              byteSize: 1,
            },
            {
              id: "expired",
              contentType: "image/png",
              thumbnailURL: "expired",
              timestamp: new Date("2026-07-01T00:00:00.000Z"),
              byteSize: 1,
            },
            {
              id: "recent",
              contentType: "image/png",
              thumbnailURL: "recent",
              timestamp: new Date("2026-08-01T00:00:00.000Z"),
              byteSize: 1,
            },
          ],
        } as never;
      }
      if (key === IndexedDBKey.currentBackgroundImage) {
        return {
          id: "current",
          contentType: "image/png",
          file: new File([new Uint8Array(1)], "current.png"),
          timestamp: new Date("2026-07-01T00:00:00.000Z"),
        } as never;
      }
      if (key === IndexedDBKey.blockPackYjsDocuments) {
        return {
          header: { totalSize: 3 },
          contents: [
            {
              blockPackId: "expired",
              update: new Uint8Array(1),
              byteSize: 1,
              needsFlush: false,
              updatedAt: new Date("2026-07-01T00:00:00.000Z"),
            },
            {
              blockPackId: "pending",
              update: new Uint8Array(1),
              byteSize: 1,
              needsFlush: true,
              updatedAt: new Date("2026-07-01T00:00:00.000Z"),
            },
            {
              blockPackId: "recent",
              update: new Uint8Array(1),
              byteSize: 1,
              needsFlush: false,
              updatedAt: new Date("2026-08-01T00:00:00.000Z"),
            },
          ],
        } as never;
      }
      return null as never;
    });
    setItem.mockResolvedValue(true);
    removeItem.mockResolvedValue(true);
    cleanupYjs.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("removes expired cache data but keeps active and unsynced data", async () => {
    await cleanupLocalData(30);

    expect(setItem).toHaveBeenCalledWith(
      IndexedDBKey.backgroundImages,
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({ id: "current" }),
          expect.objectContaining({ id: "recent" }),
        ]),
      })
    );
    expect(setItem).toHaveBeenCalledWith(
      IndexedDBKey.backgroundImageThumbnails,
      expect.objectContaining({
        contents: expect.not.arrayContaining([
          expect.objectContaining({ id: "expired" }),
        ]),
      })
    );
    expect(cleanupYjs).toHaveBeenCalledWith(
      "user-a",
      new Date("2026-07-21T00:00:00.000Z")
    );
  });
});
