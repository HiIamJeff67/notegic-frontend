import { isLocalPreferenceEnabled } from "@/api/local/policy";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import {
  IndexedDBKey,
  type MaterialAttachmentCache,
  type MaterialAttachmentCacheContent,
} from "@shared/types/indexedDB.type";
import type { UUID } from "crypto";

const getCache = async (): Promise<MaterialAttachmentCache> =>
  (await IndexedDBManipulator.getItemByKey(
    IndexedDBKey.materialAttachments
  )) ?? {
    header: { totalSize: 0 },
    contents: [],
  };

export const loadMaterialAttachment = async (
  materialId: UUID,
  sourceUpdatedAt: Date
): Promise<Blob | null> => {
  if (!isLocalPreferenceEnabled("cacheAttachments")) return null;

  const cache = await getCache();
  const cached = cache.contents.find(item => item.materialId === materialId);
  if (!cached) return null;
  if (
    new Date(cached.sourceUpdatedAt).getTime() !==
    new Date(sourceUpdatedAt).getTime()
  ) {
    return null;
  }

  await IndexedDBManipulator.setItem(IndexedDBKey.materialAttachments, {
    header: cache.header,
    contents: cache.contents.map(item =>
      item.materialId === materialId
        ? { ...item, lastAccessedAt: new Date() }
        : item
    ),
  });
  return cached.content;
};

export const saveMaterialAttachment = async (
  materialId: UUID,
  sourceUpdatedAt: Date,
  content: Blob
): Promise<void> => {
  if (!isLocalPreferenceEnabled("cacheAttachments")) return;

  const cache = await getCache();
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
  const isSaved = await IndexedDBManipulator.setItem(
    IndexedDBKey.materialAttachments,
    {
      header: {
        totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
      },
      contents,
    }
  );
  if (!isSaved) throw new Error("Failed to persist material attachment cache.");
};

export const cleanupMaterialAttachmentCache = async (
  cutoff: number
): Promise<void> => {
  const cache = await IndexedDBManipulator.getItemByKey(
    IndexedDBKey.materialAttachments
  );
  if (!cache) return;

  const contents = cache.contents.filter(
    item => new Date(item.lastAccessedAt).getTime() >= cutoff
  );
  if (contents.length === cache.contents.length) return;
  if (contents.length === 0) {
    await IndexedDBManipulator.removeItem(IndexedDBKey.materialAttachments);
    return;
  }

  await IndexedDBManipulator.setItem(IndexedDBKey.materialAttachments, {
    header: {
      totalSize: contents.reduce((sum, item) => sum + item.byteSize, 0),
    },
    contents,
  });
};

export const estimateMaterialAttachmentCache = async (): Promise<{
  totalSize: number;
  count: number;
}> => {
  const cache = await IndexedDBManipulator.getItemByKey(
    IndexedDBKey.materialAttachments
  );
  return {
    totalSize: cache?.header.totalSize ?? 0,
    count: cache?.contents.length ?? 0,
  };
};

export const clearMaterialAttachmentCache = async (): Promise<void> => {
  await IndexedDBManipulator.removeItem(IndexedDBKey.materialAttachments);
};
