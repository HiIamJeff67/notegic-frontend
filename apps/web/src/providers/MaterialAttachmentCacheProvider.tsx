import { IndexedDB, IndexedDBKey } from "@shared/lib/storage/indexedDB";
import { type MaterialAttachmentCacheContent } from "@shared/lib/storage/materialAttachmentCache.type";
import type { UUID } from "crypto";
import { createContext, type ReactNode } from "react";
import { isLocalPreferenceEnabled } from "@/api/local/policy";

export const loadMaterialAttachment = async (
  materialId: UUID,
  sourceUpdatedAt: Date
): Promise<Blob | null> => {
  if (!isLocalPreferenceEnabled("cacheAttachments")) return null;

  const cache = (await IndexedDB.getItemByKey(
    IndexedDBKey.materialAttachments
  )) ?? {
    header: { totalSize: 0 },
    contents: [],
  };
  const cached = cache.contents.find(item => item.materialId === materialId);
  if (!cached) return null;
  if (
    new Date(cached.sourceUpdatedAt).getTime() !==
    new Date(sourceUpdatedAt).getTime()
  ) {
    return null;
  }

  await IndexedDB.setItem(IndexedDBKey.materialAttachments, {
    header: cache.header,
    contents: cache.contents.map(item =>
      item.materialId === materialId
        ? { ...item, lastAccessedAt: new Date() }
        : item
    ),
  });
  return cached.content;
};

export const setCachedMaterialAttachment = async (
  materialId: UUID,
  sourceUpdatedAt: Date,
  content: Blob
): Promise<void> => {
  if (!isLocalPreferenceEnabled("cacheAttachments")) return;

  const cache = (await IndexedDB.getItemByKey(
    IndexedDBKey.materialAttachments
  )) ?? {
    header: { totalSize: 0 },
    contents: [],
  };
  const now = new Date();
  const nextContent: MaterialAttachmentCacheContent = {
    materialId,
    content,
    contentType: content.type,
    byteSize: content.size,
    sourceUpdatedAt,
    createdAt: now,
    lastAccessedAt: now,
  };
  const contents = [
    ...cache.contents.filter(item => item.materialId !== materialId),
    nextContent,
  ];
  const isSaved = await IndexedDB.setItem(IndexedDBKey.materialAttachments, {
    header: {
      totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
    },
    contents,
  });
  if (!isSaved) throw new Error("Failed to persist material attachment cache.");
};

export const cleanupMaterialAttachmentCache = async (
  cutoff: number
): Promise<void> => {
  const cache = await IndexedDB.getItemByKey(IndexedDBKey.materialAttachments);
  if (!cache) return;

  const contents = cache.contents.filter(
    item => new Date(item.lastAccessedAt).getTime() >= cutoff
  );
  if (contents.length === cache.contents.length) return;
  if (contents.length === 0) {
    await IndexedDB.removeItem(IndexedDBKey.materialAttachments);
    return;
  }

  await IndexedDB.setItem(IndexedDBKey.materialAttachments, {
    header: {
      totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
    },
    contents,
  });
};

export const estimateMaterialAttachmentCache =
  async (): Promise<MaterialAttachmentCacheEstimate> => {
    const cache = await IndexedDB.getItemByKey(
      IndexedDBKey.materialAttachments
    );
    return {
      totalSize: cache?.header.totalSize ?? 0,
      count: cache?.contents.length ?? 0,
    };
  };

export const clearMaterialAttachmentCache = async (): Promise<void> => {
  await IndexedDB.removeItem(IndexedDBKey.materialAttachments);
};

export interface MaterialAttachmentCacheEstimate {
  totalSize: number;
  count: number;
}

export interface MaterialAttachmentCacheContextType {
  load: (materialId: UUID, sourceUpdatedAt: Date) => Promise<Blob | null>;
  set: (
    materialId: UUID,
    sourceUpdatedAt: Date,
    content: Blob
  ) => Promise<void>;
  cleanup: (cutoff: number) => Promise<void>;
  estimate: () => Promise<MaterialAttachmentCacheEstimate>;
  clear: () => Promise<void>;
}

export const MaterialAttachmentCacheContext = createContext<
  MaterialAttachmentCacheContextType | undefined
>(undefined);

export const MaterialAttachmentCacheProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <MaterialAttachmentCacheContext.Provider
      value={{
        load: loadMaterialAttachment,
        set: setCachedMaterialAttachment,
        cleanup: cleanupMaterialAttachmentCache,
        estimate: estimateMaterialAttachmentCache,
        clear: clearMaterialAttachmentCache,
      }}
    >
      {children}
    </MaterialAttachmentCacheContext.Provider>
  );
};
