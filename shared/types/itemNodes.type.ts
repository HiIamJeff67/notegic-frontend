import { SupportedIcon } from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";

export type ItemType = "BlockPack" | "Material";

export interface MaterialNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  size: number;
  contentType: string;
  parseMediaType: string;
  objectKey: string;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
  nodeType: "Material";
}

export interface BlockPackNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  icon: SupportedIcon | null;
  headerBackgroundURL: string | null;
  blockCount: number;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
  nodeType: "BlockPack";
}
