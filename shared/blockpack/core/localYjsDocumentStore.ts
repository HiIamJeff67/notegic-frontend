import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import {
  BlockPackYjsDocumentCache,
  BlockPackYjsDocumentCacheContent,
  BlockPackYjsRejectedDraft,
  BlockPackYjsRejectedDraftCache,
  IndexedDBKey,
} from "@shared/types/indexedDB.type";
import type { UUID } from "crypto";

const getEmptyCache = (): BlockPackYjsDocumentCache => ({
  header: { totalSize: 0 },
  contents: [],
});

export class LocalYjsDocumentStore {
  static async load(
    blockPackId: UUID
  ): Promise<BlockPackYjsDocumentCacheContent | null> {
    const cache = await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.blockPackYjsDocuments
    );
    return (
      cache?.contents.find(item => item.blockPackId === blockPackId) ?? null
    );
  }

  static async save(
    blockPackId: UUID,
    update: Uint8Array,
    needsFlush: boolean
  ): Promise<void> {
    const cache =
      (await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.blockPackYjsDocuments
      )) ?? getEmptyCache();
    const nextContent: BlockPackYjsDocumentCacheContent = {
      blockPackId,
      update,
      byteSize: update.byteLength,
      needsFlush,
      updatedAt: new Date(),
    };
    const contents = [
      ...cache.contents.filter(item => item.blockPackId !== blockPackId),
      nextContent,
    ];
    const nextCache: BlockPackYjsDocumentCache = {
      header: {
        totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
      },
      contents,
    };
    const isSaved = await IndexedDBManipulator.setItem(
      IndexedDBKey.blockPackYjsDocuments,
      nextCache
    );
    if (!isSaved)
      throw new Error("Failed to persist local Yjs document cache.");
  }

  static async estimate(): Promise<{ totalSize: number; count: number }> {
    const cache = await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.blockPackYjsDocuments
    );
    return {
      totalSize: cache?.header.totalSize ?? 0,
      count: cache?.contents.length ?? 0,
    };
  }

  static async clear(): Promise<void> {
    const isRemoved = await IndexedDBManipulator.removeItem(
      IndexedDBKey.blockPackYjsDocuments
    );
    if (!isRemoved)
      throw new Error("Failed to clear local Yjs document cache.");
  }

  static async remove(blockPackId: UUID): Promise<void> {
    const cache = await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.blockPackYjsDocuments
    );
    if (!cache) return;

    const contents = cache.contents.filter(
      item => item.blockPackId !== blockPackId
    );
    if (contents.length === 0) {
      const isRemoved = await IndexedDBManipulator.removeItem(
        IndexedDBKey.blockPackYjsDocuments
      );
      if (!isRemoved) {
        throw new Error("Failed to remove local Yjs document cache.");
      }
      return;
    }

    const isSaved = await IndexedDBManipulator.setItem(
      IndexedDBKey.blockPackYjsDocuments,
      {
        header: {
          totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
        },
        contents,
      }
    );
    if (!isSaved) throw new Error("Failed to remove local Yjs document cache.");
  }

  static async saveRejectedDraft(
    blockPackId: UUID,
    update: Uint8Array
  ): Promise<void> {
    const cache = (await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.blockPackYjsRejectedDrafts
    )) ?? { header: { totalSize: 0 }, contents: [] };
    const draft: BlockPackYjsRejectedDraft = {
      blockPackId,
      update,
      byteSize: update.byteLength,
      createdAt: new Date(),
    };
    const contents = [
      ...cache.contents.filter(item => item.blockPackId !== blockPackId),
      draft,
    ];
    const nextCache: BlockPackYjsRejectedDraftCache = {
      header: {
        totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
      },
      contents,
    };
    const isSaved = await IndexedDBManipulator.setItem(
      IndexedDBKey.blockPackYjsRejectedDrafts,
      nextCache
    );
    if (!isSaved) throw new Error("Failed to persist rejected Yjs draft.");
  }

  static async loadRejectedDraft(
    blockPackId: UUID
  ): Promise<BlockPackYjsRejectedDraft | null> {
    const cache = await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.blockPackYjsRejectedDrafts
    );
    return (
      cache?.contents.find(item => item.blockPackId === blockPackId) ?? null
    );
  }

  static async removeRejectedDraft(blockPackId: UUID): Promise<void> {
    const cache = await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.blockPackYjsRejectedDrafts
    );
    if (!cache) return;
    const contents = cache.contents.filter(
      item => item.blockPackId !== blockPackId
    );
    if (contents.length === 0) {
      await IndexedDBManipulator.removeItem(
        IndexedDBKey.blockPackYjsRejectedDrafts
      );
      return;
    }
    await IndexedDBManipulator.setItem(
      IndexedDBKey.blockPackYjsRejectedDrafts,
      {
        header: {
          totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
        },
        contents,
      }
    );
  }
}
