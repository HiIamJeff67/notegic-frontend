// This shelf summary structure maybe different from the backend,

import { RootShelfNode } from "@shared/lib/shelf/shelfNodes.type";

export enum AnalysisStatus {
  Explored = "Explored",
  OnlySubShelves = "OnlySubShelves",
  OnlyMaterials = "OnlyMaterials",
  Unexplored = "Unexplored",
}

// Since we may require more information for the client user
export interface ShelfTreeSummary {
  root: RootShelfNode;
  estimatedByteSize: number;
  maxWidth: number;
  maxDepth: number;
  hasChanged: boolean;
  analysisStatus: AnalysisStatus;
}
