import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";

export interface MaterialMeta {
  id: UUID;
  parentId: UUID;
  rootId: UUID;
  name: string;
  size: number;
  contentType: string;
  parseMediaType: string;
  downloadURL: string | null;
  localContentURL?: string | null;
  path: UUID[];
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export const getDefaultMaterialMeta = (
  materialId: UUID,
  parentSubShelfId: UUID,
  rootShelfId: UUID = generateUUID()
): MaterialMeta => ({
  id: materialId,
  parentId: parentSubShelfId,
  rootId: rootShelfId,
  name: "Untitled",
  size: 0,
  contentType: "text/plain",
  parseMediaType: "",
  downloadURL: null,
  path: [],
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
});

export type MaterialMetaAction =
  | {
      type: "init";
      payload: MaterialMeta;
    }
  | { type: "setName"; newName: string }
  | { type: "setSize"; newSize: number }
  | { type: "setContentType"; newContentType: string }
  | { type: "setParseMediaType"; newParseMediaType: string }
  | { type: "setDownloadURL"; newDownloadURL: string | null }
  | { type: "setUpdatedAt"; newUpdatedAt: Date }
  | { type: "setCreatedAt"; newCreatedAt: Date };

export function materialMetaReducer(
  state: MaterialMeta,
  action: MaterialMetaAction
): MaterialMeta {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "setName":
      return { ...state, name: action.newName };
    case "setSize":
      return { ...state, size: action.newSize };
    case "setContentType":
      return { ...state, contentType: action.newContentType };
    case "setParseMediaType":
      return { ...state, parseMediaType: action.newParseMediaType };
    case "setDownloadURL":
      return { ...state, downloadURL: action.newDownloadURL };
    case "setUpdatedAt":
      return { ...state, updatedAt: action.newUpdatedAt };
    case "setCreatedAt":
      return { ...state, createdAt: action.newCreatedAt };
    default:
      return state;
  }
}
