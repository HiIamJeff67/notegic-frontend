import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { BlockPackNode, MaterialNode } from "@shared/lib/shelf/itemNodes.type";
import type { UUID } from "crypto";

type ShelfType = "RootShelf" | "SubShelf";

/**
 * Note that we don't implement the deletedAt field here,
 *           since if the node is deleted, it should be put in the trash can
 *           in the frontend scenario
 */

export interface SubShelfNode {
  id: UUID;
  rootShelfId: UUID;
  prevSubShelfId: UUID | null;
  name: string;
  path: UUID[];
  updatedAt: Date;
  createdAt: Date;

  isExpanded: boolean; // to indicate whether the data below this sub shelf is fetched or not
  children: Record<UUID, SubShelfNode>;
  materialNodes: Record<UUID, MaterialNode>;
  blockPackNodes: Record<UUID, BlockPackNode>;

  // to indicate this sub shelf is currently open and available to see things below it,
  // which means even if the data is fetched, the user can still toggle this value for frontend display
  isOpen: boolean;
  nodeType: "SubShelf";
}

export interface RootShelfNode {
  id: UUID;
  name: string;
  subShelfCount: number;
  itemCount: number;
  lastAnalyzedAt: Date;
  updatedAt: Date;
  createdAt: Date;
  permission: AccessControlPermission;

  isExpanded: boolean;
  children: Record<UUID, SubShelfNode>;
  isOpen: boolean;
  nodeType: "RootShelf";
}
