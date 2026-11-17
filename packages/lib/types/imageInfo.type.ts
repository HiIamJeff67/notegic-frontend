import type { UUID } from "crypto";

export interface ImageHeader {
  totalSize: number;
}

export interface ImageContent {
  id: UUID;
  contentType: string;
  file: File;
  timestamp: Date;
  byteSize?: number;
  createdAt?: Date;
  lastAccessedAt?: Date;
}

export interface ImageInfo {
  header: ImageHeader;
  contents: ImageContent[];
}

export interface ImageThumbnailContent {
  id: UUID;
  contentType: string;
  thumbnailURL: string;
  timestamp: Date;
  byteSize?: number;
  createdAt?: Date;
  lastAccessedAt?: Date;
}

export interface ImageThumbnailInfo {
  header: ImageHeader;
  contents: ImageThumbnailContent[];
}
