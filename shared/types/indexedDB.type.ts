import type { UUID } from "crypto";
import { ImageContent, ImageInfo, ImageThumbnailInfo } from "./imageInfo.type";

export enum IndexedDBKey {
  backgroundImageThumbnails = "backgroundImageThumbnails",
  backgroundImages = "backgroundImages",
  blockPackYjsDocuments = "blockPackYjsDocuments",
  blockPackYjsRejectedDrafts = "blockPackYjsRejectedDrafts",
  currentBackgroundImage = "currentBackgroundImage",
  currentProfileCoverBackgroundImageId = "currentProfileCoverBackgroundImageId",
}

export interface BlockPackYjsDocumentCacheContent {
  blockPackId: UUID;
  update: Uint8Array;
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

export interface IndexedDBItem {
  [IndexedDBKey.backgroundImageThumbnails]: ImageThumbnailInfo | null;
  [IndexedDBKey.backgroundImages]: ImageInfo | null;
  [IndexedDBKey.blockPackYjsDocuments]: BlockPackYjsDocumentCache | null;
  [IndexedDBKey.blockPackYjsRejectedDrafts]: BlockPackYjsRejectedDraftCache | null;
  [IndexedDBKey.currentBackgroundImage]: ImageContent | null;
  [IndexedDBKey.currentProfileCoverBackgroundImageId]: UUID | null;
}
