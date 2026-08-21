import { localDB } from "@shared/api/local/db";
import { cleanupMaterialAttachmentCache } from "@shared/api/local/material-attachment.cache";
import { User } from "@shared/api/local/schemas";
import { LocalYjsDocumentStore } from "@shared/blockpack/core/localYjsDocumentStore";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import type {
  ImageInfo,
  ImageThumbnailInfo,
} from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { eq } from "drizzle-orm";

const getStoredTime = (value: Date | undefined, fallback = 0): number => {
  const time = value ? new Date(value).getTime() : fallback;
  return Number.isFinite(time) ? time : fallback;
};

export const cleanupLocalData = async (
  cleanupAfterDays: number
): Promise<void> => {
  const retentionDays = Math.max(1, Math.floor(cleanupAfterDays));
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  await cleanupMaterialAttachmentCache(cutoff);
  const [backgroundImages, thumbnails, currentBackgroundImage] =
    await Promise.all([
      IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImages),
      IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImageThumbnails),
      IndexedDBManipulator.getItemByKey(IndexedDBKey.currentBackgroundImage),
    ]);

  if (backgroundImages) {
    const retainedImages = backgroundImages.contents.filter(
      image =>
        image.id === currentBackgroundImage?.id ||
        getStoredTime(
          image.lastAccessedAt ?? image.createdAt ?? image.timestamp
        ) >= cutoff
    );
    const retainedImageIds = new Set(retainedImages.map(image => image.id));

    if (retainedImages.length !== backgroundImages.contents.length) {
      if (retainedImages.length === 0) {
        await IndexedDBManipulator.removeItem(IndexedDBKey.backgroundImages);
      } else {
        const nextBackgroundImages: ImageInfo = {
          header: {
            totalSize: retainedImages.reduce(
              (sum, image) => sum + (image.byteSize ?? image.file.size),
              0
            ),
          },
          contents: retainedImages,
        };
        await IndexedDBManipulator.setItem(
          IndexedDBKey.backgroundImages,
          nextBackgroundImages
        );
      }

      if (thumbnails) {
        const retainedThumbnails = thumbnails.contents.filter(thumbnail =>
          retainedImageIds.has(thumbnail.id)
        );
        if (retainedThumbnails.length === 0) {
          await IndexedDBManipulator.removeItem(
            IndexedDBKey.backgroundImageThumbnails
          );
        } else {
          const nextThumbnails: ImageThumbnailInfo = {
            header: {
              totalSize: retainedThumbnails.reduce(
                (sum, thumbnail) =>
                  sum + (thumbnail.byteSize ?? thumbnail.thumbnailURL.length),
                0
              ),
            },
            contents: retainedThumbnails,
          };
          await IndexedDBManipulator.setItem(
            IndexedDBKey.backgroundImageThumbnails,
            nextThumbnails
          );
        }
      }
    }
  }

  let userPublicId: string | null = null;
  try {
    if (localDB.isEnabled) {
      if (!localDB.isReady) await localDB.ensureReady();
      if (localDB.isReady) {
        userPublicId =
          (
            await localDB.query.User.findFirst({
              where: eq(User.isLoggedIn, true),
            })
          )?.publicId ?? null;
      }
    }
  } catch (error) {
    console.error("Failed to resolve local Yjs cleanup namespace.", error);
  }
  await LocalYjsDocumentStore.cleanup(userPublicId, new Date(cutoff));
};
