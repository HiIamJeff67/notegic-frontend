import { IndexedDB, IndexedDBKey } from "@shared/lib/storage/indexedDB";
import type { UUID } from "crypto";

export interface BlockPackYjsDocumentCacheContent {
  blockPackId: UUID;
  update: Uint8Array;
  stateVector: Uint8Array;
  byteSize: number;
  needsFlush: boolean;
  updatedAt: Date;
}

export interface BlockPackYjsDocumentCache {
  header: {
    totalSize: number;
  };
  contents: BlockPackYjsDocumentCacheContent[];
}

export interface BlockPackYjsRejectedDraft {
  blockPackId: UUID;
  update: Uint8Array;
  byteSize: number;
  createdAt: Date;
}

export interface BlockPackYjsRejectedDraftCache {
  header: {
    totalSize: number;
  };
  contents: BlockPackYjsRejectedDraft[];
}

export class LocalYjsDocumentStore {
  private static readOnly = false;

  static setReadOnly(value: boolean): void {
    LocalYjsDocumentStore.readOnly = value;
  }

  static async load(
    userPublicId: string | null,
    blockPackId: UUID
  ): Promise<BlockPackYjsDocumentCacheContent | null> {
    if (!userPublicId) return null;
    const cache = await IndexedDB.getItemByKey(
      IndexedDBKey.blockPackYjsDocuments,
      userPublicId
    );
    return (
      cache?.contents.find(item => item.blockPackId === blockPackId) ?? null
    );
  }

  static async save(
    userPublicId: string | null,
    blockPackId: UUID,
    update: Uint8Array,
    stateVector: Uint8Array,
    needsFlush: boolean
  ): Promise<void> {
    if (LocalYjsDocumentStore.readOnly) {
      throw new Error("local database is in read-only recovery mode");
    }
    if (!userPublicId) return;

    const nextContent: BlockPackYjsDocumentCacheContent = {
      blockPackId,
      update,
      stateVector,
      byteSize: update.byteLength + stateVector.byteLength,
      needsFlush,
      updatedAt: new Date(),
    };
    const isSaved = await IndexedDB.updateItem(
      IndexedDBKey.blockPackYjsDocuments,
      cache => {
        const contents = [
          ...(
            cache ?? { header: { totalSize: 0 }, contents: [] }
          ).contents.filter(item => item.blockPackId !== blockPackId),
          nextContent,
        ];
        return {
          header: {
            totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
          },
          contents,
        };
      },
      userPublicId
    );
    if (!isSaved) {
      throw new Error("Failed to persist local Yjs document cache.");
    }
  }

  static async estimate(
    userPublicId: string | null
  ): Promise<{ totalSize: number; count: number }> {
    if (!userPublicId) return { totalSize: 0, count: 0 };
    const cache = await IndexedDB.getItemByKey(
      IndexedDBKey.blockPackYjsDocuments,
      userPublicId
    );
    return {
      totalSize: cache?.header.totalSize ?? 0,
      count: cache?.contents.length ?? 0,
    };
  }

  static async clear(userPublicId: string | null): Promise<void> {
    if (LocalYjsDocumentStore.readOnly) {
      throw new Error("local database is in read-only recovery mode");
    }
    if (!userPublicId) return;
    const [
      isRemoved,
      isRejectedDraftRemoved,
      isLegacyRemoved,
      isLegacyDraftRemoved,
    ] = await Promise.all([
      IndexedDB.removeItem(IndexedDBKey.blockPackYjsDocuments, userPublicId),
      IndexedDB.removeItem(
        IndexedDBKey.blockPackYjsRejectedDrafts,
        userPublicId
      ),
      IndexedDB.removeItem(IndexedDBKey.blockPackYjsDocuments),
      IndexedDB.removeItem(IndexedDBKey.blockPackYjsRejectedDrafts),
    ]);
    if (
      !isRemoved ||
      !isRejectedDraftRemoved ||
      !isLegacyRemoved ||
      !isLegacyDraftRemoved
    ) {
      throw new Error("Failed to clear local Yjs document cache.");
    }
  }

  static async remove(
    userPublicId: string | null,
    blockPackId: UUID
  ): Promise<void> {
    if (LocalYjsDocumentStore.readOnly) {
      throw new Error("local database is in read-only recovery mode");
    }
    if (!userPublicId) return;
    const isSaved = await IndexedDB.updateItem(
      IndexedDBKey.blockPackYjsDocuments,
      cache => {
        const contents = (
          cache ?? { header: { totalSize: 0 }, contents: [] }
        ).contents.filter(item => item.blockPackId !== blockPackId);
        return {
          header: {
            totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
          },
          contents,
        };
      },
      userPublicId
    );
    if (!isSaved) throw new Error("Failed to remove local Yjs document cache.");
  }

  static async cleanup(
    userPublicId: string | null,
    cutoff: Date
  ): Promise<void> {
    if (LocalYjsDocumentStore.readOnly) {
      throw new Error("local database is in read-only recovery mode");
    }
    if (!userPublicId) return;
    const isSaved = await IndexedDB.updateItem(
      IndexedDBKey.blockPackYjsDocuments,
      cache => {
        const contents = (
          cache ?? { header: { totalSize: 0 }, contents: [] }
        ).contents.filter(item => item.needsFlush || item.updatedAt >= cutoff);
        return {
          header: {
            totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
          },
          contents,
        };
      },
      userPublicId
    );
    if (!isSaved) {
      throw new Error("Failed to clean up local Yjs document cache.");
    }
  }

  static async saveRejectedDraft(
    userPublicId: string | null,
    blockPackId: UUID,
    update: Uint8Array
  ): Promise<void> {
    if (LocalYjsDocumentStore.readOnly) {
      throw new Error("local database is in read-only recovery mode");
    }
    if (!userPublicId) return;
    const draft: BlockPackYjsRejectedDraft = {
      blockPackId,
      update,
      byteSize: update.byteLength,
      createdAt: new Date(),
    };
    const isSaved = await IndexedDB.updateItem(
      IndexedDBKey.blockPackYjsRejectedDrafts,
      cache => {
        const contents = [
          ...(
            cache ?? { header: { totalSize: 0 }, contents: [] }
          ).contents.filter(item => item.blockPackId !== blockPackId),
          draft,
        ];
        return {
          header: {
            totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
          },
          contents,
        };
      },
      userPublicId
    );
    if (!isSaved) throw new Error("Failed to persist rejected Yjs draft.");
  }

  static async loadRejectedDraft(
    userPublicId: string | null,
    blockPackId: UUID
  ): Promise<BlockPackYjsRejectedDraft | null> {
    if (!userPublicId) return null;
    const cache = await IndexedDB.getItemByKey(
      IndexedDBKey.blockPackYjsRejectedDrafts,
      userPublicId
    );
    return (
      cache?.contents.find(item => item.blockPackId === blockPackId) ?? null
    );
  }

  static async removeRejectedDraft(
    userPublicId: string | null,
    blockPackId: UUID
  ): Promise<void> {
    if (!userPublicId) return;
    const isSaved = await IndexedDB.updateItem(
      IndexedDBKey.blockPackYjsRejectedDrafts,
      cache => {
        const contents = (
          cache ?? { header: { totalSize: 0 }, contents: [] }
        ).contents.filter(item => item.blockPackId !== blockPackId);
        return {
          header: {
            totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
          },
          contents,
        };
      },
      userPublicId
    );
    if (!isSaved) throw new Error("Failed to remove rejected Yjs draft.");
  }
}
