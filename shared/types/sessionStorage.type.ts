import type { PendingOAuthState } from "@shared/types/redirectState.type";

export enum SessionStorageKey {
  csrfToken = "CSRFToken",
  pendingOAuthState = "PendingOAuthState",
  terrainSeed = "TerrainSeed",
}

export interface SessionStorageItem {
  [SessionStorageKey.csrfToken]: string | null;
  [SessionStorageKey.pendingOAuthState]: PendingOAuthState | null;
  [SessionStorageKey.terrainSeed]: number | null;
}
