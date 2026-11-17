import type { UUID } from "crypto";

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
