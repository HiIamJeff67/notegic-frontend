import type { UUID } from "crypto";
import { ImageContent, ImageInfo, ImageThumbnailInfo } from "./imageInfo.type";

export enum IndexedDBKey {
  backgroundImageThumbnails = "backgroundImageThumbnails",
  backgroundImages = "backgroundImages",
  blockPackYjsDocuments = "blockPackYjsDocuments",
  blockPackYjsRejectedDrafts = "blockPackYjsRejectedDrafts",
  currentBackgroundImage = "currentBackgroundImage",
  currentProfileCoverBackgroundImageId = "currentProfileCoverBackgroundImageId",
  materialAttachments = "materialAttachments",
}

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

export interface MaterialAttachmentCacheContent {
  materialId: UUID;
  content: Blob;
  contentType: string;
  byteSize: number;
  sourceUpdatedAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface MaterialAttachmentCache {
  header: {
    totalSize: number;
  };
  contents: MaterialAttachmentCacheContent[];
}

export interface IndexedDBItem {
  [IndexedDBKey.backgroundImageThumbnails]: ImageThumbnailInfo | null;
  [IndexedDBKey.backgroundImages]: ImageInfo | null;
  [IndexedDBKey.blockPackYjsDocuments]: BlockPackYjsDocumentCache | null;
  [IndexedDBKey.blockPackYjsRejectedDrafts]: BlockPackYjsRejectedDraftCache | null;
  [IndexedDBKey.currentBackgroundImage]: ImageContent | null;
  [IndexedDBKey.currentProfileCoverBackgroundImageId]: UUID | null;
  [IndexedDBKey.materialAttachments]: MaterialAttachmentCache | null;
}
